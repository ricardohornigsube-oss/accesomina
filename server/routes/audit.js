import { Router } from 'express';
import { withTenant } from '../db.js';
export const auditRouter=Router();
auditRouter.get('/',async(req,res)=>{const limit=Math.min(200,Math.max(1,Number(req.query.limit||100))),offset=Math.max(0,Number(req.query.offset||0));const result=await withTenant(req.auth.tenantId,client=>client.query(`SELECT a.id,a.entity_type,a.entity_id,a.action,a.old_value,a.new_value,a.created_at,u.email AS user_email,u.full_name AS user_name
  FROM audit_log a LEFT JOIN app_users u ON u.id=a.user_id WHERE a.tenant_id=$1 ORDER BY a.created_at DESC LIMIT $2 OFFSET $3`,[req.auth.tenantId,limit,offset]));res.json(result.rows);});
