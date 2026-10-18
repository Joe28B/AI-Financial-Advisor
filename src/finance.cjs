// Deliberately small rules for the PoC. Replace with backend NLP later.
const categories = [
  ['Food', /\b(food|lunch|dinner|coffee|groceries)\b|اكل|أكل|غدا|قهوة|طعام/i],
  ['Transport', /\b(uber|taxi|bus|transport|metro)\b|مواصلات|تاكسي|اوبر|أوبر|مترو/i],
  ['Utilities', /\b(electricity|water|internet|bill)\b|كهرباء|مياه|انترنت|فاتورة/i],
  ['Subscriptions', /\b(netflix|spotify|subscription)\b|اشتراك/i],
  ['Entertainment', /\b(cinema|movie|game)\b|سينما|ترفيه/i],
];

function parseTransaction(input) {
  const text = input.trim().replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/٫/g, '.').replace(/٬/g, ',');
  const amounts = text.match(/-?\d+(?:,\d{3})*(?:\.\d+)?/g) || [];
  if (amounts.length !== 1) throw new Error('Use one amount per message, e.g. “Spent 120 on lunch”.');
  if (/\b(usd|dollars?|eur|euros?)\b|[$€]|دولار|يورو/i.test(text)) {
    throw new Error('This demo supports EGP only.');
  }
  const amount = Number(amounts[0].replace(/,/g, ''));
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100000000 || !/^-?\d+(?:,\d{3})*(?:\.\d{1,2})?$/.test(amounts[0])) {
    throw new Error('Enter a positive amount with at most two decimal places.');
  }
  const income = /\b(salary|income|earned|received)\b|مرتب|راتب|دخل|قبضت|استلمت/i.test(text);
  const expense = /\b(spent|paid|bought)\b|صرفت|دفعت|اشتريت/i.test(text);
  if (income && expense) throw new Error('Please enter income and expenses in separate messages.');
  if (!income && !expense) throw new Error('Start with “Spent”, “Received”, “دفعت”, or “قبضت”.');
  return {
    description: input.trim(),
    amount: Math.round(amount * 100), // Integer piastres avoid floating-point total errors.
    type: income ? 'income' : 'expense',
    category: income ? 'Income' : (categories.find(([, rule]) => rule.test(text))?.[0] || 'Other'),
  };
}

function summarize(transactions) {
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const spending = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    spending[t.category] = (spending[t.category] || 0) + t.amount;
  });
  return { income, expenses, balance: income - expenses, spending };
}

function insight(summary) {
  if (!summary.expenses) return 'Log an expense to see a spending summary.';
  if (summary.expenses > summary.income) return 'Recorded expenses exceed recorded income. Check that all income has been entered.';
  const top = Object.entries(summary.spending).sort((a, b) => b[1] - a[1])[0];
  return `${top[0]} is your largest expense category: ${Math.round(top[1] / summary.expenses * 100)}% of recorded spending.`;
}

module.exports = { parseTransaction, summarize, insight };
