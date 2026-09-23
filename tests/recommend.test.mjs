import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseCSV, recommend } from '../engine.mjs';

const data = parseCSV(readFileSync(new URL('../data/racket_dataset.csv', import.meta.url), 'utf8'));

test('catalogue has unique valid models and traceable VNB prices', () => {
  assert.equal(data.length, 50);
  assert.equal(new Set(data.map(r => r.name)).size, data.length);
  const vnb = data.filter(r => r.priceSource.startsWith('VNB'));
  assert.equal(vnb.length, 6);
  assert.ok(vnb.every(r => r.priceUrl.startsWith('https://shopvnb.com/') && r.price > 0));
});

test('budget is a hard cap; unpriced rackets stay separate', () => {
  const output = recommend(data, { attack: 7, defense: 7.5, budget: 1.5 });
  assert.ok(output.affordable.length > 0);
  assert.ok(output.affordable.every(r => r.price !== null && r.price <= 1.5));
  assert.equal(output.unpriced.length, 8);
  assert.ok(output.unpriced.every(r => r.price === null));
  assert.ok(output.affordable[0].score >= output.affordable[1].score);
});

test('brand filter and price boundary do not leak other rackets', () => {
  const exact = recommend(data, { attack: 7, defense: 7, budget: 1.399, brand: 'Yonex' });
  assert.ok(exact.affordable.some(r => r.name === 'Yonex Astrox 88 Play'));
  assert.ok(exact.affordable.every(r => r.brand === 'Yonex'));
  const lower = recommend(data, { attack: 7, defense: 7, budget: 1.398, brand: 'Yonex' });
  assert.ok(!lower.affordable.some(r => r.name === 'Yonex Astrox 88 Play'));
});

test('quoted CSV cells and missing price parse correctly', () => {
  const text = 'Ten_Vot,Diem_Cong,Diem_Thu,Gia_Trieu,Phong_Cach\n"Demo, X",7,8,,"Công, thủ"\n';
  assert.deepEqual(parseCSV(text)[0].name, 'Demo, X');
  assert.equal(parseCSV(text)[0].price, null);
});
