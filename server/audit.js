export async function appendAudit(client, { tenantId, userId, entityType, entityId = null, action, oldValue = null, newValue = null }) {
  await client.query(`INSERT INTO audit_log (tenant_id,user_id,entity_type,entity_id,action,old_value,new_value)
    VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb)`, [tenantId, userId, entityType, entityId, action, JSON.stringify(oldValue), JSON.stringify(newValue)]);
}
