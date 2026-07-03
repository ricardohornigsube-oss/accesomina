-- Ley 21.719 readiness: tenant-scoped processing register, rights, consent and privacy incidents.
CREATE TABLE IF NOT EXISTS privacy_processing_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL, purpose TEXT NOT NULL, legal_basis TEXT NOT NULL,
  data_categories JSONB NOT NULL DEFAULT '[]'::jsonb, subject_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  recipients JSONB NOT NULL DEFAULT '[]'::jsonb, sensitive_data BOOLEAN NOT NULL DEFAULT FALSE,
  international_transfer BOOLEAN NOT NULL DEFAULT FALSE, retention_days INTEGER CHECK(retention_days BETWEEN 1 AND 36500),
  security_measures TEXT NOT NULL DEFAULT '', risk_level TEXT NOT NULL DEFAULT 'medio' CHECK(risk_level IN ('bajo','medio','alto')),
  status TEXT NOT NULL DEFAULT 'activo' CHECK(status IN ('borrador','activo','suspendido','cerrado')),
  updated_by UUID REFERENCES app_users(id) ON DELETE SET NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id,name)
);
CREATE TABLE IF NOT EXISTS privacy_rights_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK(request_type IN ('acceso','rectificacion','supresion','oposicion','bloqueo','portabilidad')),
  subject_name TEXT NOT NULL, subject_email TEXT NOT NULL, subject_rut TEXT, details TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'recibida' CHECK(status IN ('recibida','verificacion','en_proceso','respondida','rechazada','cerrada')),
  due_at TIMESTAMPTZ NOT NULL, response_notes TEXT NOT NULL DEFAULT '', assigned_to UUID REFERENCES app_users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ, created_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS privacy_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subject_ref TEXT NOT NULL, subject_name TEXT NOT NULL, purpose TEXT NOT NULL, notice_version TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('otorgado','revocado')), source TEXT NOT NULL DEFAULT 'digital',
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb, granted_at TIMESTAMPTZ, revoked_at TIMESTAMPTZ,
  created_by UUID REFERENCES app_users(id) ON DELETE SET NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS privacy_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL, severity TEXT NOT NULL CHECK(severity IN ('baja','media','alta','critica')),
  description TEXT NOT NULL, detected_at TIMESTAMPTZ NOT NULL, affected_subjects INTEGER NOT NULL DEFAULT 0 CHECK(affected_subjects>=0),
  data_categories JSONB NOT NULL DEFAULT '[]'::jsonb, containment_actions TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'abierto' CHECK(status IN ('abierto','contenido','investigacion','notificado','cerrado')),
  agency_notified_at TIMESTAMPTZ, subjects_notified_at TIMESTAMPTZ, closed_at TIMESTAMPTZ,
  created_by UUID REFERENCES app_users(id) ON DELETE SET NULL, updated_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_privacy_requests_tenant_status ON privacy_rights_requests(tenant_id,status,due_at);
CREATE INDEX IF NOT EXISTS idx_privacy_incidents_tenant_status ON privacy_incidents(tenant_id,status,detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_privacy_consents_tenant_subject ON privacy_consents(tenant_id,subject_ref,created_at DESC);
ALTER TABLE privacy_processing_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_rights_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_privacy_activities ON privacy_processing_activities USING (tenant_id::text=current_setting('app.current_tenant_id',true)) WITH CHECK (tenant_id::text=current_setting('app.current_tenant_id',true));
CREATE POLICY tenant_privacy_requests ON privacy_rights_requests USING (tenant_id::text=current_setting('app.current_tenant_id',true)) WITH CHECK (tenant_id::text=current_setting('app.current_tenant_id',true));
CREATE POLICY tenant_privacy_consents ON privacy_consents USING (tenant_id::text=current_setting('app.current_tenant_id',true)) WITH CHECK (tenant_id::text=current_setting('app.current_tenant_id',true));
CREATE POLICY tenant_privacy_incidents ON privacy_incidents USING (tenant_id::text=current_setting('app.current_tenant_id',true)) WITH CHECK (tenant_id::text=current_setting('app.current_tenant_id',true));
ALTER TABLE privacy_processing_activities FORCE ROW LEVEL SECURITY;
ALTER TABLE privacy_rights_requests FORCE ROW LEVEL SECURITY;
ALTER TABLE privacy_consents FORCE ROW LEVEL SECURITY;
ALTER TABLE privacy_incidents FORCE ROW LEVEL SECURITY;
