import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, closeDatabase } from '../db.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const dir=path.join(root,'database/postgres');
const lockClient=await pool.connect();
try {
  // Prevent two freshly deployed replicas from applying the same migration.
  await lockClient.query('SELECT pg_advisory_lock($1)',[724252132]);
  await lockClient.query(`CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  const files=(await fs.readdir(dir)).filter(f=>/^\d+.*\.sql$/.test(f)).sort();
  for(const file of files){
    const exists=await lockClient.query('SELECT 1 FROM schema_migrations WHERE filename=$1',[file]);
    if(exists.rowCount)continue;
    const sql=await fs.readFile(path.join(dir,file),'utf8');
    try{await lockClient.query('BEGIN');await lockClient.query(sql);await lockClient.query('INSERT INTO schema_migrations(filename) VALUES($1)',[file]);await lockClient.query('COMMIT');console.log(`Applied ${file}`);}catch(error){await lockClient.query('ROLLBACK');throw error;}
  }
} finally {
  await lockClient.query('SELECT pg_advisory_unlock($1)',[724252132]).catch(()=>{});
  lockClient.release();
  await closeDatabase();
}
