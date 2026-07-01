import { Router } from 'express';
import { query, withTenant } from '../db.js';
import { appendAudit } from '../audit.js';
import { allowRoles } from '../middleware.js';

export const tenantsRouter=Router();
tenantsRouter.use(allowRoles('domian_admin'));
tenantsRouter.get('/',async(req,res)=>{const result=await query(`SELECT t.id,t.company_name,t.rut,t.admin_email,t.phone,t.status,t.created_at,t.updated_at,
  count(u.id) FILTER (WHERE u.active) AS active_users FROM tenants t LEFT JOIN app_users u ON u.tenant_id=t.id GROUP BY t.id ORDER BY t.company_name`);res.json(result.rows);});
tenantsRouter.patch('/:id',async(req,res)=>{const status=req.body.status;if(!['active','suspended'].includes(status))return res.status(400).json({error:'INVALID_STATUS'});const before=await query('SELECT id,company_name,status FROM tenants WHERE id=$1',[req.params.id]);if(!before.rows[0])return res.status(404).json({error:'TENANT_NOT_FOUND'});const result=await query('UPDATE tenants SET status=$2,updated_at=now() WHERE id=$1 RETURNING id,company_name,rut,admin_email,status,updated_at',[req.params.id,status]);await withTenant(req.params.id,client=>appendAudit(client,{tenantId:req.params.id,userId:null,entityType:'tenant',entityId:req.params.id,action:`tenant.${status}`,oldValue:before.rows[0],newValue:result.rows[0]}));if(status==='suspended')await query('UPDATE user_sessions SET revoked_at=now() WHERE tenant_id=$1',[req.params.id]);res.json(result.rows[0]);});
