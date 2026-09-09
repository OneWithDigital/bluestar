'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { RotateCcw, Star, ArrowUpRight } from 'lucide-react';
import { Home, Brand, QuickBook, Footer } from './home';
import { DemoProvider, useDemo } from './store';
import { Choice } from './ui';
import { Rental, Confirmation } from './rental';
import { Staff } from './staff';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { availability, type PaymentMode, type Slot } from '@/lib/demo-model';
export default function Site() {
  return (
    <DemoProvider>
      <Surface />
    </DemoProvider>
  );
}
function Surface() {
  const { state, transact, reset } = useDemo();
  const path = usePathname();
  const query = useSearchParams();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  useEffect(() => {
    const ctx = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: unknown,
            options: unknown,
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!ctx?.registerTool) return;
    const lifecycle = new AbortController();
    const schema = {
      type: 'object',
      properties: {
        date: { type: 'string' },
        time: { type: 'string' },
        duration: { type: 'string', enum: ['2', '4', 'day'] },
      },
      required: ['date', 'time', 'duration'],
      additionalProperties: false,
    };
    const validate = (input: unknown) => {
      if (!input || typeof input !== 'object')
        throw Error('A rental date, time and duration are required.');
      const v = input as Slot;
      if (
        typeof v.date !== 'string' ||
        typeof v.time !== 'string' ||
        !['2', '4', 'day'].includes(v.duration)
      )
        throw Error('Invalid rental selection.');
      return v;
    };
    for (const tool of [
      {
        name: 'read_demo_bike_availability',
        title: 'Read demo bike availability',
        description:
          'Read fictional category and size availability for an Eastern-time interval. Does not reserve bikes.',
        inputSchema: schema,
        annotations: { readOnlyHint: true, untrustedContentHint: false },
        execute(input: unknown) {
          return {
            sample: true,
            availability: availability(stateRef.current, validate(input)),
          };
        },
      },
      {
        name: 'start_demo_bike_reservation',
        title: 'Start demo bike reservation',
        description:
          'Open the Choose your ride screen with a valid rental interval. Does not create a reservation or take payment.',
        inputSchema: schema,
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input: unknown) {
          const slot = validate(input);
          const rows = availability(stateRef.current, slot);
          router.push(
            '/rent?' +
              new URLSearchParams({ ...slot, source: 'Website' }).toString(),
          );
          return {
            stage: 'Choose your ride',
            reservationCreated: false,
            availability: rows,
          };
        },
      },
    ]) {
      try {
        void Promise.resolve(
          ctx.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {});
      } catch {}
    }
    return () => lifecycle.abort();
  }, [router]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="preview-notice">
        Website preview — sample prices and availability. No real reservations
        or payments.
      </div>
      <div className="review-bar">
        <span className="review-label">
          <Star size={13} /> REVIEW THE EXAMPLE
        </span>
        <nav aria-label="Reviewer">
          <Link aria-current={path === '/' ? 'page' : undefined} href="/">
            Customer site
          </Link>
          <Link
            aria-current={path === '/staff-demo' ? 'page' : undefined}
            href="/staff-demo"
          >
            Staff demo
          </Link>
          <Link
            aria-current={path === '/partner-demo' ? 'page' : undefined}
            href="/partner-demo"
          >
            Partner demo
          </Link>
        </nav>
        <Choice
          label="Payment preview"
          value={state.paymentMode}
          onChange={(v) =>
            transact((s) => {
              s.paymentMode = v as PaymentMode;
            })
          }
          options={[
            ['pickup', 'Pay at pickup'],
            ['deposit', '20% deposit · simulated'],
            ['full', 'Full payment · simulated'],
          ]}
        />
        <button className="reset-button" onClick={() => setConfirm(true)}>
          <RotateCcw size={14} /> Reset demo
        </button>
      </div>
      {path === '/staff-demo' ? (
        <Staff />
      ) : path === '/rent' ? (
        <Rental key={path + query.toString()} />
      ) : path === '/partner-demo' ? (
        <Partner />
      ) : path.startsWith('/reservation/') ? (
        <Confirmation id={decodeURIComponent(path.split('/').pop() || '')} />
      ) : (
        <Home
          content={state.content}
          rates={[
            state.settings.rates.comfort['2'],
            state.settings.rates.ebike['2'],
            state.settings.rates.hybrid['2'],
          ]}
        />
      )}
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Reset this demonstration?</AlertDialogTitle>
          <AlertDialogDescription>
            This clears local demo bookings and edits, restores the sample
            fleet, and returns to pay at pickup.
          </AlertDialogDescription>
          <div className="actions">
            <AlertDialogCancel>Keep my changes</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                reset();
                setConfirm(false);
                router.push('/');
              }}
              className="button"
            >
              Reset demo
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
function Partner() {
  return (
    <>
      <header className="partner-header wrap">
        <span>EXAMPLE LODGING PARTNER</span>
        <span className="micro">Fictional partner website</span>
      </header>
      <main className="partner-page wrap section" id="main">
        <p className="eyebrow">MAKE YOURSELF AT HOME</p>
        <h1>
          A stay with
          <br />
          <em>room to explore.</em>
        </h1>
        <p className="partner-intro">
          Add a little fresh air to your visit. Reserve a bike with Blue Star
          Barns Coffee & Bikes in Saugatuck.
        </p>
        <div className="partner-options">
          <section className="panel">
            <p className="eyebrow">01 · BOOKING LINK</p>
            <Brand />
            <p>Head to Blue Star Barns to choose your ride.</p>
            <Link
              className="button"
              href="/rent?source=Example%20lodging%20partner"
            >
              Reserve bikes at Blue Star Barns <ArrowUpRight size={18} />
            </Link>
          </section>
          <section className="panel">
            <p className="eyebrow">02 · COMPACT BOOKING WIDGET</p>
            <h3>A ride for your getaway.</h3>
            <QuickBook source="Example lodging partner" compact />
            <p className="micro">
              Same sample fleet and calendar. This is an in-page widget example;
              a cross-domain embed is not active.
            </p>
            <Link
              className="text-link"
              href="/rent?source=Example%20lodging%20partner"
            >
              Open booking page instead <ArrowUpRight size={16} />
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
