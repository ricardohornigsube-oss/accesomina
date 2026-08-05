import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../../AccesoMina_v6.html', import.meta.url), 'utf8');
const production = fs.readFileSync(new URL('../../public/index.html', import.meta.url), 'utf8');
const enterpriseCss = fs.readFileSync(new URL('../../assets/nexo-klar-enterprise.css', import.meta.url), 'utf8');

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
  const peopleStart = html.indexOf('<div class="nav-group-label">Capital humano</div>');
  const operationsStart = html.indexOf('<div class="nav-group-label">Gestión operacional</div>');
  const peopleNavigation = html.slice(peopleStart, operationsStart);

  assert.match(peopleNavigation, /onclick="nav\('trabajadores'\)"/);
  assert.doesNotMatch(peopleNavigation, /onclick="nav\('personal-planta'\)"/);
  for (const label of ['Trabajador fijo', 'Trabajador por proyecto', 'Trabajador disponible', 'Restringidos']) {
    assert.ok(html.includes(label), `missing people view: ${label}`);
  }
  assert.match(html, /currentTrabTab==='disponible'/);
  assert.match(html, /if\(page==='personal-planta'\)/);
});

test('visible worker restriction language is standardized without changing internal state keys', () => {
  for (const label of ['Calificar / restringir', 'Personas restringidas', 'Restringidos']) {
    assert.ok(html.includes(label), `missing restriction label: ${label}`);
  }
  assert.match(html, /\[\/\\bbloqueado\\b\/gi,'restringido'\]/);
  assert.match(html, /bloqueado:\s*false/);
});

test('work book remains visible in the project and business management group', () => {
  const generalStart = html.indexOf('<div class="nav-group-label">Gestión de proyectos y negocios</div>');
  const nextStart = html.indexOf('<div class="nav-group-label">Activos, equipos e inventario</div>');
  const generalNavigation = html.slice(generalStart, nextStart);

  assert.match(generalNavigation, /id="nav-work-book-v125"/);
  assert.match(generalNavigation, /📖 Libro de Obra/);
  assert.ok(generalNavigation.includes("nav('oportunidades')"));
});

test('contractor and asset workspaces reuse operational data instead of creating silos', () => {
  for (const label of ['Contratistas', 'Activos, equipos e inventario', 'Contratos y convenios', 'Bodegas y almacenes', 'Movimientos de inventario']) {
    assert.ok(html.includes(label), `missing workspace entry: ${label}`);
  }
  for (const fn of ['renderContractorWorkspaceV146', 'renderAssetsWorkspaceV146', 'saveInventoryItemV146', 'saveContractorEvaluationV146']) {
    assert.match(html, new RegExp(`function ${fn}`));
  }
  assert.match(html, /subcontractComplianceV144\(row\)/);
  assert.match(html, /S\.inventoryMovements\.unshift/);
});

test('private workspace uses one visual system for typography, controls and data tables', () => {
  for (const token of ['--font-sans', '--space-4', '--radius-md', '--focus-ring']) {
    assert.ok(html.includes(token), `missing UI token: ${token}`);
  }
  for (const rule of ['body.private .section-header', 'body.private .table-wrap', 'body.private .tab-bar', 'body.private .modal', 'body.private .nav-item']) {
    assert.ok(enterpriseCss.includes(rule), `missing private UI rule: ${rule}`);
  }
  assert.match(html, /button, input, select, textarea \{ font:inherit; \}/);
});
