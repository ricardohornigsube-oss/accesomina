import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../../AccesoMina_v6.html', import.meta.url), 'utf8');
const production = fs.readFileSync(new URL('../../public/index.html', import.meta.url), 'utf8');

test('local and production frontends remain identical', () => {
  assert.equal(html, production);
});

test('workspace navigation covers commercial, people, operations and administration', () => {
  for (const workspace of ['comercial', 'personas', 'operaciones', 'administracion']) {
    assert.match(html, new RegExp(`${workspace}:\\{label:`));
  }
  for (const criticalPage of ['dashboard', 'mineras', 'trabajadores', 'mantenciones', 'reportes']) {
    assert.match(html, new RegExp(`'${criticalPage}'`));
  }
});

test('professional cloud forms replace critical company and permission prompts', () => {
  assert.match(html, /modal-cloud-tenant-v126/);
  assert.match(html, /saveCloudTenantV126/);
  assert.match(html, /modal-cloud-user-v126/);
  assert.match(html, /saveCloudUserV126/);
  assert.match(html, /AccesoMinaCloud\.createTenantAdmin=openCloudTenantV126/);
  assert.match(html, /AccesoMinaCloud\.editUser=openCloudUserV126/);
});

test('visible terminology supports multiple industries without changing legacy data keys', () => {
  for (const neutralLabel of [
    'Clientes 360°',
    'Gestión de personal temporal',
    'Personal permanente',
    'Habilitación por cliente',
    'Cumplimiento corporativo',
    'Alojamiento y estadías',
    'Credenciales de acceso',
    'Registro operacional'
  ]) assert.ok(html.includes(neutralLabel), `missing neutral label: ${neutralLabel}`);

  assert.match(html, /function translateClientTerminology/);
  assert.match(html, /const plural=.*replacement=plural\?'clientes':'cliente'/);
});
