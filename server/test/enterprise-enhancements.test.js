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
    'trainingMatrices', 'healthRiskMatrices', 'importValidations'
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
    'renderAuditConfidence', 'installImportPreview'
  ]) {
    assert.match(script, new RegExp(`function ${feature}\\(`), `missing feature ${feature}`);
  }
});

test('mass import checks the complete file and reports internal duplicates', () => {
  assert.match(script, /const allRows = lines\.map\(parseCsvLine\)/);
  assert.match(script, /RUT repetido dentro del archivo/);
  assert.match(script, /downloadImportErrors128/);
});
