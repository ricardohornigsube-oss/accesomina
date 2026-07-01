import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeJson, summarizeChanges, validateTenantState } from '../validation.js';

const validState=()=>({trabajadores:[{id:'w1',rut:'14.567.890-1',nombre:'Persona'}],minas:[{id:'m1',nombre:'Mina'}],contratos:[{id:'c1',minaId:'m1'}],mantenciones:[{id:'p1',minaId:'m1',contratoId:'c1',inicio:'2026-01-01',termino:'2026-01-02'}],asignaciones:[{trabId:'w1',mantId:'p1'}]});
test('state accepts valid relationships',()=>assert.equal(validateTenantState(validState()).trabajadores.length,1));
test('state rejects duplicate worker RUT',()=>{const state=validState();state.trabajadores.push({id:'w2',rut:'14.567.890-1'});assert.throws(()=>validateTenantState(state),/Duplicate worker RUT/);});
test('state rejects cross-reference errors',()=>{const state=validState();state.asignaciones[0].trabId='missing';assert.throws(()=>validateTenantState(state),/unknown worker/);});
test('sanitizer removes executable markup and embedded files',()=>{const clean=sanitizeJson({name:'<img src=x onerror="bad">',fileData:'data:secret',cloudUrl:'javascript:alert(1)'});assert.equal(clean.name.includes('<'),false);assert.equal(clean.fileData,null);assert.equal(clean.cloudUrl,'');});
test('audit change summary records changed paths',()=>{const changes=summarizeChanges({a:1,b:2},{a:2,b:2});assert.deepEqual(changes,[{path:'/a',before:1,after:2}]);});
