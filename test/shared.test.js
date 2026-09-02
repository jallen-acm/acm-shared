import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  COLORS, can, isEmployeeSession, OrderStatus, friendlyStatus, transactionTotal,
  buildTrackerSteps, unitPricing, money, agingAmount, isActiveOrder,
} from '../src/index.js';

test('brand colors are the logo values', () => {
  assert.equal(COLORS.navy, '#212b67');
  assert.equal(COLORS.red, '#CE2029');
});

test('can() keys off the Rights array', () => {
  const session = { WebTrackUser: { Rights: [{ Name: 'ViewOrders' }, { Name: 'MakingCheckAccountPayments' }] } };
  assert.equal(can(session, 'viewOrders'), true);
  assert.equal(can(session, 'viewInvoices'), false);
  assert.equal(can(session, 'makePayments'), true);
  assert.equal(can(session, 'payByCard'), false);
  assert.equal(can(session, 'somethingUnknown'), true);
  assert.equal(can({}, 'viewOrders'), true, 'missing Rights -> allowed');
});

test('can() honours the ordering master switch', () => {
  const session = { WebTrackUser: { Rights: [{ Name: 'PlaceOrders' }] } };
  assert.equal(can(session, 'placeOrders'), true);
  assert.equal(can(session, 'placeOrders', { enableOrdering: false }), false);
});

test('employee detection: no positive CustomerId', () => {
  assert.equal(isEmployeeSession({ CustomerId: -1 }), true);
  assert.equal(isEmployeeSession({ CustomerId: 0 }), true);
  assert.equal(isEmployeeSession({ CustomerId: 42 }), false);
});

test('order status helpers', () => {
  assert.equal(friendlyStatus(OrderStatus.AwaitingDelivery, 'x', { pickup: true }), 'Ready for Pickup');
  assert.equal(friendlyStatus(15), 'Accepted');
  assert.equal(transactionTotal({ GoodsTotal: 100, TotalTax: 6 }), 106);
  assert.equal(transactionTotal({ TotalAmount: 50, GoodsTotal: 1 }), 50);
  assert.equal(isActiveOrder({ StatusID: OrderStatus.Invoiced }), false);
  const t = buildTrackerSteps(OrderStatus.AwaitingStock);
  assert.equal(t.steps[0].key, 'stock');
  assert.equal(t.activeIndex, 0);
  assert.equal(buildTrackerSteps(14), null);
});

test('lineal-foot pricing converts per-each to per-foot', () => {
  const r = unitPricing({ SellPerText: 'Lineal Foot', Length: 120 }, 173);
  assert.equal(r.display, 17.3);
  assert.equal(r.eachPrice, 173);
});

test('formatting and aging field', () => {
  assert.equal(money(1234.5), '$1,234.50');
  assert.equal(money(null), '—');
  assert.equal(agingAmount({ ValueOfTransactions: 12 }), 12);
  assert.equal(agingAmount({ Balance: 7 }), 7);
});
