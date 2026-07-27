import { Router } from 'express';
import { z } from 'zod';
import { withTenant } from '../db.js';
import { allowRoles } from '../middleware.js';
import { appendAudit } from '../audit.js';
import { sanitizeJson } from '../validation.js';
import { canTransitionWorkBookEntry, workBookFolio } from '../work-book.js';

export const workBooksRouter = Router();
const editors = allowRoles('domian_admin', 'client_admin', 'rrhh', 'prevencion', 'acreditacion');
const text = (min, max) => z.string().trim().min(min).max(max);
const entryStates = ['borrador', 'pendiente_firma', 'observado', 'firmado', 'cerrado'];
const evidenceSchema = z.array(z.object({
  objectId: z.string().uuid().optional(),
  name: text(1, 260),
  size: z.number().nonnegative().max(10 * 1024 * 1024).optional(),
  type: z.string().max(160).optional(),
  uploadedAt: z.string().datetime().optional()
})).max(20).default([]);

const entrySchema = z.object({
  mineRef: text(1, 160),
  contractRef: z.string().trim().max(160).default(''),
  projectRef: text(1, 160),
  bookType: z.enum(['maestro', 'seguridad_hsec', 'calidad', 'terreno_avance', 'comunicaciones']).default('maestro'),
  bookTitle: text(3, 240),
  entryType: z.enum(['instruccion', 'consulta', 'respuesta', 'avance', 'incidente', 'acuerdo', 'observacion', 'recepcion', 'otro']),
  occurredAt: z.string().datetime(),
  subject: text(3, 240),
  body: text(3, 12000),
  responsible: z.string().trim().max(200).default(''),
  dueAt: z.string().date().nullable().optional(),
  status: z.enum(entryStates).default('borrador'),
  evidenceFiles: evidenceSchema
});

const updateSchema = z.object({
  status: z.enum(entryStates),
  subject: z.string().trim().min(3).max(240).optional(),
  body: z.string().trim().min(3).max(12000).optional(),
  responsible: z.string().trim().max(200).optional(),
  dueAt: z.string().date().nullable().optional(),
  reason: text(3, 2000),
  evidenceFiles: evidenceSchema.optional()
});


async function tenantRefs(client, tenantId) {
  const rows = await client.query(
    `SELECT module_key,data FROM tenant_module_state
     WHERE tenant_id=$1 AND module_key=ANY($2::text[])`,
    [tenantId, ['minas', 'contratos', 'mantenciones']]
  );
  return Object.fromEntries(rows.rows.map(row => [row.module_key, Array.isArray(row.data) ? row.data : []]));
}

function validateReferences(refs, body) {
  const mine = refs.minas?.find(row => String(row.id) === body.mineRef);
  const contract = body.contractRef ? refs.contratos?.find(row => String(row.id) === body.contractRef) : null;
  const project = refs.mantenciones?.find(row => String(row.id) === body.projectRef);
  if (!mine || !project || (body.contractRef && !contract)) {
    throw Object.assign(new Error('Cliente, contrato o proyecto no existe en esta empresa'), { status: 409, code: 'INVALID_WORK_BOOK_REFERENCE' });
  }
  if (String(project.minaId || '') !== body.mineRef || (contract && String(contract.minaId || '') !== body.mineRef)) {
    throw Object.assign(new Error('El contrato o proyecto no pertenece al cliente seleccionado'), { status: 409, code: 'WORK_BOOK_SCOPE_MISMATCH' });
  }
}

const selectEntries = `
  SELECT e.*,b.folio,b.mine_ref,b.contract_ref,b.project_ref,b.book_type,b.title AS book_title,
         u.full_name AS created_by_name
  FROM work_book_entries e
  JOIN work_books b ON b.id=e.book_id AND b.tenant_id=e.tenant_id
  LEFT JOIN app_users u ON u.id=e.created_by
`;

workBooksRouter.get('/entries', async (req, res) => {
  const values = [req.auth.tenantId], clauses = ['e.tenant_id=$1'];
  const add = (sql, value) => { values.push(value); clauses.push(sql.replace('?', `$${values.length}`)); };
  if (req.query.mineRef) add('b.mine_ref=?', String(req.query.mineRef));
  if (req.query.contractRef) add('b.contract_ref=?', String(req.query.contractRef));
  if (req.query.projectRef) add('b.project_ref=?', String(req.query.projectRef));
  if (req.query.status) add('e.status=?', String(req.query.status));
  if (req.query.type) add('e.entry_type=?', String(req.query.type));
  if (req.query.year) add('EXTRACT(YEAR FROM e.occurred_at)=?', Number(req.query.year));
  if (req.query.month) add('EXTRACT(MONTH FROM e.occurred_at)=?', Number(req.query.month));
  if (req.query.q) {
    values.push(`%${String(req.query.q).slice(0, 120)}%`);
    clauses.push(`(e.subject ILIKE $${values.length} OR e.body ILIKE $${values.length} OR b.folio ILIKE $${values.length})`);
  }
  const rows = await withTenant(req.auth.tenantId, client =>
    client.query(`${selectEntries} WHERE ${clauses.join(' AND ')} ORDER BY e.occurred_at DESC,e.entry_number DESC LIMIT 1000`, values)
  );
  res.json(rows.rows);
});

workBooksRouter.get('/entries/:id', async (req, res) => {
  const result = await withTenant(req.auth.tenantId, async client => {
    const entry = (await client.query(`${selectEntries} WHERE e.tenant_id=$1 AND e.id=$2`, [req.auth.tenantId, req.params.id])).rows[0];
    if (!entry) return null;
    const history = (await client.query(
      `SELECT h.*,u.full_name AS changed_by_name FROM work_book_entry_history h
       LEFT JOIN app_users u ON u.id=h.changed_by
       WHERE h.tenant_id=$1 AND h.entry_id=$2 ORDER BY h.changed_at DESC`,
      [req.auth.tenantId, req.params.id]
    )).rows;
    return { ...entry, history };
  });
  if (!result) return res.status(404).json({ error: 'WORK_BOOK_ENTRY_NOT_FOUND' });
  res.json(result);
});

workBooksRouter.post('/entries', editors, async (req, res) => {
  const body = entrySchema.parse(req.body);
  const row = await withTenant(req.auth.tenantId, async client => {
    validateReferences(await tenantRefs(client, req.auth.tenantId), body);
    const year = new Date(body.occurredAt).getUTCFullYear();
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`work-book:${req.auth.tenantId}:${year}`]);
    let book = (await client.query(
      `SELECT * FROM work_books WHERE tenant_id=$1 AND mine_ref=$2 AND COALESCE(contract_ref,'')=$3
       AND project_ref=$4 AND book_type=$5 AND status<>'cerrado' ORDER BY opened_at DESC LIMIT 1`,
      [req.auth.tenantId, body.mineRef, body.contractRef, body.projectRef, body.bookType]
    )).rows[0];
    if (!book) {
      const sequence = Number((await client.query(
        'SELECT count(*)+1 AS sequence FROM work_books WHERE tenant_id=$1 AND EXTRACT(YEAR FROM opened_at)=$2',
        [req.auth.tenantId, year]
      )).rows[0].sequence);
      book = (await client.query(
        `INSERT INTO work_books(tenant_id,folio,mine_ref,contract_ref,project_ref,book_type,title,opened_at,created_by)
         VALUES($1,$2,$3,NULLIF($4,''),$5,$6,$7,$8,$9) RETURNING *`,
        [req.auth.tenantId, workBookFolio(year, sequence), body.mineRef, body.contractRef, body.projectRef, body.bookType, body.bookTitle, body.occurredAt.slice(0, 10), req.auth.userId]
      )).rows[0];
    }
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`work-book-entry:${book.id}`]);
    const entryNumber = Number((await client.query(
      'SELECT COALESCE(max(entry_number),0)+1 AS sequence FROM work_book_entries WHERE tenant_id=$1 AND book_id=$2',
      [req.auth.tenantId, book.id]
    )).rows[0].sequence);
    const signatureState = body.status === 'pendiente_firma' ? 'pendiente' : body.status === 'firmado' ? 'firmado' : 'sin_firma';
    const entry = (await client.query(
      `INSERT INTO work_book_entries(tenant_id,book_id,entry_number,entry_type,occurred_at,subject,body,responsible,due_at,status,signature_state,evidence_files,created_by)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13) RETURNING *`,
      [req.auth.tenantId, book.id, entryNumber, body.entryType, body.occurredAt, body.subject, body.body, body.responsible, body.dueAt || null, body.status, signatureState, JSON.stringify(sanitizeJson(body.evidenceFiles)), req.auth.userId]
    )).rows[0];
    await client.query(
      `INSERT INTO work_book_entry_history(tenant_id,entry_id,action,reason,new_value,changed_by)
       VALUES($1,$2,'creada','Creación de anotación',$3::jsonb,$4)`,
      [req.auth.tenantId, entry.id, JSON.stringify(sanitizeJson(entry)), req.auth.userId]
    );
    await appendAudit(client, { tenantId: req.auth.tenantId, userId: req.auth.userId, entityType: 'work_book_entry', entityId: entry.id, action: 'work_book.entry.created', newValue: { folio: book.folio, entryNumber, status: body.status, projectRef: body.projectRef } });
    return { ...entry, folio: book.folio, mine_ref: book.mine_ref, contract_ref: book.contract_ref, project_ref: book.project_ref, book_type: book.book_type, book_title: book.title };
  });
  res.status(201).json(row);
});

workBooksRouter.patch('/entries/:id', editors, async (req, res) => {
  const body = updateSchema.parse(req.body);
  const result = await withTenant(req.auth.tenantId, async client => {
    const before = (await client.query('SELECT * FROM work_book_entries WHERE tenant_id=$1 AND id=$2 FOR UPDATE', [req.auth.tenantId, req.params.id])).rows[0];
    if (!before) return null;
    if (!canTransitionWorkBookEntry(before.status, body.status)) {
      throw Object.assign(new Error(`No se puede cambiar el estado de ${before.status} a ${body.status}`), { status: 409, code: 'INVALID_WORK_BOOK_TRANSITION' });
    }
    const contentChanged = ['subject', 'body', 'responsible', 'dueAt', 'evidenceFiles'].some(key => body[key] !== undefined);
    if (contentChanged && ['firmado', 'cerrado'].includes(before.status)) {
      throw Object.assign(new Error('Una anotación firmada o cerrada no puede editarse; agregue una anotación rectificatoria'), { status: 409, code: 'WORK_BOOK_ENTRY_IMMUTABLE' });
    }
    const signatureState = body.status === 'pendiente_firma' ? 'pendiente' : body.status === 'firmado' ? 'firmado' : before.signature_state;
    const updated = (await client.query(
      `UPDATE work_book_entries SET status=$3,subject=COALESCE($4,subject),body=COALESCE($5,body),
       responsible=COALESCE($6,responsible),due_at=CASE WHEN $7::boolean THEN $8::date ELSE due_at END,
       evidence_files=COALESCE($9::jsonb,evidence_files),signature_state=$10,updated_at=now()
       WHERE tenant_id=$1 AND id=$2 RETURNING *`,
      [req.auth.tenantId, req.params.id, body.status, body.subject ?? null, body.body ?? null, body.responsible ?? null,
        Object.hasOwn(body, 'dueAt'), body.dueAt || null, body.evidenceFiles === undefined ? null : JSON.stringify(sanitizeJson(body.evidenceFiles)), signatureState]
    )).rows[0];
    await client.query(
      `INSERT INTO work_book_entry_history(tenant_id,entry_id,action,reason,old_value,new_value,changed_by)
       VALUES($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7)`,
      [req.auth.tenantId, req.params.id, before.status === body.status ? 'actualizada' : 'estado_cambiado', body.reason, JSON.stringify(sanitizeJson(before)), JSON.stringify(sanitizeJson(updated)), req.auth.userId]
    );
    await appendAudit(client, { tenantId: req.auth.tenantId, userId: req.auth.userId, entityType: 'work_book_entry', entityId: req.params.id, action: 'work_book.entry.updated', oldValue: { status: before.status }, newValue: { status: updated.status, reason: body.reason } });
    return updated;
  });
  if (!result) return res.status(404).json({ error: 'WORK_BOOK_ENTRY_NOT_FOUND' });
  res.json(result);
});
