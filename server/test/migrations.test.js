import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';

test('all PostgreSQL migrations apply in order', async () => {
  const db=new PGlite();const dir=path.resolve('database/postgres');
  const files=(await fs.readdir(dir)).filter(f=>/^\d+.*\.sql$/.test(f)).sort();
  for(const file of files) {const sql=(await fs.readFile(path.join(dir,file),'utf8')).replace(/CREATE EXTENSION IF NOT EXISTS pgcrypto;/g,'');await db.exec(sql);}
  const tables=await db.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
  const names=new Set(tables.rows.map(r=>r.tablename));
  for(const required of ['tenants','app_users','tenant_state','user_sessions','file_objects','integration_events','audit_log'])assert.equal(names.has(required),true,`missing ${required}`);
  const trigger=await db.query("SELECT tgname FROM pg_trigger WHERE tgname='trg_audit_immutable'");assert.equal(trigger.rows.length,1);
  const tenant=await db.query('SELECT id FROM tenants LIMIT 1');
  await db.query("INSERT INTO audit_log(tenant_id,entity_type,action) VALUES($1,'test','created')",[tenant.rows[0].id]);
  await assert.rejects(()=>db.query("UPDATE audit_log SET action='changed'"),/append-only/);
  const policies=await db.query("SELECT tablename FROM pg_policies WHERE policyname LIKE 'tenant_%'");assert.ok(policies.rows.length>=18);
  await db.close();
});
