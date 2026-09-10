'use client';
import { useState } from 'react';

import {
  ArrowUpRight,
  ArrowRight,
  Bike,
  Coffee,
  MapPin,
  Menu,
  X,
} from 'lucide-react';
import { Field, Choice } from './ui';
export const DEFAULT_CONTENT = {
  intro:
    'A good day starts with a cup in hand. Settle in for coffee and locally sourced baked goods, with space to slow down inside or on the patio.',
  menu: 'Espresso\nLatte\nCold brew\nLocally sourced baked goods',
  coffeeHours: 'Seasonal hours to be confirmed',
  bikeHours: 'Seasonal hours to be confirmed',
};
export function Brand({
  variant = 'bird',
}: {
  variant?: 'bird' | 'chainring';
}) {
  return (
    <a href="/" className="brand" aria-label="Blue Star Barns home">
      <img
        className="brand-logo"
        src={
          variant === 'bird'
            ? '/blue-star-barns-logo.jpg'
            : '/blue-star-barns-chainring.jpg'
        }
        alt="Blue Star Barns — good coffee, cool bikes, Saugatuck"
        width={500}
        height={500}
      />
      <span className="brand-name" aria-hidden="true">
        Blue Star Barns<small>COFFEE & BIKES · SAUGATUCK, MI</small>
      </span>
    </a>
  );
}
export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header wrap">
      <Brand />
      <nav
        className={open ? 'public-nav is-open' : 'public-nav'}
        aria-label="Main"
      >
        <a onClick={() => setOpen(false)} href="/#bikes">
          Bikes
        </a>
        <a onClick={() => setOpen(false)} href="/#coffee">
          Coffee
        </a>
        <a onClick={() => setOpen(false)} href="/#visit">
          Visit
        </a>
      </nav>
      <a href="/rent" className="button header-cta">
        Reserve a bike <ArrowUpRight size={18} />
      </a>
      <button
        className="menu-toggle"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}
export function QuickBook({
  source = 'Website',
  compact = false,
}: {
  source?: string;
  compact?: boolean;
}) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState('2');
  return (
    <form className={'quick-book ' + (compact ? 'compact' : '')} action="/rent">
      <Field
        label="Pickup date"
        type="date"
        name="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        min={new Intl.DateTimeFormat('en-CA', {
          timeZone: 'America/Detroit',
        }).format(new Date())}
      />
      <Field
        label="Pickup time"
        type="time"
        name="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        required
      />
      <Choice
        label="Time to explore"
        value={duration}
        onChange={setDuration}
        options={[
          ['2', '2 hours'],
          ['4', '4 hours'],
          ['day', 'Day rental'],
        ]}
      />
      <input type="hidden" name="duration" value={duration} />
      <input type="hidden" name="source" value={source} />
      <button className="button" type="submit">
        Find available bikes <ArrowRight size={19} />
      </button>
    </form>
  );
}
export function Home({
  content = DEFAULT_CONTENT,
  rates = [25, 45, 30],
}: {
  content?: typeof DEFAULT_CONTENT;
  rates?: number[];
}) {
  return (
    <>
      <Header />
      <main id="main">
        <section className="hero wrap">
          <div className="hero-copy">
            <p className="eyebrow">
              <span /> YOUR SAUGATUCK STARTING POINT
            </p>
            <h1>
              Good coffee.
              <br />
              <em>Great rides.</em>
            </h1>
            <p className="hero-description">
              Start your Saugatuck day at Blue Star Barns. Stop in for coffee,
              then explore on two wheels.
            </p>
            <div className="actions">
              <a className="button" href="/rent">
                Reserve a bike <ArrowUpRight size={20} />
              </a>
              <a className="text-link" href="#coffee">
                Explore the coffee menu <ArrowRight size={16} />
              </a>
            </div>
            <p className="hero-note">
              <Bike size={18} /> Reserve online. Pay when you arrive.
            </p>
            <div className="mobile-book">
              <QuickBook />
              <p className="micro">Sample rentals · Eastern time</p>
            </div>
          </div>
          <figure className="hero-image">
            <img
              className="hero-lifestyle"
              src="/lifestyle.png"
              alt="Illustrative blue bicycle and a cup of coffee beside a sunlit lake"
              fetchPriority="high"
              width="1536"
              height="1024"
            />
            <img
              className="hero-brand-badge"
              src="/blue-star-barns-chainring.jpg"
              alt="Blue Star Barns coffee and bikes chainring logo"
              width={1563}
              height={1563}
            />
            <figcaption>
              <span>TAKE THE SCENIC WAY</span>
              <span>
                COFFEE FIRST. THEN WE RIDE. <ArrowUpRight size={18} />
              </span>
            </figcaption>
          </figure>
        </section>
        <div className="booking-strip wrap">
          <QuickBook />
          <p className="micro">
            Sample rentals · All times Eastern · Sample prices exclude
            applicable taxes
          </p>
        </div>
        <section id="bikes" className="bikes-section wrap section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A LITTLE FRESH AIR</p>
              <h2>Find your kind of ride.</h2>
            </div>
            <p>
              A slow wander or a little farther afield.
              <br />
              Choose a bike, and make a day of it.
            </p>
          </div>
          <div className="bike-grid">
            {[
              {
                name: 'Comfort bike',
                description: 'An upright, easygoing ride for taking it all in.',
                cat: 'comfort',
                sizes: 'Medium / Large',
              },
              {
                name: 'Step through e-bike',
                description: 'A little extra help for a longer afternoon.',
                cat: 'ebike',
                sizes: 'Small–medium / Medium–large',
              },
              {
                name: 'Hybrid bike',
                description: 'A versatile choice for your next outing.',
                cat: 'hybrid',
                sizes: 'Medium / Large',
              },
            ].map((b, i) => (
              <a
                href={'/rent?category=' + b.cat}
                key={b.cat}
                className="bike-card"
              >
                <div className={'bike-card-top bike-tone-' + i}>
                  <Bike strokeWidth={1.2} size={76} />
                  <span>SAMPLE CATEGORY 0{i + 1}</span>
                  <ArrowUpRight className="card-arrow" size={26} />
                </div>
                <div className="bike-card-body">
                  <h3>{b.name}</h3>
                  <p>{b.description}</p>
                  <span className="micro">{b.sizes}</span>
                  <div className="rate">
                    <span>Sample 2-hour rate</span>
                    <strong>${rates[i]}</strong>
                  </div>
                </div>
              </a>
            ))}
          </div>
          <p className="micro">
            Illustrative categories, sizes and prices. Actual fleet and rental
            inclusions await owner confirmation.
          </p>
        </section>
        <section id="coffee" className="coffee-section">
          <div className="wrap coffee-grid">
            <div className="coffee-photo">
              <img
                src="/lifestyle.png"
                width="1536"
                height="1024"
                alt="Illustrative ceramic coffee cup on a sunny wooden patio table"
                loading="lazy"
              />
              <span>
                <Coffee size={21} /> A MOMENT TO SLOW DOWN
              </span>
            </div>
            <div className="coffee-copy">
              <p className="eyebrow">MEET YOU FOR A COFFEE</p>
              <h2>
                Stay for a cup.
                <br />
                <em>See where the day goes.</em>
              </h2>
              <p>{content.intro}</p>
              <div className="sample-menu">
                <p className="micro">SAMPLE MENU FOR LAYOUT</p>
                {content.menu
                  .split('\n')
                  .filter(Boolean)
                  .map((item, i) => (
                    <div key={i}>
                      {item}
                      <span>✦</span>
                    </div>
                  ))}
              </div>
              <a className="text-link" href="#visit">
                Plan your visit <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </section>
        <section id="visit" className="wrap section visit-grid">
          <div>
            <p className="eyebrow">JUST OFF BLUE STAR HIGHWAY</p>
            <h2>
              We’ll see you
              <br />
              <em>at the Barns.</em>
            </h2>
            <p className="address">
              <MapPin size={22} />
              3483 Blue Star Highway
              <br />
              Saugatuck, Michigan
            </p>
            <a
              className="button outline"
              href="https://www.google.com/maps/search/?api=1&query=3483+Blue+Star+Highway+Saugatuck+Michigan"
              target="_blank"
              rel="noreferrer"
            >
              Get directions <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="visit-info">
            <div>
              <Coffee />
              <h3>Coffee hours</h3>
              <p>{content.coffeeHours}</p>
            </div>
            <div>
              <Bike />
              <h3>Bike pickup & return hours</h3>
              <p>{content.bikeHours}</p>
            </div>
            <p className="micro">
              Local ride suggestions will be added after owner review.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <Brand variant="chainring" />
        <p>
          3483 Blue Star Highway
          <br />
          Saugatuck, Michigan
        </p>
        <a
          href="https://www.facebook.com/BlueStarBarns/"
          target="_blank"
          rel="noreferrer"
        >
          Find us on Facebook <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="wrap footer-bottom">
        <span>COFFEE. BIKES. A GOOD DAY OUT.</span>
        <a href="/rent">Bikes</a>
        <a href="/#coffee">Coffee</a>
        <a href="/#visit">Visit</a>
      </div>
    </footer>
  );
}
