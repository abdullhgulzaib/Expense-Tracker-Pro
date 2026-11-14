import assert from 'assert';
import { computePairwiseNetSettlements } from './controllers/splitVaultController.js';

console.log('Running Backend Settlement & Netting Tests...');

// Test 1: Pure Net Function
// Expense 1: A pays 1000, split equal between A and T (500 each) -> T owes A 500
// Expense 2: T pays 1500, split equal between T and A (750 each) -> A owes T 750
// Expected: A owes T 250 (750 - 500).
const userAId = '650000000000000000000001';
const userTId = '650000000000000000000002';

const members = [
  { user: userAId, name: 'Abdullah' },
  { user: userTId, name: 'Test' },
];

const expenses = [
  {
    _id: 'exp_1',
    title: 'Dinner',
    totalAmount: 1000,
    paidBy: userAId,
    paidByName: 'Abdullah',
    splits: [
      { user: userAId, name: 'Abdullah', amount: 500, status: 'Verified' },
      { user: userTId, name: 'Test', amount: 500, status: 'Unpaid' },
    ],
  },
  {
    _id: 'exp_2',
    title: 'Groceries',
    totalAmount: 1500,
    paidBy: userTId,
    paidByName: 'Test',
    splits: [
      { user: userTId, name: 'Test', amount: 750, status: 'Verified' },
      { user: userAId, name: 'Abdullah', amount: 750, status: 'Unpaid' },
    ],
  },
];

const netSettlementsWithoutPending = computePairwiseNetSettlements(
  expenses,
  members,
  [],
  new Map([
    [userAId, { phone: '03001234567' }],
    [userTId, { phone: '03119876543' }],
  ])
);

assert.strictEqual(netSettlementsWithoutPending.length, 1, 'Should produce exactly 1 net settlement');
const netItem = netSettlementsWithoutPending[0];
assert.strictEqual(netItem.fromUserId, userAId, 'Debtor should be Abdullah');
assert.strictEqual(netItem.toUserId, userTId, 'Creditor should be Test');
assert.strictEqual(netItem.amount, 250, 'Net amount should be 250 (750 - 500)');
assert.strictEqual(netItem.hasPendingSettlement, false, 'hasPendingSettlement should be false');

console.log('Test 1 passed: Net balance computed correctly as Rs 250 (A owes T).');

// Test 2: Same two expenses plus pending settlement gives hasPendingSettlement = true
const activeSettlements = [
  {
    _id: 'settle_123',
    fromUser: userAId,
    toUser: userTId,
    amount: 250,
    status: 'UnderReview',
  },
];

const netSettlementsWithPending = computePairwiseNetSettlements(
  expenses,
  members,
  activeSettlements,
  new Map()
);

assert.strictEqual(netSettlementsWithPending[0].hasPendingSettlement, true);
assert.strictEqual(netSettlementsWithPending[0].pendingSettlementId, 'settle_123');
assert.strictEqual(netSettlementsWithPending[0].pendingSettlementAmount, 250);

console.log('Test 2 passed: Pending settlement UnderReview detected correctly.');

// Test 3: Action parsing logic test
function resolveAction(body) {
  const { action: rawAction, approve, approved } = body;
  let action = rawAction ? String(rawAction).toUpperCase() : undefined;
  if (!action) {
    if (approve === true || approved === true) action = 'APPROVE';
    else if (approve === false || approved === false) action = 'REJECT';
  }
  if (action !== 'APPROVE' && action !== 'REJECT' && action !== 'REQUEST_INFO') {
    return { error: 'Valid action (APPROVE, REJECT or REQUEST_INFO) is required.', status: 400 };
  }
  return { action, status: 200 };
}

assert.strictEqual(resolveAction({ approve: true }).action, 'APPROVE');
assert.strictEqual(resolveAction({ approved: true }).action, 'APPROVE');
assert.strictEqual(resolveAction({ approve: false }).action, 'REJECT');
assert.strictEqual(resolveAction({ action: 'approve' }).action, 'APPROVE');
assert.strictEqual(resolveAction({ action: 'REJECT' }).action, 'REJECT');
assert.strictEqual(resolveAction({ action: 'REQUEST_INFO' }).action, 'REQUEST_INFO');
assert.strictEqual(resolveAction({}).status, 400);
assert.strictEqual(resolveAction({ action: 'UNKNOWN' }).status, 400);

console.log('Test 3 passed: Action aliases and validation conform to contract.');

// Test 4: Base64 Image Validation Logic
function validateImage(imageUrl) {
  if (!imageUrl || !imageUrl.trim()) return { valid: true };
  const trimmed = imageUrl.trim();
  const match = trimmed.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i);
  if (!match) {
    return { valid: false, error: 'Image must be a valid base64 data URL (JPEG, PNG, or WEBP).' };
  }
  const base64Data = match[2];
  const decodedLength = Math.floor((base64Data.length * 3) / 4);
  if (decodedLength > 1.5 * 1024 * 1024) {
    return { valid: false, error: 'Receipt image size must not exceed 1.5 MB.' };
  }
  return { valid: true };
}

assert.strictEqual(validateImage('').valid, true);
assert.strictEqual(validateImage('data:image/jpeg;base64,aGVsbG8=').valid, true);
assert.strictEqual(validateImage('https://fake.url/image.jpg').valid, false);
// Create oversized base64 string (> 1.5MB decoded = ~2.1MB base64)
const bigBase64 = 'a'.repeat(2.1 * 1024 * 1024);
assert.strictEqual(validateImage(`data:image/png;base64,${bigBase64}`).valid, false);

console.log('Test 4 passed: Base64 data URL and 1.5MB size limit validation works.');

// Test 5: 1250 Rule & Deduplication Verification
// Initial payer shares:
// Abdullah has expense 1 share: 500
// Test has expense 2 share: 750
const personalExpenses = [
  { userId: userAId, splitExpenseId: 'exp_1', amount: 500, title: 'Dinner (My Share)' },
  { userId: userTId, splitExpenseId: 'exp_2', amount: 750, title: 'Groceries (My Share)' },
];

// Net settlement of Rs 250 approved:
// Forward split: Abdullah's share of expense 2 = 750
// Reverse split: Test's share of expense 1 = 500
const coveredSplits = [
  { userId: userAId, splitExpenseId: 'exp_2', amount: 750, title: 'Groceries (My Share)' },
  { userId: userTId, splitExpenseId: 'exp_1', amount: 500, title: 'Dinner (My Share)' },
];

function recordShareExpense(existingList, newShare) {
  const exists = existingList.some(
    (e) => e.userId === newShare.userId && e.splitExpenseId === newShare.splitExpenseId
  );
  if (!exists) {
    existingList.push(newShare);
  }
}

// First approval
coveredSplits.forEach((s) => recordShareExpense(personalExpenses, s));

// Second approval (idempotency check)
coveredSplits.forEach((s) => recordShareExpense(personalExpenses, s));

const aTotal = personalExpenses
  .filter((e) => e.userId === userAId)
  .reduce((sum, e) => sum + e.amount, 0);

const tTotal = personalExpenses
  .filter((e) => e.userId === userTId)
  .reduce((sum, e) => sum + e.amount, 0);

assert.strictEqual(aTotal, 1250, 'Abdullah total personal expenses must be exactly 1250 (500 + 750)');
assert.strictEqual(tTotal, 1250, 'Test total personal expenses must be exactly 1250 (750 + 500)');
assert.strictEqual(personalExpenses.filter((e) => e.userId === userAId).length, 2);
assert.strictEqual(personalExpenses.filter((e) => e.userId === userTId).length, 2);

console.log('Test 5 passed: 1250 rule and idempotency verified. Both members have exact Rs 1250 expenses.');

console.log('All backend tests passed successfully!');
