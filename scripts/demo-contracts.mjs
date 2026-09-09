import assert from 'node:assert/strict';
import {
  seed,
  at,
  dayPlus,
  availability,
  createBooking,
  changeStatus,
  maintenance,
  updateBooking,
  recordPayment,
  refund,
  paymentStatus,
  due,
  saveSettings,
  saveBike,
  assign,
  demoContact,
} from '../lib/demo-model.ts';
const now = at('2026-09-09', '11:00');
const make = () => seed(now),
  slot = { date: '2026-09-10', time: '10:00', duration: '2' },
  lines = [{ category: 'comfort', size: 'L', qty: 2 }],
  contact = { ...demoContact, policy: true };
const count = (s, sl = slot) =>
  availability(s, sl, undefined, now).find(
    (x) => x.category === 'comfort' && x.size === 'L',
  ).count;
const check = (name, fn) => {
  fn();
  console.log('PASS ' + name);
};
check('Eastern summer and winter offsets', () => {
  assert.equal(
    new Date(at('2026-09-09', '10:00')).toISOString(),
    '2026-09-09T14:00:00.000Z',
  );
  assert.equal(
    new Date(at('2026-12-09', '10:00')).toISOString(),
    '2026-12-09T15:00:00.000Z',
  );
});
check(
  'two physical bikes, immediate unpaid confirmation and shared availability',
  () => {
    const s = make();
    const b = createBooking(
      s,
      slot,
      lines,
      contact,
      'Website',
      'pickup',
      false,
      now,
    );
    assert.equal(b.bikeIds.length, 2);
    assert.equal(new Set(b.bikeIds).size, 2);
    assert.equal(b.total, 50);
    assert.equal(b.status, 'Confirmed');
    assert.equal(paymentStatus(b), 'Unpaid');
    assert.equal(due(b), 50);
    assert.equal(count(s), 0);
    assert.throws(
      () =>
        createBooking(s, slot, lines, contact, 'Website', 'pickup', false, now),
      /no longer available/,
    );
  },
);
check('cancellation releases inventory but keeps payment independent', () => {
  const s = make();
  const b = createBooking(
    s,
    slot,
    lines,
    contact,
    'Website',
    'full',
    true,
    now,
  );
  changeStatus(s, b.id, 'Cancelled', now);
  assert.equal(count(s), 2);
  assert.equal(paymentStatus(b), 'Paid');
  refund(s, b.id, now);
  assert.equal(paymentStatus(b), 'Refunded');
});
check('no show releases inventory', () => {
  const s = make();
  const b = createBooking(
    s,
    slot,
    lines,
    contact,
    'Website',
    'pickup',
    false,
    now,
  );
  changeStatus(s, b.id, 'No-show', now);
  assert.equal(count(s), 2);
});
check('turnaround blocks adjacent rentals until buffer completes', () => {
  const s = make();
  createBooking(s, slot, lines, contact, 'Website', 'pickup', false, now);
  assert.equal(count(s, { ...slot, time: '12:00' }), 0);
  assert.equal(count(s, { ...slot, time: '12:30' }), 2);
});
check(
  'checked-out bikes stay blocked until staff records actual return',
  () => {
    const s = make();
    const tomorrow = availability(s, slot, undefined, now).find(
      (x) => x.category === 'comfort' && x.size === 'M',
    );
    assert.equal(tomorrow.count, 1);
    changeStatus(s, 'BS-DEMO-101', 'Returned', now);
    const before = availability(
      s,
      { ...slot, date: '2026-09-09', time: '11:15' },
      undefined,
      now,
    );
    assert.equal(
      before.find((x) => x.category === 'comfort' && x.size === 'M').count,
      1,
    );
    const after = availability(
      s,
      { ...slot, date: '2026-09-09', time: '11:30' },
      undefined,
      now,
    );
    assert.equal(
      after.find((x) => x.category === 'comfort' && x.size === 'M').count,
      2,
    );
  },
);
check(
  'past dates, invalid dates, after-closing returns and quantity are rejected',
  () => {
    const s = make();
    assert.throws(() =>
      assign(s, { ...slot, date: '2020-01-01' }, lines, undefined, now),
    );
    assert.throws(() =>
      assign(s, { ...slot, date: '2026-02-30' }, lines, undefined, now),
    );
    assert.throws(() =>
      assign(s, { ...slot, time: '17:00' }, lines, undefined, now),
    );
    assert.throws(() =>
      assign(s, slot, [{ ...lines[0], qty: 3 }], undefined, now),
    );
  },
);
check('day rentals end at close', () => {
  const s = make();
  const b = createBooking(
    s,
    { ...slot, duration: 'day' },
    lines,
    contact,
    'Website',
    'pickup',
    false,
    now,
  );
  assert.equal(b.end, at(slot.date, '18:00'));
  assert.equal(b.total, 110);
});
check('payment success, failure gate and deposit balance', () => {
  const s = make();
  assert.throws(
    () => createBooking(s, slot, lines, contact, 'Website', 'full', false, now),
    /checkout/,
  );
  assert.equal(s.bookings.length, 3);
  const b = createBooking(
    s,
    slot,
    lines,
    contact,
    'Example lodging partner',
    'deposit',
    true,
    now,
  );
  assert.equal(b.paid, 10);
  assert.equal(due(b), 40);
  assert.equal(paymentStatus(b), 'Part paid');
  assert.equal(b.source, 'Example lodging partner');
  recordPayment(s, b.id, 40, 'DEMO-RECEIPT', now);
  assert.equal(paymentStatus(b), 'Paid');
  assert.throws(() => recordPayment(s, b.id, 1, '', now));
});
check(
  'maintenance conflicts report reservation and prevent block creation',
  () => {
    const s = make();
    const b = createBooking(
      s,
      slot,
      lines,
      contact,
      'Website',
      'pickup',
      false,
      now,
    );
    const count = s.blocks.length;
    assert.throws(
      () => maintenance(s, b.bikeIds[0], b.start, b.end, 'Sample service'),
      /Maintenance conflicts/,
    );
    assert.equal(s.blocks.length, count);
  },
);
check('maintenance blocks remove affected bikes and can be released', () => {
  const s = make();
  maintenance(
    s,
    'COM-L-01',
    at(slot.date, '10:00'),
    at(slot.date, '12:00'),
    'Service',
  );
  assert.equal(count(s), 1);
  s.blocks = [];
  assert.equal(count(s), 2);
});
check('changed booking recalculates and rejects unavailable quantity', () => {
  const s = make();
  const b = createBooking(
    s,
    slot,
    [{ category: 'comfort', size: 'L', qty: 1 }],
    contact,
    'Walk-in',
    'pickup',
    false,
    now,
  );
  updateBooking(s, b.id, { ...slot, duration: '4' }, lines, now);
  assert.equal(b.total, 80);
  assert.equal(b.bikeIds.length, 2);
  assert.throws(() =>
    updateBooking(s, b.id, slot, [{ ...lines[0], qty: 3 }], now),
  );
});
check('closure settings and unsafe bike edits are validated', () => {
  const s = make();
  const b = createBooking(
    s,
    slot,
    lines,
    contact,
    'Website',
    'pickup',
    false,
    now,
  );
  assert.throws(
    () => saveSettings(s, { ...s.settings, closures: [slot.date] }),
    /conflict/,
  );
  assert.throws(
    () =>
      saveBike(
        s,
        { ...s.bikes.find((x) => x.id === b.bikeIds[0]), condition: 'Retired' },
        b.bikeIds[0],
      ),
    /active reservation/,
  );
});
console.log('13 behavior checks passed');
