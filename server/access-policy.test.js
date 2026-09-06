import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccess, ROLE } from './access-policy.js';

test('only admin can change master data', () => {
  assert.equal(canAccess(ROLE.ADMIN, 'master-data:write'), true);
  assert.equal(canAccess(ROLE.PENYALURAN, 'master-data:write'), false);
});

test('penyaluran can advance a decision but surveyor cannot disburse PPD', () => {
  assert.equal(canAccess(ROLE.PENYALURAN, 'mustahik:decision'), true);
  assert.equal(canAccess(ROLE.SURVEYOR, 'ppd:write'), false);
});

test('only authenticated operational roles can export PII', () => {
  assert.equal(canAccess(ROLE.ADMIN, 'laporan:export'), true);
  assert.equal(canAccess(undefined, 'laporan:export'), false);
});
