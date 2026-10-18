const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseTransaction, summarize, insight } = require('../src/finance.cjs');

test('English and Arabic transactions produce categories and integer piastres', () => {
  assert.deepEqual(parseTransaction('Spent 120 on lunch'), { description: 'Spent 120 on lunch', amount: 12000, type: 'expense', category: 'Food' });
  assert.equal(parseTransaction('دفعت ٥٠٫٥٠ مواصلات').amount, 5050);
  assert.equal(parseTransaction('دفعت ٥٠ مواصلات').category, 'Transport');
  assert.equal(parseTransaction('قبضت ١٥٬٠٠٠ مرتب').type, 'income');
  assert.equal(parseTransaction('Paid 30 for stationery').category, 'Other');
});

test('rejects invalid, ambiguous and unsupported input', () => {
  for (const input of ['', 'hello', 'Spent 0 food', 'Spent -20 food', 'Spent 1.234 food', 'Spent 20 lunch and 30 taxi', 'Spent 20 USD', 'Received 100 and paid rent', '120 lunch']) {
    assert.throws(() => parseTransaction(input), undefined, input);
  }
});

test('adding and removing transactions recalculates the dashboard', () => {
  const transactions = ['Received 1000 salary', 'Spent 120 lunch', 'Paid 50 taxi'].map(parseTransaction);
  assert.deepEqual(summarize(transactions), { income: 100000, expenses: 17000, balance: 83000, spending: { Food: 12000, Transport: 5000 } });
  assert.equal(summarize(transactions.slice(0, 1)).balance, 100000);
  assert.match(insight(summarize(transactions)), /Food.*71%/);
  assert.match(insight(summarize([])), /Log an expense/);
  assert.match(insight(summarize(transactions.slice(1))), /exceed/);
});
