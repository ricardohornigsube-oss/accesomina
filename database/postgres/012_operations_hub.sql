-- Operations hub: document trust, workflows, notifications, client portal and retention.
CREATE TABLE IF NOT EXISTS operational_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  source TEXT NOT NULL, severity TEXT NOT NULL CHECK(severity IN ('info','warning','error','critical')),
  event_type TEXT NOT NULL, message TEXT NOT NULL, context JSONB NOT NULL DEFAULT '{}'::jsonb,
  resolved_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS document_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  file_id UUID REFERENCES file_objects(id) ON DELETE SET NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL,
  document_type TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'cargado' CHECK(status IN ('cargado','enviado','en_revision','observado','corregido','aprobado','rechazado')),
  assigned_to UUID REFERENCES app_users(id) ON DELETE SET NULL, due_at TIMESTAMPTZ, issuer TEXT NOT NULL DEFAULT '',
  document_number TEXT NOT NULL DEFAULT '', issued_at DATE, expires_at DATE, checks JSONB NOT NULL DEFAULT '{}'::jsonb,
  score INTEGER NOT NULL DEFAULT 0 CHECK(score BETWEEN 0 AND 100), observations TEXT NOT NULL DEFAULT '',
  reviewed_by UUID REFERENCES app_users(id) ON DELETE SET NULL, reviewed_at TIMESTAMPTZ,
  created_by UUID REFERENCES app_users(id) ON DELETE SET NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id,entity_type,entity_id,document_type,document_number)
);
CREATE TABLE IF NOT EXISTS notification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL, channel TEXT NOT NULL CHECK(channel IN ('email','whatsapp','report')),
  audience JSONB NOT NULL DEFAULT '{}'::jsonb, template TEXT NOT NULL, schedule_rule TEXT NOT NULL DEFAULT 'manual',
  next_run_at TIMESTAMPTZ, status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('draft','active','paused','completed','failed')),
  last_run_at TIMESTAMPTZ, last_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES app_users(id) ON DELETE SET NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id,name)
);
CREATE TABLE IF NOT EXISTS mandante_portal_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL, full_name TEXT NOT NULL, mine_id TEXT NOT NULL, scopes JSONB NOT NULL DEFAULT '["view"]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE, expires_at TIMESTAMPTZ, last_access_at TIMESTAMPTZ,
  created_by UUID REFERENCES app_users(id) ON DELETE SET NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id,email,mine_id)
);
CREATE TABLE IF NOT EXISTS tenant_form_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL, module_key TEXT NOT NULL, fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  workflow JSONB NOT NULL DEFAULT '{}'::jsonb, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES app_users(id) ON DELETE SET NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id,module_key,name)
);
CREATE TABLE IF NOT EXISTS retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  data_category TEXT NOT NULL, retention_days INTEGER NOT NULL CHECK(retention_days BETWEEN 1 AND 36500),
  action TEXT NOT NULL CHECK(action IN ('review','anonymize','delete')), legal_hold BOOLEAN NOT NULL DEFAULT FALSE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE, last_evaluated_at TIMESTAMPTZ,
  created_by UUID REFERENCES app_users(id) ON DELETE SET NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id,data_category)
);

CREATE INDEX IF NOT EXISTS idx_operational_events_tenant ON operational_events(tenant_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_verifications_queue ON document_verifications(tenant_id,status,due_at);
CREATE INDEX IF NOT EXISTS idx_notification_jobs_due ON notification_jobs(status,next_run_at) WHERE status='active';
CREATE INDEX IF NOT EXISTS idx_mandante_access_tenant ON mandante_portal_access(tenant_id,mine_id,active);

DO $$ DECLARE t TEXT; BEGIN FOREACH t IN ARRAY ARRAY['operational_events','document_verifications','notification_jobs','mandante_portal_access','tenant_form_definitions','retention_policies'] LOOP
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I',t);
  EXECUTE format('CREATE POLICY tenant_isolation ON %I USING (tenant_id::text=current_setting(''app.current_tenant_id'',true)) WITH CHECK (tenant_id::text=current_setting(''app.current_tenant_id'',true))',t);
  EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',t);
END LOOP; END $$;
