-- EPP management: measurements, role/risk requirements, inventory and traceable deliveries.
CREATE TABLE IF NOT EXISTS worker_epp_measurements (
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  clothing_size TEXT, shoe_size TEXT, glove_size TEXT, helmet_size TEXT,
  head_cm NUMERIC(5,2), hand_cm NUMERIC(5,2), height_cm NUMERIC(5,2), weight_kg NUMERIC(6,2),
  harness_size TEXT, respirator_size TEXT, fit_test_date DATE, notes TEXT,
  updated_by UUID REFERENCES app_users(id), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, worker_id)
);
CREATE TABLE IF NOT EXISTS epp_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL, category TEXT NOT NULL, applicable_roles TEXT[] NOT NULL DEFAULT '{}', risks TEXT[] NOT NULL DEFAULT '{}',
  certification_required BOOLEAN NOT NULL DEFAULT TRUE, replacement_days INTEGER, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS epp_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id), project_id UUID REFERENCES projects(id), catalog_id UUID REFERENCES epp_catalog(id),
  item_name TEXT NOT NULL, quantity INTEGER NOT NULL CHECK(quantity > 0), size TEXT, brand_model TEXT,
  certification TEXT, lot_serial TEXT, delivered_at DATE NOT NULL, replace_at DATE, condition TEXT NOT NULL DEFAULT 'nuevo',
  training_done BOOLEAN NOT NULL DEFAULT FALSE, receipt_file_id UUID REFERENCES file_objects(id),
  delivered_by UUID REFERENCES app_users(id), returned_at DATE, return_reason TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_epp_delivery_worker ON epp_deliveries(tenant_id, worker_id, delivered_at DESC);
ALTER TABLE worker_epp_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE epp_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE epp_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_worker_epp_measurements ON worker_epp_measurements USING (tenant_id::text=current_setting('app.current_tenant_id',true)) WITH CHECK (tenant_id::text=current_setting('app.current_tenant_id',true));
CREATE POLICY tenant_epp_catalog ON epp_catalog USING (tenant_id::text=current_setting('app.current_tenant_id',true)) WITH CHECK (tenant_id::text=current_setting('app.current_tenant_id',true));
CREATE POLICY tenant_epp_deliveries ON epp_deliveries USING (tenant_id::text=current_setting('app.current_tenant_id',true)) WITH CHECK (tenant_id::text=current_setting('app.current_tenant_id',true));
