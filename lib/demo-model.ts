export type Category = 'comfort' | 'ebike' | 'hybrid';
export type Duration = '2' | '4' | 'day';
export type BookingStatus =
  | 'Confirmed'
  | 'Checked out'
  | 'Returned'
  | 'Cancelled'
  | 'No-show';
export type PaymentMode = 'pickup' | 'full' | 'deposit';
export const CATEGORIES: {
  id: Category;
  name: string;
  sizes: string[];
  prefix: string;
  description: string;
}[] = [
  {
    id: 'comfort',
    name: 'Comfort bike',
    sizes: ['M', 'L'],
    prefix: 'COM',
    description: 'Upright and easygoing.',
  },
  {
    id: 'ebike',
    name: 'Step through e-bike',
    sizes: ['SM', 'ML'],
    prefix: 'EBI',
    description: 'A little help for the journey.',
  },
  {
    id: 'hybrid',
    name: 'Hybrid bike',
    sizes: ['M', 'L'],
    prefix: 'HYB',
    description: 'Versatile and ready to explore.',
  },
];
export const sizeName = (s: string) =>
  ({ M: 'Medium', L: 'Large', SM: 'Small / medium', ML: 'Medium / large' })[
    s
  ] || s;
export const catName = (s: string) =>
  CATEGORIES.find((c) => c.id === s)?.name || s;
export const money = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(n);
export const localDate = (epoch = Date.now()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Detroit',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(epoch);
export function dayPlus(n: number, now = Date.now()) {
  const d = new Date(localDate(now) + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function at(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time))
    return NaN;
  const wall = Date.parse(date + 'T' + time + ':00Z');
  if (
    !Number.isFinite(wall) ||
    new Date(wall).toISOString().slice(0, 10) !== date
  )
    return NaN;
  let epoch = wall;
  for (let i = 0; i < 2; i++) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Detroit',
      timeZoneName: 'longOffset',
    }).formatToParts(epoch);
    const off = parts
      .find((p) => p.type === 'timeZoneName')
      ?.value.match(/GMT([+-])(\d{2}):(\d{2})/);
    const minutes = off
      ? (+off[2] * 60 + +off[3]) * (off[1] === '-' ? -1 : 1)
      : 0;
    epoch = wall - minutes * 60000;
  }
  return epoch;
}
export const clockTime = (epoch: number) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Detroit',
    hour: 'numeric',
    minute: '2-digit',
  }).format(epoch);
export const dateTime = (epoch: number) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Detroit',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(epoch);
export interface BikeRecord {
  id: string;
  category: Category;
  size: string;
  condition: string;
}
export interface Block {
  id: string;
  bikeId: string;
  start: number;
  end: number;
  reason: string;
}
export interface Line {
  category: Category;
  size: string;
  qty: number;
}
export interface Slot {
  date: string;
  time: string;
  duration: Duration;
}
export interface Contact {
  name: string;
  email: string;
  phone: string;
  notes: string;
  policy: boolean;
  marketing: boolean;
}
export interface Booking extends Contact, Slot {
  id: string;
  lines: Line[];
  bikeIds: string[];
  start: number;
  end: number;
  buffer: number;
  total: number;
  paid: number;
  refunded: number;
  source: string;
  status: BookingStatus;
  paymentMode: PaymentMode;
  returnAt?: number;
  history: { at: number; event: string }[];
}
export interface Settings {
  open: string;
  close: string;
  buffer: number;
  closures: string[];
  rates: Record<Category, Record<Duration, number>>;
}
export interface Content {
  intro: string;
  menu: string;
  coffeeHours: string;
  bikeHours: string;
}
export interface State {
  version: 3;
  seedDay: string;
  bikes: BikeRecord[];
  blocks: Block[];
  bookings: Booking[];
  settings: Settings;
  content: Content;
  paymentMode: PaymentMode;
  revision: number;
}
export const demoContact: Contact = {
  name: 'Demo Rider',
  email: 'rider@example.com',
  phone: '202-555-0147',
  notes: '',
  policy: false,
  marketing: false,
};
export function seed(now = Date.now()): State {
  const s: State = {
    version: 3,
    seedDay: localDate(now),
    revision: 0,
    bikes: [],
    blocks: [],
    bookings: [],
    paymentMode: 'pickup',
    settings: {
      open: '10:00',
      close: '18:00',
      buffer: 30,
      closures: [],
      rates: {
        comfort: { '2': 25, '4': 40, day: 55 },
        ebike: { '2': 45, '4': 65, day: 85 },
        hybrid: { '2': 30, '4': 45, day: 60 },
      },
    },
    content: {
      intro:
        'A good day starts with a cup in hand. Settle in for coffee and locally sourced baked goods, with space to slow down inside or on the patio.',
      menu: 'Espresso\nLatte\nCold brew\nLocally sourced baked goods',
      coffeeHours: 'Seasonal hours to be confirmed',
      bikeHours: 'Seasonal hours to be confirmed',
    },
  };
  for (const c of CATEGORIES)
    for (const size of c.sizes)
      for (let i = 1; i <= 2; i++)
        s.bikes.push({
          id: c.prefix + '-' + size + '-0' + i,
          category: c.id,
          size,
          condition: 'Ready',
        });
  s.blocks.push({
    id: 'maintenance-seed',
    bikeId: 'HYB-L-02',
    start: at(dayPlus(0, now), '10:00'),
    end: at(dayPlus(2, now), '18:00'),
    reason: 'Sample brake service',
  });
  const fixture = (
    id: string,
    name: string,
    category: Category,
    size: string,
    time: string,
    duration: Duration,
    status: BookingStatus,
    offset = 0,
  ) => {
    const slot = { date: dayPlus(offset, now), time, duration };
    const start = at(slot.date, time),
      end = at(
        slot.date,
        duration === 'day'
          ? '18:00'
          : String(+time.slice(0, 2) + +duration).padStart(2, '0') + ':00',
      );
    const b: Booking = {
      ...demoContact,
      ...slot,
      id,
      name,
      policy: true,
      lines: [{ category, size, qty: 1 }],
      bikeIds: [
        CATEGORIES.find((c) => c.id === category)!.prefix + '-' + size + '-01',
      ],
      start,
      end,
      buffer: 30,
      total: s.settings.rates[category][duration],
      paid: status === 'Checked out' ? s.settings.rates[category][duration] : 0,
      refunded: 0,
      source: offset ? 'Example lodging partner' : 'Website',
      status,
      paymentMode: 'pickup',
      history: [{ at: start - 3600000, event: 'Created — fictional sample' }],
    };
    if (status === 'Checked out')
      b.history.push({
        at: start,
        event: 'Sample payment recorded and checked out',
      });
    s.bookings.push(b);
  };
  fixture(
    'BS-DEMO-101',
    'Alex Sample',
    'comfort',
    'M',
    '10:00',
    '2',
    'Checked out',
  );
  fixture(
    'BS-DEMO-102',
    'Taylor Example',
    'ebike',
    'SM',
    '16:00',
    '2',
    'Confirmed',
  );
  fixture(
    'BS-DEMO-103',
    'Sam Demo',
    'hybrid',
    'M',
    '11:00',
    '4',
    'Confirmed',
    1,
  );
  return s;
}
export function slotInterval(
  s: State,
  slot: Slot,
  now = Date.now(),
  allowPast = false,
) {
  const start = at(slot.date, slot.time),
    open = at(slot.date, s.settings.open),
    close = at(slot.date, s.settings.close);
  const end =
    slot.duration === 'day' ? close : start + Number(slot.duration) * 3600000;
  if (
    !['2', '4', 'day'].includes(slot.duration) ||
    !Number.isFinite(start) ||
    !Number.isFinite(end)
  )
    throw Error('Choose a valid pickup date, time and duration.');
  if (!allowPast && start < now)
    throw Error('Choose a future pickup time. All times are Eastern.');
  if (s.settings.closures.includes(slot.date))
    throw Error('This sample date is closed. Please choose another date.');
  if (start < open || end > close || end <= start)
    throw Error(
      'Choose a pickup between ' +
        s.settings.open +
        ' and ' +
        s.settings.close +
        ' with return by closing. A day rental ends at closing.',
    );
  return { start, end };
}
const overlaps = (a: number, b: number, c: number, d: number) => a < d && c < b;
export function isAvailable(
  s: State,
  bike: BikeRecord,
  start: number,
  end: number,
  ignoreId?: string,
) {
  if (bike.condition !== 'Ready') return false;
  if (
    s.blocks.some(
      (b) =>
        b.bikeId === bike.id &&
        overlaps(start, end + s.settings.buffer * 60000, b.start, b.end),
    )
  )
    return false;
  return !s.bookings.some((b) => {
    if (
      b.id === ignoreId ||
      !b.bikeIds.includes(bike.id) ||
      b.status === 'Cancelled' ||
      b.status === 'No-show'
    )
      return false;
    const stop =
      b.status === 'Checked out'
        ? Infinity
        : b.status === 'Returned'
          ? (b.returnAt ?? b.end) + b.buffer * 60000
          : b.end + b.buffer * 60000;
    return overlaps(start, end + s.settings.buffer * 60000, b.start, stop);
  });
}
export function availability(
  s: State,
  slot: Slot,
  ignoreId?: string,
  now = Date.now(),
) {
  const { start, end } = slotInterval(s, slot, now);
  return CATEGORIES.flatMap((c) =>
    c.sizes.map((size) => ({
      category: c.id,
      size,
      count: s.bikes.filter(
        (b) =>
          b.category === c.id &&
          b.size === size &&
          isAvailable(s, b, start, end, ignoreId),
      ).length,
    })),
  );
}
export function totalFor(s: State, lines: Line[], duration: Duration) {
  return lines.reduce(
    (a, l) => a + s.settings.rates[l.category][duration] * l.qty,
    0,
  );
}
export function assign(
  s: State,
  slot: Slot,
  lines: Line[],
  ignoreId?: string,
  now = Date.now(),
  allowPast = false,
) {
  const { start, end } = slotInterval(s, slot, now, allowPast);
  if (
    !lines.length ||
    lines.some(
      (l) =>
        !CATEGORIES.some(
          (c) => c.id === l.category && c.sizes.includes(l.size),
        ) ||
        !Number.isInteger(l.qty) ||
        l.qty < 1 ||
        l.qty > 12,
    )
  )
    throw Error(
      'Select at least one available bike with a valid size and quantity.',
    );
  const ids: string[] = [];
  for (const line of lines) {
    const eligible = s.bikes.filter(
      (b) =>
        b.category === line.category &&
        b.size === line.size &&
        !ids.includes(b.id) &&
        isAvailable(s, b, start, end, ignoreId),
    );
    if (eligible.length < line.qty)
      throw Error(
        catName(line.category) +
          ' · ' +
          sizeName(line.size) +
          ' is no longer available in that quantity. Try another size or pickup time.',
      );
    ids.push(...eligible.slice(0, line.qty).map((b) => b.id));
  }
  return { start, end, bikeIds: ids };
}
export function createBooking(
  s: State,
  slot: Slot,
  lines: Line[],
  contact: Contact,
  source: string,
  mode: PaymentMode,
  paidOnline = false,
  now = Date.now(),
) {
  if (
    !contact.name.trim() ||
    !/^\S+@\S+\.\S+$/.test(contact.email) ||
    contact.phone.replace(/\D/g, '').length < 7 ||
    !contact.policy
  )
    throw Error(
      'Add demo contact details and acknowledge the sample rental policy.',
    );
  if (mode !== 'pickup' && !paidOnline)
    throw Error('Complete the simulated checkout before confirming.');
  const allocation = assign(s, slot, lines, undefined, now);
  const total = totalFor(s, lines, slot.duration);
  const paid =
    mode === 'full'
      ? total
      : mode === 'deposit'
        ? Math.round(total * 0.2 * 100) / 100
        : 0;
  const id = 'BS-DEMO-' + (104 + s.bookings.length) + '-' + (s.revision + 1);
  const b: Booking = {
    ...contact,
    ...slot,
    ...allocation,
    id,
    lines: structuredClone(lines),
    source,
    buffer: s.settings.buffer,
    total,
    paid,
    refunded: 0,
    status: 'Confirmed',
    paymentMode: mode,
    history: [
      { at: now, event: 'Created · ' + source },
      {
        at: now,
        event:
          mode === 'pickup'
            ? 'Pay at pickup selected'
            : mode === 'full'
              ? 'Simulated online payment succeeded'
              : 'Simulated 20% booking deposit succeeded',
      },
    ],
  };
  s.bookings.push(b);
  return b;
}
export function updateBooking(
  s: State,
  id: string,
  slot: Slot,
  lines: Line[],
  now = Date.now(),
) {
  const b = getBooking(s, id);
  if (b.status !== 'Confirmed')
    throw Error('Only confirmed reservations can be edited.');
  const allocation = assign(s, slot, lines, id, now);
  Object.assign(b, slot, allocation, {
    lines: structuredClone(lines),
    total: totalFor(s, lines, slot.duration),
    buffer: s.settings.buffer,
  });
  b.history.push({
    at: now,
    event: 'Rental changed; price recalculated and availability checked',
  });
  return b;
}
export function getBooking(s: State, id: string) {
  const b = s.bookings.find((b) => b.id === id);
  if (!b) throw Error('This demo reservation is not in the current session.');
  return b;
}
export function paymentStatus(b: Booking) {
  const net = b.paid - b.refunded;
  if (b.refunded > 0 && net <= 0) return 'Refunded';
  return net >= b.total ? 'Paid' : net > 0 ? 'Part paid' : 'Unpaid';
}
export const due = (b: Booking) => Math.max(0, b.total - b.paid + b.refunded);
export function recordPayment(
  s: State,
  id: string,
  amount: number,
  reference: string,
  now = Date.now(),
) {
  const b = getBooking(s, id);
  if (!['Confirmed', 'Checked out'].includes(b.status))
    throw Error('Payments can only be recorded for active rentals.');
  if (!Number.isFinite(amount) || amount <= 0 || amount > due(b))
    throw Error('Enter an amount above zero and no more than the balance due.');
  b.paid += amount;
  b.history.push({
    at: now,
    event:
      'Simulated pickup payment ' +
      money(amount) +
      (reference ? ' · DripOS reference ' + reference : ''),
  });
}
export function refund(s: State, id: string, now = Date.now()) {
  const b = getBooking(s, id);
  const net = b.paid - b.refunded;
  if (net <= 0) throw Error('There is no recorded payment to refund.');
  b.refunded = b.paid;
  b.history.push({
    at: now,
    event: 'Simulated refund ' + money(net) + ' — no money moved',
  });
}
export function changeStatus(
  s: State,
  id: string,
  status: BookingStatus,
  now = Date.now(),
) {
  const b = getBooking(s, id);
  const allowed: Record<BookingStatus, BookingStatus[]> = {
    Confirmed: ['Checked out', 'Cancelled', 'No-show'],
    'Checked out': ['Returned'],
    Returned: [],
    Cancelled: [],
    'No-show': [],
  };
  if (!allowed[b.status].includes(status))
    throw Error('That status change is unavailable for this reservation.');
  if (status === 'Checked out') {
    if (now < b.start)
      throw Error(
        'Pickup is not due yet. Use Today’s sample reservation when its pickup time arrives.',
      );
    if (due(b) > 0) throw Error('Record the remaining pickup payment first.');
    for (const id of b.bikeIds) {
      const bike = s.bikes.find((x) => x.id === id)!;
      if (!isAvailable(s, bike, now, Math.max(now + 60000, b.end), b.id))
        throw Error(
          'Bike ' + id + ' has a conflict. Review its assignment first.',
        );
    }
  }
  b.status = status;
  if (status === 'Returned') b.returnAt = now;
  b.history.push({
    at: now,
    event:
      status +
      (status === 'Returned'
        ? ' · ' + b.buffer + ' minute turnaround begins'
        : ''),
  });
}
export function reassign(
  s: State,
  id: string,
  oldId: string,
  newId: string,
  now = Date.now(),
) {
  const b = getBooking(s, id);
  if (b.status !== 'Confirmed') throw Error('Reassign bikes before checkout.');
  const old = s.bikes.find((x) => x.id === oldId),
    bike = s.bikes.find((x) => x.id === newId);
  if (
    !old ||
    !bike ||
    !b.bikeIds.includes(oldId) ||
    b.bikeIds.includes(newId) ||
    bike.category !== old.category ||
    bike.size !== old.size ||
    !isAvailable(s, bike, b.start, b.end, id)
  )
    throw Error('Choose another available bike of the same category and size.');
  b.bikeIds = b.bikeIds.map((x) => (x === oldId ? newId : x));
  b.history.push({
    at: now,
    event: 'Assigned ' + newId + ' in place of ' + oldId,
  });
}
export function maintenance(
  s: State,
  bikeId: string,
  start: number,
  end: number,
  reason: string,
) {
  if (
    !s.bikes.some((b) => b.id === bikeId) ||
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    end <= start ||
    !reason.trim()
  )
    throw Error('Choose a bike, valid downtime and a reason.');
  const conflicts = s.bookings.filter(
    (b) =>
      b.bikeIds.includes(bikeId) &&
      !['Cancelled', 'No-show'].includes(b.status) &&
      overlaps(
        start,
        end,
        b.start,
        b.status === 'Checked out'
          ? Infinity
          : (b.returnAt ?? b.end) + b.buffer * 60000,
      ),
  );
  if (conflicts.length)
    throw Error(
      'Maintenance conflicts with ' +
        conflicts.map((b) => b.id + ' (' + b.name + ')').join(', ') +
        '. Open the reservation and reassign it, or choose different downtime.',
    );
  s.blocks.push({
    id: 'MT-' + (s.blocks.length + 1) + '-' + s.revision,
    bikeId,
    start,
    end,
    reason,
  });
}
export function saveBike(s: State, bike: BikeRecord, oldId?: string) {
  if (
    !/^[A-Z0-9-]{3,30}$/.test(bike.id) ||
    !CATEGORIES.some(
      (c) => c.id === bike.category && c.sizes.includes(bike.size),
    )
  )
    throw Error(
      'Use a unique bike ID with letters, digits or hyphens, and a valid category and size.',
    );
  if (s.bikes.some((b) => b.id === bike.id && b.id !== oldId))
    throw Error('That bike ID already exists.');
  if (oldId) {
    const old = s.bikes.find((b) => b.id === oldId);
    if (!old) throw Error('Bike not found.');
    if (
      s.bookings.some(
        (b) =>
          b.bikeIds.includes(oldId) &&
          ['Confirmed', 'Checked out'].includes(b.status),
      ) &&
      (old.category !== bike.category ||
        old.size !== bike.size ||
        bike.condition !== 'Ready')
    )
      throw Error(
        'This bike has an active reservation. Reassign that reservation before changing its category, size or condition.',
      );
    if (bike.id !== oldId) throw Error('Keep the existing bike ID.');
    Object.assign(old, bike);
  } else s.bikes.push(bike);
}
export function saveSettings(s: State, next: Settings) {
  if (
    !/^\d{2}:\d{2}$/.test(next.open) ||
    !/^\d{2}:\d{2}$/.test(next.close) ||
    next.open >= next.close ||
    next.open < '06:00' ||
    next.close > '23:00' ||
    !Number.isInteger(next.buffer) ||
    next.buffer < 0 ||
    next.buffer > 240
  )
    throw Error(
      'Use valid sample hours between 06:00 and 23:00 and a buffer from 0 to 240 minutes.',
    );
  if (next.closures.some((d) => !Number.isFinite(at(d, '12:00'))))
    throw Error('Enter valid closure dates, one date per line.');
  for (const c of CATEGORIES)
    for (const d of ['2', '4', 'day'] as Duration[])
      if (!Number.isFinite(next.rates[c.id][d]) || next.rates[c.id][d] < 0)
        throw Error('Rates must be zero or more.');
  const candidate = { ...s, settings: next };
  for (const b of s.bookings.filter((b) =>
    ['Confirmed', 'Checked out'].includes(b.status),
  )) {
    try {
      slotInterval(candidate, b, Date.now(), true);
    } catch {
      throw Error(
        'Settings conflict with ' +
          b.id +
          '. Review or change that booking first.',
      );
    }
    for (const id of b.bikeIds) {
      const bike = s.bikes.find((x) => x.id === id)!;
      if (!isAvailable(candidate, bike, b.start, b.end, b.id))
        throw Error(
          'The new turnaround buffer conflicts with ' +
            b.id +
            '. Resolve the booking or maintenance first.',
        );
    }
  }
  s.settings = structuredClone(next);
}
