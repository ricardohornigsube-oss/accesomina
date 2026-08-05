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
    "'Cliente'",
    'Órdenes de Servicio',
    'Gestión de personal por proyecto',
    'Trabajador fijo',
    'Habilitación por cliente',
    'Cumplimiento corporativo',
    'Alojamiento y estadías',
    'Credenciales de acceso',
    'Libro de Obra'
  ]) assert.ok(html.includes(neutralLabel), `missing neutral label: ${neutralLabel}`);

  assert.match(html, /function translateClientTerminology/);
  assert.match(html, /const plural=.*replacement=plural\?'clientes':'cliente'/);
});

test('people navigation is centralized with fixed, project, available and restricted views', () => {
  const peopleStart = html.indexOf('<div class="nav-group-label">Personas</div>');
  const operationsStart = html.indexOf('<div class="nav-group-label">Operación</div>');
  const peopleNavigation = html.slice(peopleStart, operationsStart);

  assert.match(peopleNavigation, /onclick="nav\('trabajadores'\)"/);
  assert.doesNotMatch(peopleNavigation, /onclick="nav\('personal-planta'\)"/);
  for (const label of ['Trabajador fijo', 'Trabajador por proyecto', 'Trabajador disponible', 'Restringidos']) {
    assert.ok(html.includes(label), `missing people view: ${label}`);
  }
  assert.match(html, /currentTrabTab==='disponible'/);
  assert.match(html, /if\(page==='personal-planta'\)/);
});

test('work book remains visible in the Inicio group', () => {
  const generalStart = html.indexOf('<div class="nav-group-label">Inicio</div>');
  const commercialStart = html.indexOf('<div class="nav-group-label">Relación comercial</div>');
  const generalNavigation = html.slice(generalStart, commercialStart);

  assert.match(generalNavigation, /id="nav-work-book-v125"/);
  assert.match(generalNavigation, /📖 Libro de Obra/);
  assert.ok(
    generalNavigation.indexOf("nav('libro-obras')") > generalNavigation.indexOf("nav('operaciones-cloud')"),
    'Libro de Obra must appear after Centro Operativo'
  );
});
