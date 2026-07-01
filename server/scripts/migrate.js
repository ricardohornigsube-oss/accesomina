import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, closeDatabase } from '../db.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const dir=path.join(root,'database/postgres');
await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
const files=(await fs.readdir(dir)).filter(f=>/^\d+.*\.sql$/.test(f)).sort();
for(const file of files){const exists=await pool.query('SELECT 1 FROM schema_migrations WHERE filename=$1',[file]);if(exists.rowCount)continue;const sql=await fs.readFile(path.join(dir,file),'utf8');const client=await pool.connect();try{await client.query('BEGIN');await client.query(sql);await client.query('INSERT INTO schema_migrations(filename) VALUES($1)',[file]);await client.query('COMMIT');console.log(`Applied ${file}`);}catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}}
await closeDatabase();
