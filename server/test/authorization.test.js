import test from 'node:test';
import assert from 'node:assert/strict';
import { enforceStateScope } from '../validation.js';

test('RRHH can change workers but not company settings',()=>{enforceStateScope('rrhh',{trabajadores:[]},{trabajadores:[{id:'1'}]});assert.throws(()=>enforceStateScope('rrhh',{empresa:{nombre:'A'}},{empresa:{nombre:'B'}}),/cannot modify/);});
test('client administrator may change all tenant modules',()=>assert.doesNotThrow(()=>enforceStateScope('client_admin',{empresa:{}},{empresa:{nombre:'A'}})));
