import { getStats } from './statsService.js';

/** Badge definitions — each maps to a numeric stat metric + a target threshold. */
const BADGES = [
  {
    key: 'first_trip',
    name: 'First Steps',
    emoji: '🛫',
    desc: 'Plan your first trip',
    metric: 'trips',
    target: 1,
  },
  {
    key: 'planner',
    name: 'Master Planner',
    emoji: '🗂️',
    desc: 'Plan 5 trips',
    metric: 'trips',
    target: 5,
  },
  {
    key: 'explorer',
    name: 'Explorer',
    emoji: '🧭',
    desc: 'Visit 3 countries',
    metric: 'countries',
    target: 3,
  },
  {
    key: 'globetrotter',
    name: 'Globetrotter',
    emoji: '🌍',
    desc: 'Visit 10 countries',
    metric: 'countries',
    target: 10,
  },
  {
    key: 'city_hopper',
    name: 'City Hopper',
    emoji: '🏙️',
    desc: 'Visit 10 cities',
    metric: 'cities',
    target: 10,
  },
  {
    key: 'frequent_flyer',
    name: 'Frequent Flyer',
    emoji: '✈️',
    desc: 'Travel 10,000 km',
    metric: 'distanceKm',
    target: 10_000,
  },
  {
    key: 'long_hauler',
    name: 'Long Hauler',
    emoji: '📅',
    desc: 'Spend 30 days traveling',
    metric: 'totalDays',
    target: 30,
  },
];

/** Derive earned/locked badges (with progress) from a user's travel stats. */
export async function getAchievements(ownerId) {
  const stats = await getStats(ownerId);
  const badges = BADGES.map((b) => {
    const current = stats[b.metric] ?? 0;
    return {
      key: b.key,
      name: b.name,
      emoji: b.emoji,
      description: b.desc,
      earned: current >= b.target,
      progress: { current: Math.min(current, b.target), target: b.target },
    };
  });
  return { badges, earnedCount: badges.filter((b) => b.earned).length, total: badges.length };
}
