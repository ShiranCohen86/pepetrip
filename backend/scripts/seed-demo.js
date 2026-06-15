/* eslint-disable no-console -- this is a CLI seed script; console output is the UX. */
/**
 * Seed a rich demo dataset for a single user so every screen has something to show.
 *
 *   node backend/scripts/seed-demo.js [email]
 *
 * Default email: shiranc86@gmail.com. Uses backend/.env (same Atlas DB as prod).
 * Idempotent: re-running replaces only the demo trips (matched by title) and their
 * children — it never touches the user's other data.
 */
import { connectDb, disconnectDb } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Trip } from '../src/models/Trip.js';
import { Expense } from '../src/models/Expense.js';
import { PackingList } from '../src/models/PackingList.js';
import { Photo } from '../src/models/Photo.js';
import { Document } from '../src/models/Document.js';

const EMAIL = (process.argv[2] || 'shiranc86@gmail.com').toLowerCase();
const d = (s) => new Date(`${s}T09:00:00.000Z`);
const cost = (amount, currency = 'JPY') => ({ amount, currency });

// ── The five demo trips (titles double as the idempotency key) ──────────────
const TRIPS = [
  {
    title: '🇯🇵 Tokyo & Kyoto',
    destination: { label: 'Tokyo, Japan', country: 'Japan', city: 'Tokyo', coords: { lat: 35.6762, lng: 139.6503 } },
    startDate: d('2026-03-10'),
    endDate: d('2026-03-18'),
    travelers: 3,
    budget: cost(28000, 'ILS'),
    currency: 'ILS',
    travelStyle: 'adventure',
    status: 'completed',
    coverImage: 'https://picsum.photos/seed/pepe-tokyo-cover/1200/600',
    overview:
      'Eight days across Tokyo and Kyoto — neon nights in Shinjuku, temples at dawn, a Hakone hot-spring detour, and a bullet-train hop to the old capital. Cherry blossoms just starting.',
    lastGeneratedAt: new Date(),
    days: [
      {
        dayNumber: 1, date: d('2026-03-10'), summary: 'Arrival in Tokyo & first izakaya night',
        activities: [
          { type: 'transport', title: 'Flight TLV → Tokyo Narita (NRT)', startTime: '08:30', endTime: '17:45', source: 'user', order: 0 },
          { type: 'hotel', title: 'Check-in: Shinjuku Granbell Hotel', location: { name: 'Shinjuku', coords: { lat: 35.6938, lng: 139.7036 } }, source: 'ai', order: 1 },
          { type: 'restaurant', title: 'Dinner at Omoide Yokocho', description: 'Tiny smoky yakitori alley.', location: { name: 'Omoide Yokocho', coords: { lat: 35.694, lng: 139.6995 } }, estimatedCost: cost(4500), source: 'ai', order: 2 },
        ],
      },
      {
        dayNumber: 2, date: d('2026-03-11'), summary: 'Old Tokyo: Asakusa & Skytree',
        activities: [
          { type: 'attraction', title: 'Senso-ji Temple', description: "Tokyo's oldest temple + Nakamise shopping street.", location: { name: 'Senso-ji', coords: { lat: 35.7148, lng: 139.7967 } }, startTime: '09:00', durationMin: 120, source: 'ai', order: 0 },
          { type: 'attraction', title: 'Tokyo Skytree', location: { name: 'Tokyo Skytree', coords: { lat: 35.7101, lng: 139.8107 } }, estimatedCost: cost(2100), source: 'ai', order: 1 },
          { type: 'restaurant', title: 'Sushi at Tsukiji Outer Market', location: { name: 'Tsukiji', coords: { lat: 35.6655, lng: 139.7707 } }, estimatedCost: cost(6000), source: 'ai', order: 2 },
        ],
      },
      {
        dayNumber: 3, date: d('2026-03-12'), summary: 'Shibuya, Harajuku & Meiji',
        activities: [
          { type: 'attraction', title: 'Shibuya Crossing & Hachiko', location: { name: 'Shibuya', coords: { lat: 35.6595, lng: 139.7004 } }, source: 'ai', order: 0 },
          { type: 'activity', title: 'Meiji Shrine forest walk', location: { name: 'Meiji Jingu', coords: { lat: 35.6764, lng: 139.6993 } }, durationMin: 90, source: 'ai', order: 1 },
          { type: 'attraction', title: 'Takeshita Street, Harajuku', description: 'Crepes, vintage and street fashion.', location: { name: 'Harajuku', coords: { lat: 35.6716, lng: 139.7031 } }, estimatedCost: cost(3000), source: 'user', order: 2 },
        ],
      },
      {
        dayNumber: 4, date: d('2026-03-13'), summary: 'Day trip: Hakone & Mt. Fuji views',
        activities: [
          { type: 'transport', title: 'Odakyu Romancecar to Hakone', startTime: '08:00', source: 'ai', order: 0 },
          { type: 'attraction', title: 'Hakone Open-Air Museum', location: { name: 'Hakone', coords: { lat: 35.2447, lng: 139.0498 } }, estimatedCost: cost(1600), source: 'ai', order: 1 },
          { type: 'attraction', title: 'Lake Ashi cruise (Fuji views)', location: { name: 'Lake Ashi', coords: { lat: 35.2036, lng: 138.9826 } }, source: 'ai', order: 2 },
        ],
      },
      {
        dayNumber: 5, date: d('2026-03-14'), summary: 'Shinkansen to Kyoto',
        activities: [
          { type: 'transport', title: 'Shinkansen Tokyo → Kyoto', description: '320 km/h, ~2h15.', startTime: '10:00', endTime: '12:15', source: 'ai', order: 0 },
          { type: 'hotel', title: 'Check-in: Kyoto machiya townhouse', location: { name: 'Gion', coords: { lat: 35.0037, lng: 135.7757 } }, source: 'user', order: 1 },
          { type: 'restaurant', title: 'Dinner along Pontocho Alley', location: { name: 'Pontocho', coords: { lat: 35.0036, lng: 135.7708 } }, estimatedCost: cost(7000), source: 'ai', order: 2 },
        ],
      },
      {
        dayNumber: 6, date: d('2026-03-15'), summary: 'Kyoto temples',
        activities: [
          { type: 'attraction', title: 'Fushimi Inari Taisha (1000 torii)', location: { name: 'Fushimi Inari', coords: { lat: 34.9671, lng: 135.7727 } }, startTime: '07:30', durationMin: 150, source: 'ai', order: 0 },
          { type: 'attraction', title: 'Kinkaku-ji — the Golden Pavilion', location: { name: 'Kinkaku-ji', coords: { lat: 35.0394, lng: 135.7292 } }, estimatedCost: cost(500), source: 'ai', order: 1 },
          { type: 'free', title: 'Evening stroll in Gion', description: 'Maybe spot a geiko.', location: { name: 'Gion', coords: { lat: 35.0037, lng: 135.7757 } }, source: 'ai', order: 2 },
        ],
      },
      {
        dayNumber: 7, date: d('2026-03-16'), summary: 'Arashiyama',
        activities: [
          { type: 'attraction', title: 'Arashiyama Bamboo Grove', location: { name: 'Arashiyama', coords: { lat: 35.0094, lng: 135.6716 } }, startTime: '08:00', source: 'ai', order: 0 },
          { type: 'activity', title: 'Monkey Park Iwatayama', location: { name: 'Iwatayama', coords: { lat: 35.0156, lng: 135.6776 } }, estimatedCost: cost(600), source: 'ai', order: 1 },
        ],
      },
      {
        dayNumber: 8, date: d('2026-03-17'), summary: 'Back to Tokyo & flight home',
        activities: [
          { type: 'transport', title: 'Shinkansen Kyoto → Tokyo → flight TLV', source: 'user', order: 0 },
        ],
      },
    ],
    members: [
      { email: 'maya.cohen@example.com', name: 'Maya Cohen', role: 'editor' },
      { email: 'noa.levi@example.com', name: 'Noa Levi', role: 'viewer' },
      { email: 'daniel.bar@example.com', name: 'Daniel Bar', role: 'viewer' },
    ],
    expenses: [
      { category: 'flights', label: 'Flights TLV ↔ NRT (3 pax)', amount: 13200, currency: 'ILS', date: d('2026-01-20') },
      { category: 'accommodation', label: 'Shinjuku Granbell — 4 nights', amount: 68000, currency: 'JPY', date: d('2026-03-10') },
      { category: 'accommodation', label: 'Kyoto machiya — 3 nights', amount: 51000, currency: 'JPY', date: d('2026-03-14') },
      { category: 'transport', label: 'JR Pass + Shinkansen', amount: 60000, currency: 'JPY', date: d('2026-03-10') },
      { category: 'food', label: 'Sushi, ramen & izakaya', amount: 38000, currency: 'JPY', date: d('2026-03-13') },
      { category: 'activities', label: 'Temples, museums & Hakone', amount: 14200, currency: 'JPY', date: d('2026-03-15') },
      { category: 'shopping', label: 'Souvenirs in Harajuku', amount: 420, currency: 'USD', date: d('2026-03-12') },
      { category: 'transport', label: 'Suica top-ups & local trains', amount: 9000, currency: 'JPY', date: d('2026-03-16') },
    ],
    packing: [
      { label: 'Passport', category: 'documents', packed: true },
      { label: 'JR Pass voucher', category: 'documents', packed: true },
      { label: 'Travel insurance printout', category: 'documents' },
      { label: 'Light layers (March is chilly)', category: 'clothing', qty: 6, packed: true },
      { label: 'Comfortable walking shoes', category: 'clothing', packed: true },
      { label: 'Rain jacket', category: 'clothing' },
      { label: 'Type-A power adapter', category: 'electronics', packed: true },
      { label: 'Portable charger', category: 'electronics', packed: true },
      { label: 'Camera + spare SD', category: 'electronics' },
      { label: 'Pocket Wi-Fi (pickup at NRT)', category: 'electronics' },
      { label: 'Sunscreen', category: 'toiletries' },
      { label: 'Toothbrush kit', category: 'toiletries', packed: true },
      { label: 'Motion-sickness pills', category: 'health' },
      { label: 'Reusable water bottle', category: 'misc', packed: true },
    ],
    photos: [
      { url: 'https://picsum.photos/seed/pepe-sensoji/900/700', caption: 'Senso-ji at dusk 🏮', takenAt: d('2026-03-11'), coords: { lat: 35.7148, lng: 139.7967 } },
      { url: 'https://i.pravatar.cc/700?img=47', caption: 'Maya at the torii gates, Fushimi Inari', takenAt: d('2026-03-15'), coords: { lat: 34.9671, lng: 135.7727 } },
      { url: 'https://i.pravatar.cc/700?img=12', caption: 'Daniel hunting the best ramen 🍜', takenAt: d('2026-03-13') },
      { url: 'https://picsum.photos/seed/pepe-fuji/900/700', caption: 'Mt. Fuji from Lake Ashi', takenAt: d('2026-03-13'), coords: { lat: 35.2036, lng: 138.9826 } },
      { url: 'https://i.pravatar.cc/700?img=32', caption: 'The three of us in kimono, Gion', takenAt: d('2026-03-15'), coords: { lat: 35.0037, lng: 135.7757 } },
      { url: 'https://picsum.photos/seed/pepe-bamboo/900/700', caption: 'Arashiyama bamboo grove 🎋', takenAt: d('2026-03-16'), coords: { lat: 35.0094, lng: 135.6716 } },
      { url: 'https://i.pravatar.cc/700?img=5', caption: 'Noa + crepe, Takeshita St.', takenAt: d('2026-03-12') },
      { url: 'https://picsum.photos/seed/pepe-kinkakuji/900/700', caption: 'Kinkaku-ji reflections ✨', takenAt: d('2026-03-15'), coords: { lat: 35.0394, lng: 135.7292 } },
    ],
    documents: [
      { type: 'flight_ticket', title: 'Flight TLV → NRT (LY091)', url: 'https://picsum.photos/seed/pepe-doc-flight/900/1200', filename: 'ly091-outbound.pdf', mime: 'application/pdf', extracted: { flightNumber: 'LY091', confirmation: 'PNR7H2K', dates: ['2026-03-10'] } },
      { type: 'hotel_reservation', title: 'Shinjuku Granbell Hotel', url: 'https://picsum.photos/seed/pepe-doc-hotel/900/1200', filename: 'granbell-confirmation.pdf', mime: 'application/pdf', extracted: { confirmation: 'GBL-558210', dates: ['2026-03-10', '2026-03-14'] } },
      { type: 'boarding_pass', title: 'Boarding pass NRT → TLV', url: 'https://picsum.photos/seed/pepe-doc-bp/900/600', filename: 'boarding-return.png', mime: 'image/png', extracted: { flightNumber: 'LY092', confirmation: 'PNR7H2K', dates: ['2026-03-18'] } },
      { type: 'insurance', title: 'Travel insurance policy', url: 'https://picsum.photos/seed/pepe-doc-ins/900/1200', filename: 'insurance-policy.pdf', mime: 'application/pdf' },
    ],
  },

  // ── Four lighter trips: enough to fill the dashboard, globe and badges ──────
  {
    title: '🇮🇹 Rome Getaway',
    destination: { label: 'Rome, Italy', country: 'Italy', city: 'Rome', coords: { lat: 41.9028, lng: 12.4964 } },
    startDate: d('2025-09-05'), endDate: d('2025-09-10'), travelers: 2, budget: cost(2200, 'EUR'), currency: 'EUR',
    travelStyle: 'couples', status: 'completed', coverImage: 'https://picsum.photos/seed/pepe-rome-cover/1200/600',
    overview: 'A long weekend of ruins, pasta and gelato — Colosseum, Vatican, and golden-hour at the Trevi Fountain.',
    days: [
      { dayNumber: 1, date: d('2025-09-05'), summary: 'Ancient Rome', activities: [
        { type: 'attraction', title: 'Colosseum & Roman Forum', location: { name: 'Colosseum', coords: { lat: 41.8902, lng: 12.4922 } }, estimatedCost: cost(18, 'EUR'), source: 'ai', order: 0 },
        { type: 'restaurant', title: 'Cacio e pepe in Trastevere', location: { name: 'Trastevere', coords: { lat: 41.8896, lng: 12.4695 } }, estimatedCost: cost(45, 'EUR'), source: 'ai', order: 1 },
      ] },
      { dayNumber: 2, date: d('2025-09-06'), summary: 'Vatican', activities: [
        { type: 'attraction', title: 'Vatican Museums & Sistine Chapel', location: { name: 'Vatican', coords: { lat: 41.9065, lng: 12.4536 } }, estimatedCost: cost(20, 'EUR'), source: 'ai', order: 0 },
        { type: 'free', title: 'Trevi Fountain at golden hour', location: { name: 'Trevi', coords: { lat: 41.9009, lng: 12.4833 } }, source: 'ai', order: 1 },
      ] },
    ],
    expenses: [
      { category: 'flights', label: 'Flights TLV ↔ FCO', amount: 1100, currency: 'ILS', date: d('2025-07-10') },
      { category: 'accommodation', label: 'Hotel near Piazza Navona', amount: 720, currency: 'EUR', date: d('2025-09-05') },
      { category: 'food', label: 'Pasta, pizza & gelato', amount: 310, currency: 'EUR', date: d('2025-09-08') },
    ],
  },
  {
    title: '🇹🇭 Bangkok Adventure',
    destination: { label: 'Bangkok, Thailand', country: 'Thailand', city: 'Bangkok', coords: { lat: 13.7563, lng: 100.5018 } },
    startDate: d('2025-11-20'), endDate: d('2025-11-26'), travelers: 2, budget: cost(2600, 'USD'), currency: 'THB',
    travelStyle: 'backpacking', status: 'completed', coverImage: 'https://picsum.photos/seed/pepe-bkk-cover/1200/600',
    overview: 'Temples, tuk-tuks, floating markets and the best street food on the planet.',
    days: [
      { dayNumber: 1, date: d('2025-11-20'), summary: 'Grand Palace & temples', activities: [
        { type: 'attraction', title: 'Grand Palace & Wat Phra Kaew', location: { name: 'Grand Palace', coords: { lat: 13.75, lng: 100.4915 } }, estimatedCost: cost(500, 'THB'), source: 'ai', order: 0 },
        { type: 'attraction', title: 'Wat Arun at sunset', location: { name: 'Wat Arun', coords: { lat: 13.7437, lng: 100.4889 } }, source: 'ai', order: 1 },
      ] },
      { dayNumber: 2, date: d('2025-11-21'), summary: 'Markets & street food', activities: [
        { type: 'activity', title: 'Damnoen Saduak floating market', location: { name: 'Floating Market', coords: { lat: 13.521, lng: 99.959 } }, source: 'ai', order: 0 },
        { type: 'restaurant', title: 'Street food crawl, Chinatown', location: { name: 'Yaowarat', coords: { lat: 13.7401, lng: 100.5089 } }, estimatedCost: cost(800, 'THB'), source: 'ai', order: 1 },
      ] },
    ],
    expenses: [
      { category: 'flights', label: 'Flights TLV ↔ BKK', amount: 3200, currency: 'ILS', date: d('2025-09-15') },
      { category: 'accommodation', label: 'Riverside hotel — 6 nights', amount: 21000, currency: 'THB', date: d('2025-11-20') },
      { category: 'food', label: 'Street food & rooftop bars', amount: 9500, currency: 'THB', date: d('2025-11-24') },
    ],
  },
  {
    title: '🇫🇷 Paris in Summer',
    destination: { label: 'Paris, France', country: 'France', city: 'Paris', coords: { lat: 48.8566, lng: 2.3522 } },
    startDate: d('2026-08-12'), endDate: d('2026-08-17'), travelers: 2, budget: cost(3000, 'EUR'), currency: 'EUR',
    travelStyle: 'food', status: 'planned', coverImage: 'https://picsum.photos/seed/pepe-paris-cover/1200/600',
    overview: 'Upcoming: museums, pastries and a day trip to Versailles. Booked, packing soon.',
    days: [
      { dayNumber: 1, date: d('2026-08-12'), summary: 'Left Bank', activities: [
        { type: 'attraction', title: 'Eiffel Tower + Champ de Mars picnic', location: { name: 'Eiffel Tower', coords: { lat: 48.8584, lng: 2.2945 } }, estimatedCost: cost(30, 'EUR'), source: 'ai', order: 0 },
        { type: 'attraction', title: 'Louvre (timed entry)', location: { name: 'Louvre', coords: { lat: 48.8606, lng: 2.3376 } }, estimatedCost: cost(22, 'EUR'), source: 'ai', order: 1 },
      ] },
      { dayNumber: 2, date: d('2026-08-13'), summary: 'Versailles day trip', activities: [
        { type: 'transport', title: 'RER C to Versailles', source: 'ai', order: 0 },
        { type: 'attraction', title: 'Palace & Gardens of Versailles', location: { name: 'Versailles', coords: { lat: 48.8049, lng: 2.1204 } }, estimatedCost: cost(27, 'EUR'), source: 'ai', order: 1 },
      ] },
    ],
    expenses: [
      { category: 'flights', label: 'Flights TLV ↔ CDG', amount: 1450, currency: 'ILS', date: d('2026-05-30') },
      { category: 'accommodation', label: 'Le Marais apartment — 5 nights', amount: 1250, currency: 'EUR', date: d('2026-08-12') },
    ],
  },
  {
    title: '🇺🇸 New York City',
    destination: { label: 'New York, USA', country: 'USA', city: 'New York', coords: { lat: 40.7128, lng: -74.006 } },
    startDate: d('2025-06-02'), endDate: d('2025-06-07'), travelers: 2, budget: cost(3500, 'USD'), currency: 'USD',
    travelStyle: 'adventure', status: 'completed', coverImage: 'https://picsum.photos/seed/pepe-nyc-cover/1200/600',
    overview: 'The classics: skyline, Central Park, a Broadway show and a slice on every corner.',
    days: [
      { dayNumber: 1, date: d('2025-06-02'), summary: 'Midtown & the park', activities: [
        { type: 'attraction', title: 'Top of the Rock', location: { name: 'Rockefeller Center', coords: { lat: 40.7587, lng: -73.9787 } }, estimatedCost: cost(40, 'USD'), source: 'ai', order: 0 },
        { type: 'activity', title: 'Central Park walk', location: { name: 'Central Park', coords: { lat: 40.7829, lng: -73.9654 } }, source: 'ai', order: 1 },
      ] },
      { dayNumber: 2, date: d('2025-06-03'), summary: 'Downtown', activities: [
        { type: 'attraction', title: 'Statue of Liberty ferry', location: { name: 'Liberty Island', coords: { lat: 40.6892, lng: -74.0445 } }, estimatedCost: cost(25, 'USD'), source: 'ai', order: 0 },
        { type: 'free', title: 'Brooklyn Bridge walk at sunset', location: { name: 'Brooklyn Bridge', coords: { lat: 40.7061, lng: -73.9969 } }, source: 'ai', order: 1 },
      ] },
    ],
    expenses: [
      { category: 'flights', label: 'Flights TLV ↔ JFK', amount: 4200, currency: 'ILS', date: d('2025-04-01') },
      { category: 'accommodation', label: 'Midtown hotel — 5 nights', amount: 1900, currency: 'USD', date: d('2025-06-02') },
      { category: 'activities', label: 'Broadway show (2 tickets)', amount: 320, currency: 'USD', date: d('2025-06-04') },
    ],
  },
];

async function run() {
  await connectDb();

  // 1) User — find by email (Google login links by email), create if missing, ensure admin.
  let user = await User.findOne({ email: EMAIL });
  if (!user) {
    user = await User.create({ email: EMAIL, name: 'Shiran', roles: ['user', 'admin'] });
    console.log(`Created user ${EMAIL}`);
  } else if (!user.roles.includes('admin')) {
    user.roles = [...new Set([...user.roles, 'admin'])];
    await user.save();
    console.log(`Granted admin to existing user ${EMAIL}`);
  }
  const ownerId = user._id;

  // 2) Idempotency — wipe previous demo trips (by title) + their children.
  const titles = TRIPS.map((t) => t.title);
  const existing = await Trip.find({ ownerId, title: { $in: titles } }, '_id');
  const oldIds = existing.map((t) => t._id);
  if (oldIds.length) {
    await Promise.all([
      Expense.deleteMany({ tripId: { $in: oldIds } }),
      PackingList.deleteMany({ tripId: { $in: oldIds } }),
      Photo.deleteMany({ tripId: { $in: oldIds } }),
      Document.deleteMany({ tripId: { $in: oldIds } }),
      Trip.deleteMany({ _id: { $in: oldIds } }),
    ]);
    console.log(`Cleared ${oldIds.length} previous demo trip(s).`);
  }

  // 3) Create trips + children.
  let totals = { trips: 0, expenses: 0, photos: 0, docs: 0, packing: 0, members: 0 };
  for (const t of TRIPS) {
    const { expenses = [], packing = [], photos = [], documents = [], ...tripData } = t;
    const trip = await Trip.create({ ...tripData, ownerId });
    totals.trips += 1;
    totals.members += (tripData.members || []).length;

    if (expenses.length) {
      await Expense.insertMany(expenses.map((e) => ({ ...e, ownerId, tripId: trip._id })));
      totals.expenses += expenses.length;
    }
    if (photos.length) {
      await Photo.insertMany(photos.map((p) => ({ ...p, ownerId, tripId: trip._id })));
      totals.photos += photos.length;
    }
    if (documents.length) {
      await Document.insertMany(documents.map((doc) => ({ ...doc, ownerId, tripId: trip._id })));
      totals.docs += documents.length;
    }
    if (packing.length) {
      await PackingList.create({ ownerId, tripId: trip._id, items: packing, generatedAt: new Date() });
      totals.packing += packing.length;
    }
    console.log(`  ✓ ${t.title}`);
  }

  console.log('\nDone for', EMAIL);
  console.table(totals);
  await disconnectDb();
}

run().catch(async (err) => {
  console.error('Seed failed:', err);
  await disconnectDb().catch(() => {});
  process.exit(1);
});
