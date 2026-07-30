import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../../', import.meta.url);
const html = fs.readFileSync(new URL('AccesoMina_v6.html', root), 'utf8');
const production = fs.readFileSync(new URL('public/index.html', root), 'utf8');
const script = fs.readFileSync(new URL('assets/nexo-klar-enterprise.js', root), 'utf8');
const productionScript = fs.readFileSync(new URL('public/assets/nexo-klar-enterprise.js', root), 'utf8');
const styles = fs.readFileSync(new URL('assets/nexo-klar-enterprise.css', root), 'utf8');
const productionStyles = fs.readFileSync(new URL('public/assets/nexo-klar-enterprise.css', root), 'utf8');

test('enterprise enhancements are loaded and production assets stay synchronized', () => {
  assert.match(html, /assets\/nexo-klar-enterprise\.css/);
  assert.match(html, /assets\/nexo-klar-enterprise\.js/);
  assert.equal(html, production);
  assert.equal(script, productionScript);
  assert.equal(styles, productionStyles);
});

test('requested management improvements are implemented as tenant state', () => {
  for (const stateCollection of [
    'uiRolePreferences', 'alertWorkflow', 'operationTasks', 'signatureReminders',
    'communicationTemplates', 'communicationHistory', 'portalReviews',
    'trainingMatrices', 'healthRiskMatrices', 'importValidations',
    'temporalPreferences', 'monthlyClosures'
  ]) {
    assert.match(script, new RegExp(`S\\.${stateCollection}`), `missing tenant collection ${stateCollection}`);
  }
});

test('commercial, people, compliance and operational enhancements are available', () => {
  for (const feature of [
    'renderDashboardPreferences', 'renderManagedAlerts', 'renderOperationsPlanning',
    'renderOpportunityProjection', 'renderContractReminders', 'injectServiceManagement',
    'renderSubcontractCompliance', 'renderRecruitmentKanban', 'renderPermanentStructure',
    'renderEppInventoryBridge', 'renderTrainingMatrix', 'renderHealthMatrix',
    'renderCommunicationsGovernance', 'renderPortalReviewQueue',
    'renderAuditConfidence', 'installImportPreview', 'installTemporalToolbar',
    'renderTemporalAnalysis'
  ]) {
    assert.match(script, new RegExp(`function ${feature}\\(`), `missing feature ${feature}`);
  }
});

test('temporal analysis and immutable monthly closure are available', () => {
  assert.match(script, /Este mes/);
  assert.match(script, /Últimos 12 meses/);
  assert.match(script, /Rango personalizado/);
  assert.match(script, /function periodMetrics\(/);
  assert.match(script, /Cierre mensual operativo/);
  assert.match(script, /Este mes ya tiene un cierre registrado/);
  assert.match(script, /status: "cerrado"/);
  assert.match(script, /function closureDigest\(/);
  assert.match(script, /Solo administración puede realizar el cierre mensual/);
  assert.match(script, /renderWithTemporalCollection\("turnos"/);
  assert.match(script, /renderWithTemporalCollection\("incidentes"/);
  assert.match(script, /renderWithTemporalCollection\("callouts"/);
});

test('mass import checks the complete file and reports internal duplicates', () => {
  assert.match(script, /const allRows = lines\.map\(parseCsvLine\)/);
  assert.match(script, /RUT repetido dentro del archivo/);
  assert.match(script, /downloadImportErrors128/);
});
