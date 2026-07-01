import { Router } from 'express';
import { withTenant } from '../db.js';
import { appendAudit } from '../audit.js';
import { allowRoles } from '../middleware.js';
import { enforceStateScope, summarizeChanges, validateTenantState } from '../validation.js';

export const stateRouter = Router();
const editors = allowRoles('domian_admin','client_admin','rrhh','prevencion','acreditacion');

stateRouter.get('/', async (req, res) => {
  const result = await withTenant(req.auth.tenantId, client => client.query('SELECT state,version,updated_at FROM tenant_state WHERE tenant_id=$1', [req.auth.tenantId]));
  const row = result.rows[0] || { state: {}, version: 0, updated_at: null };
  res.set('ETag', `"${row.version}"`).json(row);
});

stateRouter.put('/', editors, async (req, res) => {
  const expected = Number(req.get('if-match')?.replace(/"/g, '') || req.body.version);
  if (!Number.isSafeInteger(expected) || expected < 0) return res.status(428).json({ error: 'VERSION_REQUIRED' });
  const state = validateTenantState(req.body.state);
  const result = await withTenant(req.auth.tenantId, async client => {
    const old = await client.query('SELECT state,version FROM tenant_state WHERE tenant_id=$1 FOR UPDATE', [req.auth.tenantId]);
    const current = old.rows[0];
    if (!current || Number(current.version) !== expected) return null;
    enforceStateScope(req.auth.role,current.state,state);
    const updated = await client.query(`UPDATE tenant_state SET state=$2::jsonb,version=version+1,updated_by=$3,updated_at=now()
      WHERE tenant_id=$1 RETURNING state,version,updated_at`, [req.auth.tenantId, JSON.stringify(state), req.auth.userId]);
    const changes=summarizeChanges(current.state,state);
    await appendAudit(client, { tenantId: req.auth.tenantId, userId: req.auth.userId, entityType: 'tenant_state', action: 'state.updated', oldValue: { version: current.version }, newValue: { version: updated.rows[0].version, reason:String(req.body.reason||'Actualización operacional').slice(0,500), changes } });
    return updated.rows[0];
  });
  if (!result) return res.status(409).json({ error: 'VERSION_CONFLICT', message: 'Another user updated the company data. Reload before saving.' });
  res.set('ETag', `"${result.version}"`).json(result);
});
