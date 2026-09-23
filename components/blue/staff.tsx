'use client';
import { useState, useEffect } from 'react';

import { useSearchParams } from 'next/navigation';
import {
  Bike,
  CalendarDays,
  ClipboardList,
  SlidersHorizontal,
  Coffee,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { useDemo } from './store';
import { Field, Choice, Check, Modal, TextArea, ErrorBox } from './ui';
import {
  Schedule,
  BikePicker,
  Summary,
  EmailPreview,
  initialSlot,
} from './rental';
import {
  CATEGORIES,
  localDate,
  at,
  dayPlus,
  dateTime,
  catName,
  sizeName,
  money,
  paymentStatus,
  due,
  needsPolicyReview,
  recordPayment,
  refund,
  changeStatus,
  updateBooking,
  maintenance,
  saveStock,
  saveSettings,
  availableCount,
  lineQuantity,
  rideSummary,
  walkInSlot,
  createWalkInBooking,
  demoContact,
  type Booking,
  type BookingStatus,
  type Slot,
  type Line,
  type Category,
  type Duration,
  type Settings,
  type Content,
  type Contact,
} from '@/lib/demo-model';
const tabs = [
  { id: 'today', label: 'Today', icon: CalendarDays },
  { id: 'reservations', label: 'Reservations', icon: ClipboardList },
  { id: 'bikes', label: 'Bikes', icon: Bike },
  { id: 'settings', label: 'Prices & hours', icon: SlidersHorizontal },
  { id: 'content', label: 'Website content', icon: Coffee },
];
export function Staff() {
  const { state } = useDemo();
  const params = useSearchParams();
  const [tab, setTab] = useState('today');
  const [selected, setSelected] = useState<string | null>(null);
  const [bikeEditor, setBikeEditor] = useState<string | null>(null);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All statuses');
  useEffect(() => {
    if (params.get('booking')) setSelected(params.get('booking'));
  }, [params]);
  const today = state.bookings.filter(
    (b) => localDate(b.start) === localDate() || b.status === 'Checked out',
  );
  const visible = state.bookings
    .filter(
      (b) =>
        (filter === 'All statuses' || b.status === filter) &&
        (b.name + ' ' + b.id + ' ' + b.source + ' ' + rideSummary(b.lines))
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) => b.start - a.start);
  const selectedBooking = state.bookings.find((b) => b.id === selected);
  return (
    <SidebarProvider className="staff-shell">
      <Sidebar collapsible="none" className="staff-sidebar">
        <SidebarHeader>
          <a className="staff-brand" href="/" aria-label="Blue Star Barns home">
            <img
              className="brand-logo"
              src="/blue-star-barns-chainring.jpg"
              alt="Blue Star Barns coffee and bikes, Saugatuck"
              width={1563}
              height={1563}
            />
            <small>THE BIKE DESK</small>
          </a>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {tabs.map((t) => (
              <SidebarMenuItem key={t.id}>
                <SidebarMenuButton
                  className="staff-nav-button"
                  isActive={tab === t.id}
                  onClick={() => setTab(t.id)}
                >
                  <t.icon size={19} />
                  <span>{t.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <p>
            Staff demonstration
            <br />
            Fictional data · this browser session
          </p>
          <a href="/">
            View customer site <ArrowUpRight size={16} />
          </a>
        </SidebarFooter>
      </Sidebar>
      <main id="main" className="staff-main">
        <header className="staff-page-heading">
          <div>
            <p className="eyebrow">SAMPLE OPERATIONS · EASTERN TIME</p>
            <h1>{tabs.find((t) => t.id === tab)?.label}</h1>
            <p className="muted">
              {tab === 'today'
                ? 'A clear view of what’s going out and coming back.'
                : tab === 'bikes'
                  ? 'Manage matching bikes together by type, size and quantity.'
                  : 'One sample calendar for website, partner and walk-in rentals.'}
            </p>
          </div>
          {['today', 'reservations'].includes(tab) && (
            <button className="button" onClick={() => setWalkInOpen(true)}>
              <Plus size={19} /> Add a walk-in
            </button>
          )}
          {tab === 'bikes' && (
            <button className="button" onClick={() => setBikeEditor('new')}>
              <Plus size={19} /> Add stock
            </button>
          )}
        </header>
        <p className="staff-disclaimer">
          Demo staff controls are open for review. This is not a secure
          production admin area.
        </p>
        {tab === 'today' ? (
          <>
            <div className="stats">
              <div>
                <span>UPCOMING PICKUPS</span>
                <strong>
                  {today.filter((b) => b.status === 'Confirmed').length}
                </strong>
                <small>Confirmed today</small>
              </div>
              <div>
                <span>BIKES OUT</span>
                <strong>
                  {state.bookings
                    .filter((b) => b.status === 'Checked out')
                    .reduce((a, b) => a + lineQuantity(b.lines), 0)}
                </strong>
                <small>Return must be recorded</small>
              </div>
              <div>
                <span>RETURNS DUE</span>
                <strong>
                  {
                    state.bookings.filter(
                      (b) =>
                        b.status === 'Checked out' &&
                        localDate(b.end) <= localDate(),
                    ).length
                  }
                </strong>
                <small>Bookings due today or earlier</small>
              </div>
            </div>
            <section className="staff-section">
              <div className="row-heading">
                <h2>Today’s pickups & active rentals</h2>
                <span>{localDate()}</span>
              </div>
              <ReservationRows
                bookings={today.filter((b) =>
                  ['Confirmed', 'Checked out'].includes(b.status),
                )}
                open={setSelected}
              />
            </section>
            <section className="staff-section">
              <div className="row-heading">
                <h2>Coming up next</h2>
                <button
                  className="text-link"
                  onClick={() => setTab('reservations')}
                >
                  All reservations <ArrowUpRight size={16} />
                </button>
              </div>
              <ReservationRows
                bookings={state.bookings
                  .filter(
                    (b) =>
                      b.status === 'Confirmed' &&
                      localDate(b.start) > localDate(),
                  )
                  .sort((a, b) => a.start - b.start)
                  .slice(0, 4)}
                open={setSelected}
              />
            </section>
          </>
        ) : tab === 'reservations' ? (
          <>
            <div className="staff-filters">
              <Field
                label="Search reservations"
                placeholder="Name, number, bike type or source"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Choice
                label="Reservation status"
                value={filter}
                onChange={setFilter}
                options={[
                  'All statuses',
                  'Confirmed',
                  'Checked out',
                  'Returned',
                  'Cancelled',
                  'No-show',
                ]}
              />
            </div>
            <ReservationRows bookings={visible} open={setSelected} />
          </>
        ) : tab === 'bikes' ? (
          <div className="inventory-grid">
            {state.bikes.map((b) => {
              const out = state.bookings
                .filter((r) => r.status === 'Checked out')
                .reduce((sum, r) => sum + lineQuantity(r.lines, b), 0);
              const downtime = state.blocks
                .filter(
                  (m) =>
                    m.bikeId === b.id &&
                    m.start <= Date.now() &&
                    m.end > Date.now(),
                )
                .reduce((sum, m) => sum + m.quantity, 0);
              const ready = availableCount(
                state,
                b,
                Date.now(),
                Date.now() + 1,
              );
              return (
                <article className="inventory-bike panel" key={b.id}>
                  <div className="inventory-bike-head">
                    <Bike size={33} />
                    <span className={'badge ' + (ready ? '' : 'amber')}>
                      {ready} available now
                    </span>
                  </div>
                  <h3>{catName(b.category)}</h3>
                  <p>{sizeName(b.size)}</p>
                  <dl className="stock-counts">
                    <div>
                      <dt>Total stock</dt>
                      <dd>{b.quantity}</dd>
                    </div>
                    <div>
                      <dt>Checked out</dt>
                      <dd>{out}</dd>
                    </div>
                    <div>
                      <dt>Maintenance now</dt>
                      <dd>{downtime}</dd>
                    </div>
                  </dl>
                  <p className="micro">
                    {state.bookings
                      .filter(
                        (r) =>
                          lineQuantity(r.lines, b) > 0 &&
                          r.status === 'Confirmed',
                      )
                      .reduce(
                        (sum, r) => sum + lineQuantity(r.lines, b),
                        0,
                      )}{' '}
                    bikes across confirmed reservations
                  </p>
                  <button
                    className="button outline small"
                    aria-label={
                      'Edit stock for ' +
                      catName(b.category) +
                      ' ' +
                      sizeName(b.size)
                    }
                    onClick={() => setBikeEditor(b.id)}
                  >
                    Edit stock & downtime
                  </button>
                </article>
              );
            })}
          </div>
        ) : tab === 'settings' ? (
          <SettingsForm />
        ) : (
          <ContentForm />
        )}
      </main>
      <Modal
        open={walkInOpen}
        close={() => setWalkInOpen(false)}
        title="Add a walk-in"
        description="Book at the desk using the same availability as the customer site. Use fictional rider details for this demo."
      >
        {walkInOpen && (
          <WalkInForm
            cancel={() => setWalkInOpen(false)}
            onCreated={(id) => {
              setWalkInOpen(false);
              setSelected(id);
            }}
          />
        )}
      </Modal>
      <Modal
        open={!!selectedBooking}
        close={() => setSelected(null)}
        title={selectedBooking?.id || 'Reservation'}
        description="Customer and staff views use the same demonstration inventory."
      >
        {selectedBooking && (
          <ReservationDetail
            key={selectedBooking.id}
            booking={selectedBooking}
          />
        )}
      </Modal>
      <Modal
        open={!!bikeEditor}
        close={() => setBikeEditor(null)}
        title={bikeEditor === 'new' ? 'Add stock' : 'Stock & maintenance'}
      >
        {bikeEditor && (
          <BikeEditor
            key={bikeEditor}
            id={bikeEditor}
            onDone={() => setBikeEditor(null)}
          />
        )}
      </Modal>
    </SidebarProvider>
  );
}
function WalkInForm({
  cancel,
  onCreated,
}: {
  cancel: () => void;
  onCreated: (id: string) => void;
}) {
  const { state, transact } = useDemo();
  const [pickupNow, setPickupNow] = useState(
    () =>
      !state.settings.closures.includes(localDate()) &&
      Date.now() >= at(localDate(), state.settings.open) &&
      Date.now() < at(localDate(), state.settings.close),
  );
  const [slot, setSlot] = useState<Slot>(() =>
    walkInSlot(state, Date.now(), pickupNow),
  );
  const currentSlot = pickupNow
    ? { ...walkInSlot(state, Date.now(), true), duration: slot.duration }
    : slot;
  const [lines, setLines] = useState<Line[]>([]);
  const [contact, setContact] = useState<Contact>({
    name: '',
    email: '',
    phone: '',
    notes: '',
    policy: false,
    marketing: false,
  });
  const [error, setError] = useState('');
  function save() {
    setError('');
    try {
      const booking = transact((s) =>
        createWalkInBooking(s, slot, lines, contact, pickupNow),
      );
      onCreated(booking.id);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div className="walk-in-form">
      <section>
        <h3>Choose bikes & pickup time</h3>
        <Check
          label="Pick up now"
          checked={pickupNow}
          onChange={(now) => {
            if (!now && at(slot.date, slot.time) <= Date.now()) {
              setSlot(walkInSlot(state));
            }
            setPickupNow(now);
          }}
        />
        {pickupNow ? (
          <>
            <p className="micro">
              Pickup is recorded at the current Eastern time when saved.
              Availability is checked again before booking.
            </p>
            <Choice
              label="Rental duration"
              value={slot.duration}
              onChange={(duration) =>
                setSlot({ ...slot, duration: duration as Duration })
              }
              options={[
                ['2', '2 hours'],
                ['4', '4 hours'],
                ['day', 'Day · until closing'],
              ]}
            />
          </>
        ) : (
          <Schedule slot={slot} setSlot={setSlot} />
        )}
        <BikePicker
          state={state}
          slot={currentSlot}
          lines={lines}
          setLines={setLines}
          allowCurrentMinute={pickupNow}
        />
      </section>
      <section>
        <h3>Rider details</h3>
        <Field
          label="Name"
          autoComplete="off"
          placeholder={demoContact.name}
          value={contact.name}
          onChange={(e) => setContact({ ...contact, name: e.target.value })}
          required
        />
        <div className="two-col">
          <Field
            label="Email"
            type="email"
            autoComplete="off"
            placeholder={demoContact.email}
            value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            required
          />
          <Field
            label="Phone"
            type="tel"
            autoComplete="off"
            placeholder={demoContact.phone}
            value={contact.phone}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            required
          />
        </div>
        <TextArea
          label="Notes · optional"
          value={contact.notes}
          onChange={(e) => setContact({ ...contact, notes: e.target.value })}
        />
        <p className="micro">
          Sample policy: arrive at the selected pickup time and return by the
          displayed return time. This is a demonstration, not a legally reviewed
          waiver.
        </p>
        <Check
          label="The rider acknowledges the sample rental policy."
          checked={contact.policy}
          onChange={(policy) => setContact({ ...contact, policy })}
        />
      </section>
      <Summary
        state={state}
        slot={currentSlot}
        lines={lines}
        allowCurrentMinute={pickupNow}
      />
      <div>
        <h3>Pay at pickup through DripOS</h3>
        <p className="micro">
          Save the walk-in, then use its staff controls to record pickup payment
          and check out bikes. This demo does not contact DripOS, send emails or
          take payment.
        </p>
        <ErrorBox message={error} />
        <div className="actions">
          <button className="button outline" onClick={cancel}>
            Cancel
          </button>
          <button className="button" onClick={save} disabled={!lines.length}>
            Create walk-in reservation
          </button>
        </div>
      </div>
    </div>
  );
}
function ReservationRows({
  bookings,
  open,
}: {
  bookings: Booking[];
  open: (id: string) => void;
}) {
  return bookings.length ? (
    <div className="reservation-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rider & booking</TableHead>
            <TableHead>Ride & timing</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>
              <span className="sr-only">Action</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((b) => (
            <TableRow key={b.id}>
              <TableCell>
                <strong>{b.name}</strong>
                <small>{b.id}</small>
                <small>{b.source}</small>
              </TableCell>
              <TableCell>
                <strong>{rideSummary(b.lines)}</strong>
                <small>Pickup {dateTime(b.start)} ET</small>
                <small>Return {dateTime(b.end)} ET</small>
              </TableCell>
              <TableCell>
                <span
                  className={
                    'badge ' +
                    (b.status === 'Checked out'
                      ? 'amber'
                      : b.status === 'Returned'
                        ? 'green'
                        : '')
                  }
                >
                  {b.status}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={
                    'badge ' + (paymentStatus(b) === 'Paid' ? 'green' : 'amber')
                  }
                >
                  {paymentStatus(b)}
                </span>
                <small>
                  {needsPolicyReview(b)
                    ? 'Policy review needed'
                    : money(due(b)) + ' due'}
                </small>
              </TableCell>
              <TableCell>
                <button
                  className="button small outline"
                  onClick={() => open(b.id)}
                >
                  Open <ArrowUpRight size={15} />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ) : (
    <div className="empty-state">
      <CheckCircle2 size={32} />
      <h3>All clear here.</h3>
      <p>
        No demo reservations match this view. Add a walk-in or change the
        filter.
      </p>
    </div>
  );
}
function ReservationDetail({ booking: b }: { booking: Booking }) {
  const { state, transact } = useDemo();
  const [view, setView] = useState<'detail' | 'edit' | 'payment' | 'email'>(
    'detail',
  );
  const [slot, setSlot] = useState<Slot>({
    date: b.date,
    time: b.time,
    duration: b.duration,
  });
  const [lines, setLines] = useState<Line[]>(b.lines);
  const [amount, setAmount] = useState(String(due(b)));
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState<BookingStatus | 'refund' | null>(null);
  function run(action: () => void, msg: string) {
    setError('');
    try {
      action();
      setMessage(msg);
      setView('detail');
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <ErrorBox message={error} />
      {message && (
        <p role="status" className="success">
          {message}
        </p>
      )}
      {view === 'email' ? (
        <>
          <EmailPreview booking={b} />
          <button className="button outline" onClick={() => setView('detail')}>
            Back to reservation
          </button>
        </>
      ) : view === 'edit' ? (
        <>
          <h3>Edit ride & recalculate</h3>
          <Schedule slot={slot} setSlot={setSlot} />
          <BikePicker
            state={state}
            slot={slot}
            lines={lines}
            setLines={setLines}
            ignoreId={b.id}
          />
          <div className="actions">
            <button
              className="button outline"
              onClick={() => setView('detail')}
            >
              Back
            </button>
            <button
              className="button"
              onClick={() =>
                run(
                  () => transact((s) => updateBooking(s, b.id, slot, lines)),
                  'Booking changed. The price and inventory have been updated.',
                )
              }
            >
              Save booking changes
            </button>
          </div>
        </>
      ) : view === 'payment' ? (
        <>
          <h3>Record pickup payment</h3>
          <p>
            In production, collect payment through DripOS separately, then
            record it here. This demo records a simulated event only; DripOS is
            not contacted.
          </p>
          <Field
            label={'Amount · maximum ' + money(due(b))}
            type="number"
            min=".01"
            step=".01"
            max={due(b)}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Field
            label="DripOS receipt reference · optional"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
          <div className="actions">
            <button
              className="button outline"
              onClick={() => setView('detail')}
            >
              Back
            </button>
            <button
              className="button"
              onClick={() =>
                run(
                  () =>
                    transact((s) =>
                      recordPayment(s, b.id, Number(amount), reference),
                    ),
                  'Simulated payment recorded. No payment service was contacted.',
                )
              }
            >
              Record pickup payment
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="detail-rider">
            <h3>{b.name}</h3>
            <p>
              {b.email}
              <br />
              {b.phone}
            </p>
            <p className="micro">
              Source: {b.source} · Marketing opt-in:{' '}
              {b.marketing ? 'Yes, simulated' : 'No'}
            </p>
            {b.notes && <p className="micro">{b.notes}</p>}
          </div>
          <div className="badges">
            <span className="badge">{b.status}</span>
            <span
              className={
                'badge ' + (paymentStatus(b) === 'Paid' ? 'green' : 'amber')
              }
            >
              {paymentStatus(b)}
            </span>
            <strong>
              {needsPolicyReview(b)
                ? 'Policy review needed'
                : money(due(b)) + ' due'}
            </strong>
          </div>
          {needsPolicyReview(b) && (
            <p className="micro">
              No pickup is scheduled. The balance below is the unadjusted rental
              amount, not a cancellation charge. Review the final policy and any
              refund separately.
            </p>
          )}
          {b.paid - b.refunded > b.total && (
            <p className="error">
              Recorded payment exceeds the revised price by{' '}
              {money(b.paid - b.refunded - b.total)}. Review refund and
              reconciliation. Refund simulation below refunds the entire
              recorded payment.
            </p>
          )}
          <Summary state={state} slot={b} lines={b.lines} booking={b} />
          <div className="detail-actions">
            {['Confirmed', 'Checked out'].includes(b.status) && due(b) > 0 && (
              <button
                className="button"
                onClick={() => {
                  setAmount(String(due(b)));
                  setView('payment');
                }}
              >
                Record pickup payment
              </button>
            )}
            {b.status === 'Confirmed' && (
              <>
                <button
                  className="button"
                  onClick={() =>
                    run(
                      () =>
                        transact((s) => changeStatus(s, b.id, 'Checked out')),
                      'Bike(s) checked out. They remain unavailable until return is recorded.',
                    )
                  }
                >
                  Check out
                </button>
                <button
                  className="button outline"
                  onClick={() => setView('edit')}
                >
                  Edit reservation
                </button>
                <button
                  className="button outline"
                  onClick={() => setPending('Cancelled')}
                >
                  Cancel reservation
                </button>
                <button
                  className="button outline"
                  onClick={() => setPending('No-show')}
                >
                  Mark no-show
                </button>
              </>
            )}
            {b.status === 'Checked out' && (
              <button
                className="button"
                onClick={() =>
                  run(
                    () => transact((s) => changeStatus(s, b.id, 'Returned')),
                    'Return recorded. Turnaround time begins now.',
                  )
                }
              >
                Record return
              </button>
            )}
            {b.paid > b.refunded && (
              <button
                className="button outline"
                onClick={() => setPending('refund')}
              >
                Simulate full refund
              </button>
            )}
            <button className="button outline" onClick={() => setView('email')}>
              Email preview
            </button>
          </div>
          <section className="history">
            <h3>Reservation history</h3>
            {b.history.map((h, i) => (
              <div key={i}>
                <Clock size={14} />
                <span>
                  {h.event}
                  <small>{dateTime(h.at)} ET</small>
                </span>
              </div>
            ))}
          </section>
        </>
      )}
      <AlertDialog
        open={!!pending}
        onOpenChange={(v) => !v && setPending(null)}
      >
        <AlertDialogContent>
          <AlertDialogTitle>
            {pending === 'refund'
              ? 'Simulate a full refund?'
              : 'Change reservation to ' + pending + '?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {pending === 'refund'
              ? 'This records a simulated refund only. No money moves.'
              : 'The demo releases this reservation’s future inventory immediately. Any recorded payment remains separate and may need a simulated refund.'}
          </AlertDialogDescription>
          <div className="actions">
            <AlertDialogCancel>Go back</AlertDialogCancel>
            <AlertDialogAction
              className="button"
              onClick={() => {
                const action = pending;
                setPending(null);
                run(
                  () =>
                    transact((s) =>
                      action === 'refund'
                        ? refund(s, b.id)
                        : changeStatus(s, b.id, action as BookingStatus),
                    ),
                  'Demo updated.',
                );
              }}
            >
              Confirm demo action
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
function BikeEditor({ id, onDone }: { id: string; onDone: () => void }) {
  const { state, transact } = useDemo();
  const existing = state.bikes.find((b) => b.id === id);
  const [category, setCategory] = useState<Category>(
    existing?.category || 'comfort',
  );
  const [size, setSize] = useState(existing?.size || 'M');
  const [quantity, setQuantity] = useState(String(existing?.quantity ?? 1));
  const [downQuantity, setDownQuantity] = useState('1');
  const currentStock =
    state.bikes.find((b) => b.category === category && b.size === size)
      ?.quantity || 0;
  const [startDate, setStartDate] = useState(dayPlus(1));
  const [startTime, setStartTime] = useState('10:00');
  const [endDate, setEndDate] = useState(dayPlus(1));
  const [endTime, setEndTime] = useState('18:00');
  const [reason, setReason] = useState('Sample maintenance');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  function save() {
    setError('');
    try {
      const count = Number(quantity);
      if (
        !quantity.trim() ||
        !Number.isInteger(count) ||
        count < (existing ? 0 : 1)
      )
        throw Error(
          'Enter a whole-number quantity' +
            (existing ? ' of zero or more.' : ' of at least one.'),
        );
      transact((s) => {
        const current =
          s.bikes.find((b) => b.category === category && b.size === size)
            ?.quantity || 0;
        saveStock(s, category, size, existing ? count : current + count);
      });
      onDone();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <ErrorBox message={error} />
      {message && (
        <p className="success" role="status">
          {message}
        </p>
      )}
      {existing ? (
        <h3>
          {catName(category)} · {sizeName(size)}
        </h3>
      ) : (
        <div className="two-col">
          <Choice
            label="Bike type"
            value={category}
            onChange={(v) => {
              const c = CATEGORIES.find((c) => c.id === v)!;
              setCategory(c.id);
              setSize(c.sizes[0]);
            }}
            options={CATEGORIES.map((c) => [c.id, c.name])}
          />
          <Choice
            label="Size"
            value={size}
            onChange={setSize}
            options={CATEGORIES.find((c) => c.id === category)!.sizes.map(
              (s) => [s, sizeName(s)],
            )}
          />
        </div>
      )}
      <Field
        label={existing ? 'Total in stock' : 'Quantity to add'}
        type="number"
        min={existing ? 0 : 1}
        max={100}
        step={1}
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />
      <p className="micro">
        {existing
          ? 'Include all matching bikes, including those rented or in maintenance. Existing reservations are protected when you reduce stock.'
          : `${currentStock} currently in stock. Added bikes join this same type and size.`}
      </p>
      <button className="button" onClick={save}>
        {existing ? 'Save stock quantity' : 'Add to stock'}
      </button>
      {existing && (
        <>
          <hr />
          <h3>Schedule maintenance downtime</h3>
          <p className="micro">
            Take a quantity out of service for these dates. The remaining stock
            stays bookable; downtime cannot exceed available stock.
          </p>
          <div className="two-col">
            <Field
              label="Start date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Field
              label="Start time · Eastern"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <Field
              label="End date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Field
              label="End time · Eastern"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <Field
            label="Quantity in maintenance"
            type="number"
            min={1}
            max={currentStock}
            step={1}
            value={downQuantity}
            onChange={(e) => setDownQuantity(e.target.value)}
          />
          <Field
            label="Maintenance reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <button
            className="button outline"
            onClick={() => {
              setError('');
              try {
                transact((s) =>
                  maintenance(
                    s,
                    id,
                    at(startDate, startTime),
                    at(endDate, endTime),
                    reason,
                    Number(downQuantity),
                  ),
                );
                setMessage(
                  'Maintenance saved. Sample availability is updated.',
                );
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            Save downtime
          </button>
          <div className="maintenance-list">
            {state.blocks
              .filter((b) => b.bikeId === id)
              .map((block) => (
                <div key={block.id}>
                  <strong>
                    {block.quantity} × {catName(category)} · {sizeName(size)}
                  </strong>
                  <p>{block.reason}</p>
                  <p>
                    {dateTime(block.start)} → {dateTime(block.end)} ET
                  </p>
                  <button
                    className="text-link"
                    onClick={() =>
                      transact((s) => {
                        s.blocks = s.blocks.filter((b) => b.id !== block.id);
                      })
                    }
                  >
                    Remove demo downtime
                  </button>
                </div>
              ))}
          </div>
        </>
      )}
    </>
  );
}
function SettingsForm() {
  const { state, transact } = useDemo();
  const [settings, setSettings] = useState<Settings>(
    structuredClone(state.settings),
  );
  const [closures, setClosures] = useState(state.settings.closures.join('\n'));
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  return (
    <form
      className="settings-form stack"
      onSubmit={(e) => {
        e.preventDefault();
        setError('');
        setSaved(false);
        try {
          transact((s) =>
            saveSettings(s, {
              ...settings,
              closures: closures
                .split('\n')
                .map((x) => x.trim())
                .filter(Boolean),
            }),
          );
          setSaved(true);
        } catch (err) {
          setError((err as Error).message);
        }
      }}
    >
      <ErrorBox message={error} />
      {saved && (
        <p className="success" role="status">
          Sample settings saved. New reservations use these rates and hours;
          existing prices remain as booked.
        </p>
      )}
      <section className="panel stack">
        <h2 className="flow-title">Sample rental rates</h2>
        <p className="muted">USD per bike, excluding applicable taxes.</p>
        {CATEGORIES.map((c) => (
          <div className="rate-editor" key={c.id}>
            <h3>{c.name}</h3>
            <div className="schedule">
              {(['2', '4', 'day'] as Duration[]).map((d) => (
                <Field
                  key={d}
                  label={d === 'day' ? 'Day rental' : d + ' hours'}
                  type="number"
                  min="0"
                  step=".01"
                  required
                  value={settings.rates[c.id][d]}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rates: {
                        ...settings.rates,
                        [c.id]: {
                          ...settings.rates[c.id],
                          [d]: +e.target.value,
                        },
                      },
                    })
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </section>
      <section className="panel stack">
        <h2 className="flow-title">Sample hours & turnaround</h2>
        <div className="schedule">
          <Field
            label="Earliest pickup"
            type="time"
            value={settings.open}
            required
            onChange={(e) => setSettings({ ...settings, open: e.target.value })}
          />
          <Field
            label="Return by"
            type="time"
            value={settings.close}
            required
            onChange={(e) =>
              setSettings({ ...settings, close: e.target.value })
            }
          />
          <Field
            label="Turnaround · minutes"
            type="number"
            min="0"
            max="240"
            step="1"
            value={settings.buffer}
            required
            onChange={(e) =>
              setSettings({ ...settings, buffer: +e.target.value })
            }
          />
        </div>
        <TextArea
          label="Closure dates · YYYY-MM-DD, one per line"
          value={closures}
          onChange={(e) => setClosures(e.target.value)}
        />
        <p className="micro">
          Day rentals end at closing. Changes that conflict with active bookings
          are rejected for staff review.
        </p>
      </section>
      <button className="button" type="submit">
        Save prices & hours
      </button>
    </form>
  );
}
function ContentForm() {
  const { state, transact } = useDemo();
  const [content, setContent] = useState<Content>({ ...state.content });
  const [saved, setSaved] = useState(false);
  return (
    <form
      className="settings-form panel stack"
      onSubmit={(e) => {
        e.preventDefault();
        transact((s) => {
          s.content = { ...content };
        });
        setSaved(true);
      }}
    >
      <h2 className="flow-title">A few words from the Barns.</h2>
      <p className="muted">
        Edits appear immediately on the customer homepage in this demo session.
      </p>
      {saved && (
        <p className="success" role="status">
          Website content saved.{' '}
          <a className="text-link" href="/">
            View the homepage
          </a>
        </p>
      )}
      <TextArea
        label="Café introduction"
        required
        value={content.intro}
        onChange={(e) => setContent({ ...content, intro: e.target.value })}
      />
      <TextArea
        label="Sample menu · one item per line"
        required
        value={content.menu}
        onChange={(e) => setContent({ ...content, menu: e.target.value })}
      />
      <Field
        label="Coffee hours"
        required
        value={content.coffeeHours}
        onChange={(e) =>
          setContent({ ...content, coffeeHours: e.target.value })
        }
      />
      <Field
        label="Bike pickup & return hours"
        required
        value={content.bikeHours}
        onChange={(e) => setContent({ ...content, bikeHours: e.target.value })}
      />
      <button className="button" type="submit">
        Save website content
      </button>
    </form>
  );
}
