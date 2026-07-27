import test from 'node:test';
import assert from 'node:assert/strict';
import { canTransitionWorkBookEntry, workBookFolio } from '../work-book.js';
import { validateTenantState } from '../validation.js';

function validState() {
  return {
    minas: [{ id: 'mine-1', nombre: 'Cliente Uno', mandante: 'Mandante Uno' }],
    contratos: [{ id: 'contract-1', minaId: 'mine-1' }],
    mantenciones: [{ id: 'project-1', minaId: 'mine-1', contratoId: 'contract-1' }],
    trabajadores: [],
    asignaciones: [],
    hoteles: [],
    hotelAsig: [],
    firmas: [],
    callouts: [],
    waGroups: [],
    permisosTrabajo: [],
    incidentes: [],
    subcontratos: [],
    vehiculos: [],
    eppDeliveries: [],
    eppMeasurements: {},
    opportunities: [],
    workBookEntries: [{
      id: 'entry-1',
      folio: 'LOD-2026-00001',
      entryNumber: 1,
      mineRef: 'mine-1',
      contractRef: 'contract-1',
      projectRef: 'project-1',
      subject: 'Inicio de servicio',
      body: 'Se entrega terreno y se inicia la ejecución.',
      status: 'borrador'
    }]
  };
}

test('work book folio is deterministic and padded', () => {
  assert.equal(workBookFolio(2026, 7), 'LOD-2026-00007');
});

test('work book workflow protects signed and closed entries', () => {
  assert.equal(canTransitionWorkBookEntry('borrador', 'pendiente_firma'), true);
  assert.equal(canTransitionWorkBookEntry('pendiente_firma', 'firmado'), true);
  assert.equal(canTransitionWorkBookEntry('firmado', 'borrador'), false);
  assert.equal(canTransitionWorkBookEntry('cerrado', 'observado'), false);
});

test('tenant state accepts a correctly scoped work book entry', () => {
  assert.doesNotThrow(() => validateTenantState(validState()));
});

test('tenant state rejects a work book entry from another client scope', () => {
  const state = validState();
  state.minas.push({ id: 'mine-2', nombre: 'Cliente Dos', mandante: 'Mandante Dos' });
  state.workBookEntries[0].mineRef = 'mine-2';
  assert.throws(() => validateTenantState(state), error => error.code === 'WORK_BOOK_SCOPE_MISMATCH');
});

test('tenant state rejects duplicate work book entry numbers', () => {
  const state = validState();
  state.workBookEntries.push({ ...state.workBookEntries[0], id: 'entry-2' });
  assert.throws(() => validateTenantState(state), error => error.code === 'DUPLICATE_WORK_BOOK_ENTRY');
});
