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
  saveStock,
  restoreState,
  lineQuantity,
  assign,
  demoContact,
  walkInSlot,
  slotInterval,
  createWalkInBooking,
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
let checks = 0;
const check = (name, fn) => {
  fn();
  checks++;
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
  'walk-ins start today during opening hours and use closing time for short late-day rides',
  () => {
    const s = make();
    const next = walkInSlot(s, now);
    assert.deepEqual(next, {
      date: '2026-09-09',
      time: '11:01',
      duration: '2',
    });
    assert.ok(slotInterval(s, next, now).start > now);
    const late = at('2026-09-09', '17:00');
    const lateSlot = walkInSlot(s, late);
    assert.equal(lateSlot.duration, 'day');
    assert.equal(
      slotInterval(s, lateSlot, late).end,
      at('2026-09-09', '18:00'),
    );
  },
);
check(
  'walk-ins respect opening time, closed dates and the Eastern winter clock',
  () => {
    const s = make();
    assert.deepEqual(walkInSlot(s, at('2026-09-09', '08:00')), {
      date: '2026-09-09',
      time: '10:00',
      duration: '2',
    });
    s.settings.closures = ['2026-12-10', '2026-12-11'];
    const closed = at('2026-12-09', '18:00');
    const next = walkInSlot(s, closed);
    assert.deepEqual(next, {
      date: '2026-12-12',
      time: '10:00',
      duration: '2',
    });
    assert.ok(slotInterval(s, next, closed).start > closed);
  },
);
check(
  'staff walk-ins start now, share stock, stay unpaid and permit immediate checkout',
  () => {
    const s = make();
    s.paymentMode = 'full';
    const savedAt = now + 32 * 1000;
    const b = createWalkInBooking(s, slot, lines, contact, true, savedAt);
    assert.equal(b.source, 'Walk-in');
    assert.equal(b.start, now);
    assert.equal(b.paymentMode, 'pickup');
    assert.equal(b.paid, 0);
    assert.equal(count(s, b), 0);
    assert.throws(
      () => createWalkInBooking(s, slot, lines, contact, true, savedAt),
      /no longer available/,
    );
    assert.throws(
      () =>
        createBooking(
          s,
          b,
          lines,
          contact,
          'Website',
          'pickup',
          false,
          savedAt,
        ),
      /future pickup/,
    );
    assert.throws(
      () => changeStatus(s, b.id, 'Checked out', savedAt),
      /payment first/,
    );
    recordPayment(s, b.id, b.total, 'Walk-in demo receipt', savedAt);
    changeStatus(s, b.id, 'Checked out', savedAt);
    assert.equal(b.status, 'Checked out');
  },
);
check(
  'walk-ins reject missing details, closures and after-hours pickup without adding a booking',
  () => {
    const s = make();
    const before = s.bookings.length;
    assert.throws(
      () =>
        createWalkInBooking(
          s,
          slot,
          lines,
          { ...contact, name: '' },
          true,
          now,
        ),
      /contact details/,
    );
    assert.throws(
      () =>
        createWalkInBooking(
          s,
          slot,
          lines,
          contact,
          true,
          at('2026-09-09', '19:00'),
        ),
      /closing/,
    );
    s.settings.closures.push('2026-09-09');
    assert.throws(
      () => createWalkInBooking(s, slot, lines, contact, true, now),
      /closed/,
    );
    assert.equal(s.bookings.length, before);
  },
);
check(
  'two matching bikes from one stock group, unpaid confirmation and shared availability',
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
    assert.equal(lineQuantity(b.lines), 2);
    assert.equal(b.lines.length, 1);
    assert.equal('bikeIds' in b, false);
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
      () => maintenance(s, 'comfort-L', b.start, b.end, 'Sample service'),
      /Maintenance conflicts/,
    );
    assert.equal(s.blocks.length, count);
  },
);
check('maintenance blocks remove affected bikes and can be released', () => {
  const s = make();
  maintenance(
    s,
    'comfort-L',
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
  assert.equal(lineQuantity(b.lines), 2);
  assert.throws(() =>
    updateBooking(s, b.id, slot, [{ ...lines[0], qty: 3 }], now),
  );
});
check('closure settings and unsafe stock reductions are validated', () => {
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
  assert.throws(() => saveStock(s, 'comfort', 'L', 1, now), /Keep at least 2/);
});
check(
  'stock increases stay in one group and support larger reservations',
  () => {
    const s = make();
    assert.equal(s.bikes.length, 6);
    assert.equal(
      s.bikes.reduce((sum, b) => sum + b.quantity, 0),
      12,
    );
    saveStock(s, 'comfort', 'L', 6, now);
    assert.equal(s.bikes.length, 6);
    assert.equal(count(s), 6);
    const b = createBooking(
      s,
      slot,
      [{ ...lines[0], qty: 4 }],
      contact,
      'Website',
      'pickup',
      false,
      now,
    );
    assert.equal(count(s), 2);
    assert.equal(b.total, 100);
    assert.equal(s.bikes.find((x) => x.id === 'comfort-L').quantity, 6);
    changeStatus(s, b.id, 'Cancelled', now);
    assert.equal(count(s), 6);
  },
);
check('repeated lines cannot bypass shared quantity limits', () => {
  const s = make();
  assert.throws(
    () => assign(s, slot, [lines[0], lines[0]], undefined, now),
    /no longer available/,
  );
  const b = createBooking(
    s,
    slot,
    [
      { ...lines[0], qty: 1 },
      { ...lines[0], qty: 1 },
    ],
    contact,
    'Website',
    'pickup',
    false,
    now,
  );
  assert.equal(b.lines.length, 1);
  assert.equal(b.lines[0].qty, 2);
});
check(
  'availability uses peak concurrent demand across sequential rentals',
  () => {
    const s = make();
    const one = [{ ...lines[0], qty: 1 }];
    createBooking(s, slot, one, contact, 'Website', 'pickup', false, now);
    createBooking(
      s,
      { ...slot, time: '12:30' },
      one,
      contact,
      'Website',
      'pickup',
      false,
      now,
    );
    assert.equal(count(s, { ...slot, duration: 'day' }), 1);
    saveStock(s, 'comfort', 'L', 1, now);
    assert.equal(count(s, { ...slot, duration: 'day' }), 0);
  },
);
check(
  'maintenance subtracts only its quantity and respects other commitments',
  () => {
    const s = make();
    saveStock(s, 'comfort', 'L', 5, now);
    maintenance(
      s,
      'comfort-L',
      at(slot.date, '10:00'),
      at(slot.date, '18:00'),
      'Service two',
      2,
    );
    assert.equal(count(s), 3);
    createBooking(s, slot, lines, contact, 'Website', 'pickup', false, now);
    assert.equal(count(s), 1);
    const before = structuredClone(s);
    assert.throws(
      () =>
        maintenance(
          s,
          'comfort-L',
          at(slot.date, '10:00'),
          at(slot.date, '18:00'),
          'Too many',
          2,
        ),
      /Maintenance conflicts/,
    );
    assert.deepEqual(s, before);
    assert.throws(
      () => saveStock(s, 'comfort', 'L', 3, now),
      /Keep at least 4/,
    );
    saveStock(s, 'comfort', 'L', 4, now);
    assert.equal(count(s), 0);
    s.blocks = s.blocks.filter((b) => b.bikeId !== 'comfort-L');
    assert.equal(count(s), 2);
  },
);
check(
  'invalid and zero stock quantities are handled without changing other groups',
  () => {
    const s = make();
    for (const qty of [-1, 1.5, NaN, Infinity, 101]) {
      assert.throws(
        () => saveStock(s, 'comfort', 'L', qty, now),
        /whole-number/,
      );
    }
    for (const qty of [0, -1, 1.5, NaN]) {
      assert.throws(() =>
        maintenance(
          s,
          'comfort-L',
          at(slot.date, '10:00'),
          at(slot.date, '12:00'),
          'Service',
          qty,
        ),
      );
    }
    saveStock(s, 'comfort', 'L', 0, now);
    assert.equal(count(s), 0);
    assert.equal(s.bikes.find((b) => b.id === 'comfort-M').quantity, 2);
  },
);
check(
  'checking out and returning several matching bikes preserves turnaround',
  () => {
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
    changeStatus(s, b.id, 'Checked out', b.start);
    assert.equal(count(s, { ...slot, date: '2026-09-11' }), 0);
    changeStatus(s, b.id, 'Returned', b.end);
    assert.equal(count(s, { ...slot, time: '12:15' }), 0);
    assert.equal(count(s, { ...slot, time: '12:30' }), 2);
  },
);
check('changing turnaround cannot overbook grouped stock', () => {
  const s = make();
  createBooking(s, slot, lines, contact, 'Website', 'pickup', false, now);
  createBooking(
    s,
    { ...slot, time: '12:30' },
    lines,
    contact,
    'Website',
    'pickup',
    false,
    now,
  );
  assert.throws(
    () => saveSettings(s, { ...s.settings, buffer: 60 }),
    /buffer conflicts/,
  );
  assert.equal(s.settings.buffer, 30);
});
check(
  'existing session reservations and overlapping individual downtime migrate safely',
  () => {
    const old = make();
    old.version = 3;
    old.bikes = old.bikes.flatMap(({ quantity, ...b }) =>
      [1, 2].map((n) => ({ ...b, id: b.id + '-' + n, condition: 'Ready' })),
    );
    old.bookings = old.bookings.map((b) => ({
      ...b,
      bikeIds: ['legacy-unit'],
    }));
    old.blocks = [
      {
        id: 'a',
        bikeId: 'comfort-L-1',
        start: at(slot.date, '10:00'),
        end: at(slot.date, '14:00'),
        reason: 'Service',
      },
      {
        id: 'b',
        bikeId: 'comfort-L-1',
        start: at(slot.date, '12:00'),
        end: at(slot.date, '16:00'),
        reason: 'Inspection',
      },
    ];
    const s = restoreState(old, now);
    assert.equal(s.version, 4);
    assert.equal(s.bikes.length, 6);
    assert.equal(s.bookings.length, old.bookings.length);
    assert.equal(s.bookings[0].name, old.bookings[0].name);
    assert.equal('bikeIds' in s.bookings[0], false);
    assert.equal(count(s, { ...slot, time: '12:00' }), 1);
    assert.equal(s.blocks.length, 1);
    assert.equal(restoreState(JSON.parse(JSON.stringify(s)), now).version, 4);
  },
);
check('earlier closing cannot strand an existing all-day booking', () => {
  const s = make();
  s.bookings = [];
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
  const before = structuredClone(s.settings);
  assert.throws(
    () => saveSettings(s, { ...before, close: '17:00' }),
    /conflict/,
  );
  assert.deepEqual(s.settings, before);
  assert.equal(b.end, at(slot.date, '18:00'));
  saveSettings(s, { ...before, close: '19:00' });
  assert.equal(b.end, at(slot.date, '18:00'));
});
check('invalid clock minutes and midnight overflow are rejected', () => {
  const s = make();
  s.bookings = [];
  for (const time of ['10:99', '17:60', '24:00']) {
    assert.ok(Number.isNaN(at(slot.date, time)));
    assert.throws(() => saveSettings(s, { ...s.settings, open: time }));
    assert.throws(() => saveSettings(s, { ...s.settings, close: time }));
  }
});
check('decimal rates and partial payments settle exactly to the cent', () => {
  for (const rate of [0.29, 9.95, 19.95, 39.95]) {
    const s = make();
    saveStock(s, 'comfort', 'L', 3, now);
    s.settings.rates.comfort['2'] = rate;
    const b = createBooking(
      s,
      slot,
      [{ ...lines[0], qty: 3 }],
      contact,
      'Website',
      'pickup',
      false,
      now,
    );
    const expected = (Math.round(rate * 100) * 3) / 100;
    assert.equal(b.total, expected);
    recordPayment(s, b.id, 0.1, '', now);
    recordPayment(s, b.id, 0.2, '', now);
    assert.equal(b.paid, 0.3);
    recordPayment(s, b.id, due(b), '', now);
    assert.equal(b.paid, expected);
    assert.equal(due(b), 0);
    assert.equal(paymentStatus(b), 'Paid');
    changeStatus(s, b.id, 'Checked out', b.start);
    refund(s, b.id, now);
    assert.equal(paymentStatus(b), 'Refunded');
  }
});
check(
  'legacy floating-point payment residues do not leave phantom balances',
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
    b.total = 119.85000000000001;
    b.paid = 119.85;
    assert.equal(due(b), 0);
    assert.equal(paymentStatus(b), 'Paid');
  },
);
console.log(`${checks} behavior checks passed`);
