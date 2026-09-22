'use client';
import { useEffect, useState } from 'react';

import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  Bike,
  Check as CheckIcon,
  MapPin,
  Clock,
  Mail,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { Header, Footer } from './home';
import { useDemo } from './store';
import { Field, Choice, Check, TextArea, Modal, ErrorBox } from './ui';
import {
  CATEGORIES,
  dayPlus,
  localDate,
  clockTime,
  dateTime,
  catName,
  sizeName,
  money,
  totalFor,
  slotInterval,
  availability,
  assign,
  createBooking,
  demoContact,
  paymentStatus,
  due,
  balanceLabel,
  needsPolicyReview,
  type Slot,
  type Line,
  type State,
  type Booking,
  type Duration,
  type Contact,
} from '@/lib/demo-model';
export const initialSlot = (): Slot => ({
  date: dayPlus(1),
  time: '10:00',
  duration: '2',
});
export function Schedule({
  slot,
  setSlot,
}: {
  slot: Slot;
  setSlot: (v: Slot) => void;
}) {
  return (
    <div className="schedule">
      <Field
        label="Pickup date"
        type="date"
        value={slot.date}
        min={localDate()}
        onChange={(e) => setSlot({ ...slot, date: e.target.value })}
        required
      />
      <Field
        label="Pickup time · Eastern"
        type="time"
        value={slot.time}
        onChange={(e) => setSlot({ ...slot, time: e.target.value })}
        required
      />
      <Choice
        label="Rental duration"
        value={slot.duration}
        onChange={(v) => setSlot({ ...slot, duration: v as Duration })}
        options={[
          ['2', '2 hours'],
          ['4', '4 hours'],
          ['day', 'Day · until closing'],
        ]}
      />
    </div>
  );
}
export function BikePicker({
  state,
  slot,
  lines,
  setLines,
  ignoreId,
}: {
  state: State;
  slot: Slot;
  lines: Line[];
  setLines: (v: Line[]) => void;
  ignoreId?: string;
}) {
  let rows: ReturnType<typeof availability> = [],
    error = '';
  try {
    rows = availability(state, slot, ignoreId);
  } catch (e) {
    error = (e as Error).message;
  }
  const update = (category: Line['category'], size: string, qty: number) => {
    const rest = lines.filter(
      (l) => !(l.category === category && l.size === size),
    );
    setLines(qty > 0 ? [...rest, { category, size, qty }] : rest);
  };
  return (
    <>
      <ErrorBox message={error} />
      <div className="pickers">
        {CATEGORIES.map((c, i) => (
          <section className="picker" key={c.id}>
            <div className={'picker-icon bike-tone-' + i}>
              <Bike size={46} strokeWidth={1.3} />
            </div>
            <div className="picker-main">
              <div className="picker-title">
                <div>
                  <h3>{c.name}</h3>
                  <p>{c.description}</p>
                </div>
                <div className="picker-price">
                  {money(state.settings.rates[c.id][slot.duration] || 0)}
                  <small>sample / bike</small>
                </div>
              </div>
              {c.sizes.map((size) => {
                const n =
                  rows.find((r) => r.category === c.id && r.size === size)
                    ?.count || 0;
                const qty =
                  lines.find((l) => l.category === c.id && l.size === size)
                    ?.qty || 0;
                return (
                  <div className="size-row" key={size}>
                    <div>
                      <strong>{sizeName(size)}</strong>
                      <span className={n ? 'available' : 'unavailable'}>
                        {n
                          ? n + ' available'
                          : 'Unavailable — try another size or time'}
                      </span>
                    </div>
                    <div className="quantity">
                      <button
                        aria-label={'Remove ' + c.name + ' ' + sizeName(size)}
                        disabled={!qty}
                        onClick={() => update(c.id, size, qty - 1)}
                      >
                        −
                      </button>
                      <output
                        aria-live="polite"
                        aria-label={c.name + ' ' + sizeName(size) + ' quantity'}
                      >
                        {qty}
                      </output>
                      <button
                        aria-label={'Add ' + c.name + ' ' + sizeName(size)}
                        disabled={qty >= n || !!error}
                        onClick={() => update(c.id, size, qty + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <p className="micro">
        Fictional inventory and prices · Tax excluded · Category and size
        availability includes the turnaround buffer.
      </p>
    </>
  );
}
export function Summary({
  state,
  slot,
  lines,
  booking,
}: {
  state: State;
  slot: Slot;
  lines: Line[];
  booking?: Booking;
}) {
  let end = booking?.end || 0;
  if (!booking)
    try {
      end = slotInterval(state, slot).end;
    } catch {}
  const total = booking?.total ?? totalFor(state, lines, slot.duration);
  return (
    <div className="summary-inner">
      <p className="eyebrow">YOUR DAY ON TWO WHEELS</p>
      <h3>Your ride, at a glance.</h3>
      <div className="summary-time">
        <Clock size={20} />
        <div>
          <strong>{slot.date}</strong>
          <p>
            {slot.time} → {end ? clockTime(end) : 'Choose a valid return time'}{' '}
            ET
          </p>
          <small>
            {slot.duration === 'day'
              ? 'Day rental ends at closing'
              : slot.duration + '-hour rental'}
          </small>
        </div>
      </div>
      <div className="summary-lines">
        {lines.length ? (
          lines.map((l) => (
            <div key={l.category + l.size}>
              <span>
                {l.qty} × {catName(l.category)}
                <small>{sizeName(l.size)}</small>
              </span>
              <strong>
                {booking
                  ? ''
                  : money(
                      state.settings.rates[l.category][slot.duration] * l.qty,
                    )}
              </strong>
            </div>
          ))
        ) : (
          <p className="muted">Choose your first bike to start.</p>
        )}
      </div>
      <div className="summary-total">
        <span>Estimated rental total</span>
        <strong>{money(total)}</strong>
      </div>
      {booking && (
        <>
          <div className="summary-row">
            <span>Recorded payment</span>
            <strong>{money(booking.paid - booking.refunded)}</strong>
          </div>
          <div className="summary-row">
            <span>{balanceLabel(booking)}</span>
            <strong>{money(due(booking))}</strong>
          </div>
        </>
      )}
      <p className="micro">
        Sample prices exclude applicable taxes. Equipment inclusions and final
        policies await confirmation.
      </p>
      <div className="pickup-place">
        <MapPin size={20} />
        <p>
          Blue Star Barns
          <br />
          3483 Blue Star Highway
          <br />
          Saugatuck, Michigan
        </p>
      </div>
    </div>
  );
}
export function Rental() {
  const { state, transact } = useDemo();
  const params = useSearchParams();

  const [slot, setSlot] = useState<Slot>(() => ({
    date: params.get('date') || dayPlus(1),
    time: params.get('time') || '10:00',
    duration: (['2', '4', 'day'].includes(params.get('duration') || '')
      ? params.get('duration')
      : '2') as Duration,
  }));
  const [lines, setLines] = useState<Line[]>(() => {
    const cat = CATEGORIES.find((c) => c.id === params.get('category'));
    return cat ? [{ category: cat.id, size: cat.sizes[0], qty: 1 }] : [];
  });
  const [contact, setContact] = useState<Contact>({
    name: '',
    email: '',
    phone: '',
    notes: '',
    policy: false,
    marketing: false,
  });
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [checkout, setCheckout] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [busy, setBusy] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(true);
  useEffect(() => {
    setSummaryOpen(window.matchMedia('(min-width: 761px)').matches);
  }, []);
  const source =
    params.get('source') === 'Example lodging partner'
      ? 'Example lodging partner'
      : params.get('source') === 'Walk-in'
        ? 'Walk-in'
        : 'Website';
  const mode = source === 'Walk-in' ? 'pickup' : state.paymentMode;
  const total = totalFor(state, lines, slot.duration);
  const payNow =
    mode === 'deposit'
      ? Math.round(total * 0.2 * 100) / 100
      : mode === 'full'
        ? total
        : 0;
  function next() {
    setError('');
    try {
      assign(state, slot, lines);
      if (step === 1) {
        if (
          !contact.name.trim() ||
          !/^\S+@\S+\.\S+$/.test(contact.email) ||
          contact.phone.replace(/\D/g, '').length < 7 ||
          !contact.policy
        )
          throw Error(
            'Enter demo name, email and phone, then acknowledge the sample rental policy.',
          );
      }
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError((e as Error).message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  async function confirm(paid = false) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await new Promise((resolve) => setTimeout(resolve, 280));
      const id = transact(
        (s) => createBooking(s, slot, lines, contact, source, mode, paid).id,
      );
      setCheckout(false);
      window.location.assign('/reservation/' + id);
    } catch (e) {
      setError((e as Error).message);
      setCheckout(false);
    } finally {
      setBusy(false);
    }
  }
  const field = (k: keyof Contact, v: string | boolean) =>
    setContact({ ...contact, [k]: v });
  function conflict() {
    try {
      transact((s) =>
        createBooking(
          s,
          slot,
          lines,
          { ...demoContact, name: 'Conflict Test Rider', policy: true },
          'Reviewer conflict test',
          'pickup',
        ),
      );
      setError(
        'Another demo booking has taken your selected bike(s). Confirm to see the availability recheck, or go back and choose alternatives.',
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <Header />
      <main className="rent-page wrap section" id="main">
        <p className="eyebrow">
          {source === 'Website'
            ? 'RESERVE ONLINE. PAY WHEN YOU ARRIVE.'
            : source.toUpperCase()}
        </p>
        <h1>
          Your next ride
          <br className="mobile-only" />
          <em> starts here.</em>
        </h1>
        <ol className="steps" aria-label="Reservation progress">
          {['Choose your ride', 'Your details', 'Confirm'].map((t, i) => (
            <li
              key={t}
              aria-current={step === i ? 'step' : undefined}
              className={step === i ? 'current' : step > i ? 'complete' : ''}
            >
              <span>{step > i ? <CheckIcon size={15} /> : i + 1}</span>
              {t}
            </li>
          ))}
        </ol>
        <div className="rent-grid">
          <section>
            <ErrorBox message={error} />
            {step === 0 ? (
              <>
                <h2 className="flow-title">Make time for a ride.</h2>
                <Schedule slot={slot} setSlot={setSlot} />
                <p className="micro">
                  Sample pickup {state.settings.open}–{state.settings.close} ·
                  Returns by {state.settings.close} · {state.settings.buffer}
                  -minute turnaround.
                </p>
                <BikePicker
                  state={state}
                  slot={slot}
                  lines={lines}
                  setLines={setLines}
                />
                <button
                  className="button next-button"
                  disabled={!lines.length}
                  onClick={next}
                >
                  Continue to your details <ArrowRight size={18} />
                </button>
              </>
            ) : step === 1 ? (
              <>
                <h2 className="flow-title">Who’s coming along?</h2>
                <p className="muted">
                  Use fictional details only. No account is needed and no email
                  will be sent.
                </p>
                <div className="two-col details-fields">
                  <Field
                    label="Name"
                    autoComplete="off"
                    placeholder={demoContact.name}
                    value={contact.name}
                    onChange={(e) => field('name', e.target.value)}
                    required
                  />
                  <Field
                    label="Email"
                    type="email"
                    autoComplete="off"
                    placeholder={demoContact.email}
                    value={contact.email}
                    onChange={(e) => field('email', e.target.value)}
                    required
                  />
                  <Field
                    label="Phone"
                    type="tel"
                    autoComplete="off"
                    placeholder={demoContact.phone}
                    value={contact.phone}
                    onChange={(e) => field('phone', e.target.value)}
                    required
                  />
                </div>
                <TextArea
                  label="Notes · optional"
                  value={contact.notes}
                  onChange={(e) => field('notes', e.target.value)}
                />
                <div className="policy">
                  <h3>Sample rental policy</h3>
                  <p>
                    Arrive for your selected pickup time and return bikes by the
                    displayed return time. This acknowledgement is for the
                    demonstration and is not a legally reviewed waiver.
                  </p>
                  <Check
                    label="I acknowledge the sample rental policy."
                    checked={contact.policy}
                    onChange={(v) => field('policy', v)}
                  />
                  <Check
                    label="I would like occasional news and offers. Optional; no subscription will be created in this demo."
                    checked={contact.marketing}
                    onChange={(v) => field('marketing', v)}
                  />
                </div>
                <div className="actions">
                  <button className="button outline" onClick={() => setStep(0)}>
                    <ArrowLeft size={17} /> Back
                  </button>
                  <button className="button" onClick={next}>
                    Review reservation <ArrowRight size={17} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="flow-title">One last look.</h2>
                <div className="panel stack">
                  <div>
                    <h3>{contact.name}</h3>
                    <p>
                      {contact.email} · {contact.phone}
                    </p>
                    {contact.notes && (
                      <p className="micro">Notes: {contact.notes}</p>
                    )}
                  </div>
                  <div className="payment-choice">
                    <ShieldCheck size={28} />
                    <div>
                      <h3>
                        {mode === 'pickup'
                          ? 'Pay at pickup'
                          : mode === 'full'
                            ? 'Full online payment · simulated'
                            : '20% booking deposit · simulated'}
                      </h3>
                      <p>
                        {mode === 'pickup'
                          ? 'Reserve now, then pay through DripOS when you arrive.'
                          : mode === 'full'
                            ? 'Preview paying the full rental amount in a hosted checkout.'
                            : 'Sample booking deposit, with the remaining 80% due at pickup. This is not a damage deposit.'}
                      </p>
                    </div>
                  </div>
                  <div className="summary-row">
                    <span>
                      {mode === 'pickup'
                        ? 'Due at pickup'
                        : 'Due in simulated checkout'}
                    </span>
                    <strong>{money(mode === 'pickup' ? total : payNow)}</strong>
                  </div>
                  {mode === 'deposit' && (
                    <div className="summary-row">
                      <span>Balance at pickup</span>
                      <strong>{money(total - payNow)}</strong>
                    </div>
                  )}
                  <p className="micro">
                    No real reservation or charge. Your selected bikes are
                    rechecked when the demo is confirmed.
                  </p>
                </div>
                <div className="actions">
                  <button className="button outline" onClick={() => setStep(1)}>
                    <ArrowLeft size={17} /> Back
                  </button>
                  <button
                    className="button"
                    disabled={busy}
                    onClick={() =>
                      mode === 'pickup' ? confirm() : setCheckout(true)
                    }
                  >
                    {busy
                      ? 'Checking availability…'
                      : mode === 'pickup'
                        ? 'Confirm reservation'
                        : 'Open simulated checkout'}{' '}
                    <ArrowRight size={17} />
                  </button>
                </div>
                <details className="review-test">
                  <summary>Reviewer: test an inventory conflict</summary>
                  <p>
                    Creates another fictional reservation for this selection,
                    then keeps your form intact for a confirmation recheck.
                  </p>
                  <button className="button small outline" onClick={conflict}>
                    Simulate another booking
                  </button>
                </details>
              </>
            )}
          </section>
          <aside className="rental-summary">
            <details
              open={summaryOpen}
              onToggle={(e) => setSummaryOpen(e.currentTarget.open)}
            >
              <summary>Rental summary · {money(total)}</summary>
              <Summary state={state} slot={slot} lines={lines} />
            </details>
          </aside>
        </div>
      </main>
      <Footer />
      <Modal
        title="Simulated hosted checkout"
        description="Payment demonstration only. Do not enter card details. No processor is connected."
        open={checkout}
        close={() => {
          setCheckout(false);
          setPaymentError('');
        }}
      >
        <div className="checkout-amount">
          <CreditCard size={32} />
          <span>{money(payNow)}</span>
          <p>
            {mode === 'deposit'
              ? 'Sample 20% booking deposit'
              : 'Sample full rental payment'}
          </p>
        </div>
        <ErrorBox message={paymentError} />
        <p>
          Bikes are not held while this screen is open. Success rechecks
          availability and creates one demo reservation. Failure or cancellation
          creates none.
        </p>
        <button
          className="button"
          disabled={busy}
          onClick={() => confirm(true)}
        >
          {busy ? 'Checking availability…' : 'Simulate successful payment'}
        </button>
        <button
          className="button outline"
          disabled={busy}
          onClick={() =>
            setPaymentError(
              'Simulated payment failed. Nothing was charged or reserved. Retry success, or cancel and return to your booking.',
            )
          }
        >
          Simulate failed payment
        </button>
        <button
          className="text-link"
          disabled={busy}
          onClick={() => {
            setCheckout(false);
            setPaymentError('');
          }}
        >
          Cancel and return
        </button>
      </Modal>
    </>
  );
}
export function Confirmation({ id }: { id: string }) {
  const { state } = useDemo();
  const [email, setEmail] = useState(false);
  const b = state.bookings.find((b) => b.id === id);
  if (!b)
    return (
      <>
        <Header />
        <main id="main" className="wrap section">
          <h1>Let’s start a new ride.</h1>
          <p className="muted">
            This demo reservation isn’t in this browser session. A reset or a
            new day starts a fresh sample fleet.
          </p>
          <a className="button" href="/rent">
            Choose a ride
          </a>
        </main>
      </>
    );
  return (
    <>
      <Header />
      <main id="main" className="confirmation wrap section">
        <div className="confirmation-heading">
          <span className="confirmation-check">
            <CheckIcon size={34} />
          </span>
          <p className="eyebrow">{b.id}</p>
          <h1>
            Demo reservation
            <br />
            <em>
              {['Cancelled', 'No-show', 'Returned'].includes(b.status)
                ? b.status.toLowerCase()
                : 'confirmed'}
              .
            </em>
          </h1>
          <p>
            {['Cancelled', 'No-show', 'Returned'].includes(b.status)
              ? 'Your demo reservation status has been updated.'
              : 'Thanks, ' +
                b.name.split(' ')[0] +
                '. Your sample ride is on the calendar.'}
          </p>
          <div className="badges">
            <span className="badge">{b.status}</span>
            <span
              className={
                'badge ' + (paymentStatus(b) === 'Paid' ? 'green' : 'amber')
              }
            >
              {paymentStatus(b)}
            </span>
          </div>
        </div>
        <div className="confirmation-grid">
          <div className="panel">
            <Summary state={state} slot={b} lines={b.lines} booking={b} />
          </div>
          <div className="stack">
            <section className="panel">
              <h3>
                {needsPolicyReview(b)
                  ? 'No pickup is scheduled'
                  : b.paymentMode === 'pickup'
                    ? 'Pay at pickup through DripOS'
                    : b.paymentMode === 'deposit'
                      ? 'Simulated booking deposit recorded'
                      : 'Simulated online payment recorded'}
              </h3>
              <p className="muted">
                {balanceLabel(b)}: <strong>{money(due(b))}</strong>
              </p>
              {needsPolicyReview(b) && (
                <p className="micro">
                  This is the unadjusted rental balance, not a cancellation
                  charge. Staff must review the final policy and any refund.
                </p>
              )}
              <p className="micro">
                Pickup {dateTime(b.start)} ET.
                <br />
                Return {dateTime(b.end)} ET.
                <br />
                No real reservation, email or payment was made.
              </p>
            </section>
            <button className="button" onClick={() => setEmail(true)}>
              <Mail size={18} /> View confirmation email preview
            </button>
            <a className="button outline" href="/">
              Back to website <ArrowRight size={18} />
            </a>
            <a className="text-link" href={'/staff-demo?booking=' + b.id}>
              Review this reservation in staff demo <ArrowUpRightSafe />
            </a>
          </div>
        </div>
      </main>
      <Footer />
      <Modal
        open={email}
        close={() => setEmail(false)}
        title="Confirmation email preview"
        description="No email was sent. This message uses the current demo reservation."
      >
        <EmailPreview booking={b} />
      </Modal>
    </>
  );
}
function ArrowUpRightSafe() {
  return <ArrowRight size={16} />;
}
export function EmailPreview({ booking: b }: { booking: Booking }) {
  return (
    <article className="email-preview">
      <div className="email-meta">
        <p>
          <strong>To:</strong> {b.email}
        </p>
        <p>
          <strong>Subject:</strong> Your Blue Star Barns demo reservation ·{' '}
          {b.id}
        </p>
      </div>
      <h3>Hi {b.name},</h3>
      <p>Your demo reservation is {b.status.toLowerCase()}.</p>
      <ul>
        {b.lines.map((l) => (
          <li key={l.category + l.size}>
            {l.qty} × {catName(l.category)}, {sizeName(l.size)}
          </li>
        ))}
      </ul>
      <p>
        <strong>Pickup:</strong> {dateTime(b.start)} ET
        <br />
        <strong>Return:</strong> {dateTime(b.end)} ET
      </p>
      <p>3483 Blue Star Highway, Saugatuck, Michigan</p>
      <p>
        <strong>Payment:</strong> {paymentStatus(b)}
        <br />
        <strong>{balanceLabel(b)}:</strong> {money(due(b))}
      </p>
      {needsPolicyReview(b) && (
        <p>
          No pickup is scheduled. The unadjusted rental balance requires policy
          review; it is not a cancellation charge.
        </p>
      )}
      <p className="micro">
        Website preview — sample prices and availability. No real reservations
        or payments. No email was sent.
      </p>
    </article>
  );
}
