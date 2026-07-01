import { Router } from 'express';
import { withTenant } from '../db.js';
import { appendAudit } from '../audit.js';
import { allowRoles } from '../middleware.js';
import { hashPassword, normalizeEmail, randomToken, validatePassword } from '../security.js';
import { userSchema } from '../validation.js';

export const usersRouter = Router();
usersRouter.get('/', async (req, res) => {
  const result = await withTenant(req.auth.tenantId, client => client.query('SELECT id,email,full_name,role,active,last_login_at,created_at FROM app_users WHERE tenant_id=$1 ORDER BY full_name', [req.auth.tenantId]));
  res.json(result.rows);
});
usersRouter.post('/', allowRoles('domian_admin','client_admin'), async (req, res) => {
  const body = userSchema.parse(req.body); const temporary = body.password || `${randomToken(10)}Aa1`;
  if (!validatePassword(temporary)) return res.status(400).json({ error: 'WEAK_PASSWORD' });
  const credentials = await hashPassword(temporary), email = normalizeEmail(body.email);
  const row = await withTenant(req.auth.tenantId, async client => {
    const result = await client.query(`INSERT INTO app_users (tenant_id,email,full_name,role,password_hash,password_salt,must_change_password)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id,email,full_name,role,active,created_at`, [req.auth.tenantId,email,body.fullName,body.role,credentials.hash,credentials.salt,!body.password]);
    await appendAudit(client, { tenantId:req.auth.tenantId,userId:req.auth.userId,entityType:'user',entityId:result.rows[0].id,action:'user.created',newValue:{email,role:body.role} });
    return result.rows[0];
  });
  res.status(201).json({ user: row, temporaryPassword: body.password ? undefined : temporary });
});
usersRouter.patch('/:id', allowRoles('domian_admin','client_admin'), async (req, res) => {
  const role = req.body.role, active = req.body.active;
  if (role && !['client_admin','rrhh','prevencion','acreditacion','consulta'].includes(role)) return res.status(400).json({ error:'INVALID_ROLE' });
  if (req.params.id === req.auth.userId && active === false) return res.status(409).json({ error:'CANNOT_DISABLE_SELF' });
  const row = await withTenant(req.auth.tenantId, async client => {
    const before = await client.query('SELECT id,email,role,active FROM app_users WHERE id=$1 AND tenant_id=$2', [req.params.id,req.auth.tenantId]);
    if (!before.rows[0]) return null;
    const result = await client.query('UPDATE app_users SET role=COALESCE($3,role),active=COALESCE($4,active),updated_at=now() WHERE id=$1 AND tenant_id=$2 RETURNING id,email,full_name,role,active', [req.params.id,req.auth.tenantId,role,typeof active==='boolean'?active:null]);
    await appendAudit(client,{tenantId:req.auth.tenantId,userId:req.auth.userId,entityType:'user',entityId:req.params.id,action:'user.updated',oldValue:before.rows[0],newValue:result.rows[0]});return result.rows[0];
  });
  if(!row)return res.status(404).json({error:'USER_NOT_FOUND'});res.json(row);
});
