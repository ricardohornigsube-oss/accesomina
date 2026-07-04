-- Accelerate content-addressed reuse. Uploads also use an advisory lock per tenant/hash.
CREATE INDEX IF NOT EXISTS idx_file_objects_tenant_sha_active
  ON file_objects(tenant_id,sha256) WHERE deleted_at IS NULL;
