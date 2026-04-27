import {
  ROUND_DURATION_MS,
  INITIAL_MULTIPLIER,
  MULTIPLIER_STEP,
  MAX_MULTIPLIER,
  URGENT_BONUS,
  PERK_POOL,
  DAILY_PERKS,
  CATEGORIES as DEFAULT_CATEGORIES,
  getRank,
} from '../data/constants';

export const STORAGE_KEY = 'productivity-hell:v1';

const todayStr = (now = new Date()) => {
  const d = now instanceof Date ? now : new Date(now);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};
const LEGACY_PERK_IDS = {
  1: 'deep-work-demon',
  2: 'patron-sigil',
  3: 'critical-combo',
  4: 'hell-multiplier',
  5: 'burnout-tax',
  6: 'last-minute-pact',
  7: 'category-streak',
  8: 'unfinished-altar',
};

export function getDailyPerk(now = Date.now()) {
  const d = now instanceof Date ? now : new Date(now);
  return DAILY_PERKS.find(perk => perk.weekday === d.getDay()) || DAILY_PERKS[0];
}

function getActivePerks(state, now = Date.now()) {
  const owned = (state.perks || []).filter(p => p.active && p.effect && typeof p.effect === 'object');
  const daily = getDailyPerk(now);
  return daily ? [...owned, { ...daily, active: true, daily: true }] : owned;
}

function completedHourStreak(rounds = []) {
  let streak = 0;
  for (let i = rounds.length - 1; i >= 0; i -= 1) {
    const round = rounds[i];
    if (round.missed || (round.completed?.length || round.tasks || 0) === 0) break;
    streak += 1;
  }
  return streak;
}

function applyCreationPerks(state, task) {
  const activePerks = getActivePerks(state).filter(p => p.effect?.kind === 'randomCategoryDouble');
  const matchingPerk = activePerks.find(perk => (
    perk.boundCategory
    && task.category === perk.boundCategory
    && Math.random() < (perk.effect.chance ?? 0)
  ));

  if (!matchingPerk) return task;

  const pointMultiplier = matchingPerk.effect.multiplier || 2;
  return {
    ...task,
    originalPoints: task.points,
    points: Math.round(task.points * pointMultiplier),
    creationPerk: {
      id: matchingPerk.id,
      name: matchingPerk.name,
      label: matchingPerk.effect.label,
      multiplier: pointMultiplier,
    },
  };
}

export function currentHourStart(now = Date.now()) {
  const d = new Date(now);
  d.setMinutes(0, 0, 0);
  return d.getTime();
}

export function hourKeyFor(ts) {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}`;
}

const hourLabelFromTs = (ts) => {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:00`;
};

function emptyRound(number, hourStart = currentHourStart()) {
  return {
    number,
    startedAt: hourStart,
    hourKey: hourKeyFor(hourStart),
    durationMs: ROUND_DURATION_MS,
    tasks: [],
    score: 0,
    multiplier: INITIAL_MULTIPLIER,
    streak: 0,
    peakMultiplier: INITIAL_MULTIPLIER,
    perkBonus: 0,
    comboBonus: 0,
    urgentBonus: 0,
    lastCompletedCategory: null,
    categoryStreak: 0,
    shortTaskChain: 0,
  };
}

export function createInitialState() {
  return {
    round: emptyRound(1),
    day: { date: todayStr(), dayNumber: 1, rounds: [] },
    perks: [],
    categories: DEFAULT_CATEGORIES.map(c => ({ ...c })),
    meta: { totalDays: 1, lifetimeScore: 0 },
    pendingSummary: null,
  };
}

export function ensureCategories(state) {
  const categories = state.categories && state.categories.length
    ? state.categories
    : DEFAULT_CATEGORIES.map(c => ({ ...c }));
  const perks = (state.perks || []).map(perk => {
    const migratedId = LEGACY_PERK_IDS[perk.id] || perk.id;
    const canonical = PERK_POOL.find(p => p.id === migratedId);
    return canonical ? { ...canonical, ...perk, id: migratedId } : perk;
  });
  return { ...state, categories, perks };
}

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `cat-${Date.now()}`;

export function addCategory(state, { label, color }) {
  const trimmed = (label || '').trim();
  if (!trimmed) return state;
  const existingIds = new Set(state.categories.map(c => c.id));
  let id = slugify(trimmed);
  let n = 2;
  while (existingIds.has(id)) id = `${slugify(trimmed)}-${n++}`;
  return { ...state, categories: [...state.categories, { id, label: trimmed, color: color || '#8A8A9A' }] };
}

export function updateCategory(state, id, patch) {
  const trimmedLabel = patch.label !== undefined ? patch.label.trim() : undefined;
  const nextLabel = trimmedLabel === '' ? undefined : trimmedLabel;
  return {
    ...state,
    categories: state.categories.map(c =>
      c.id === id
        ? { ...c, ...(nextLabel !== undefined ? { label: nextLabel } : {}), ...(patch.color ? { color: patch.color } : {}) }
        : c
    ),
  };
}

export function deleteCategory(state, id) {
  if (state.categories.length <= 1) return state;
  return { ...state, categories: state.categories.filter(c => c.id !== id) };
}

export function rolloverDayIfNeeded(state) {
  state = ensureCategories(state);
  const today = todayStr();
  if (state.day.date === today) return state;
  return {
    ...state,
    round: emptyRound(1),
    day: { date: today, dayNumber: state.day.dayNumber + 1, rounds: [] },
    meta: { ...state.meta, totalDays: state.meta.totalDays + 1 },
    pendingSummary: null,
  };
}

export function addTask(state, task) {
  const taskWithPerks = applyCreationPerks(state, task);
  return { ...state, round: { ...state.round, tasks: [...state.round.tasks, taskWithPerks] } };
}

export function completeTask(state, taskId) {
  const task = state.round.tasks.find(t => t.id === taskId);
  if (!task || task.done) return { state, earned: 0 };

  const now = Date.now();
  const completedBefore = state.round.tasks.filter(t => t.done).length;
  const sameCategoryStreak = state.round.lastCompletedCategory === task.category
    ? (state.round.categoryStreak || 1) + 1
    : 1;
  const timeLeftMs = Math.max(0, state.round.startedAt + state.round.durationMs - now);
  const elapsedMs = Math.max(0, now - state.round.startedAt);
  const activePerks = getActivePerks(state, now);
  const baseEarned = task.originalPoints || task.points;
  const creationBonus = task.originalPoints ? task.points - task.originalPoints : 0;
  const urgentBonus = task.urgent ? Math.round(task.points * (URGENT_BONUS - 1)) : 0;
  const triggeredPerks = task.creationPerk
    ? [{ ...task.creationPerk, bonus: creationBonus }]
    : [];
  let perkBonus = creationBonus;
  let multiplierStep = MULTIPLIER_STEP;
  let shortTaskChain = state.round.shortTaskChain || 0;

  for (const perk of activePerks) {
    const effect = perk.effect;
    let bonus = 0;
    let triggered = false;

    if (effect.kind === 'categoryPercent' && perk.boundCategory && task.category === perk.boundCategory) {
      bonus = Math.round(task.points * effect.percent);
      triggered = true;
    }

    if (effect.kind === 'categoryFlat' && perk.boundCategory && task.category === perk.boundCategory) {
      bonus = effect.amount;
      triggered = true;
    }

    if (effect.kind === 'durationPercent' && task.duration >= effect.minDuration) {
      bonus = Math.round(task.points * effect.percent);
      triggered = true;
    }

    if (effect.kind === 'priorityFlat' && effect.priorities.includes(task.priority)) {
      bonus = effect.amount;
      triggered = true;
    }

    if (effect.kind === 'sameCategoryStreak' && sameCategoryStreak > 1) {
      const pct = Math.min((sameCategoryStreak - 1) * effect.stepPercent, effect.maxPercent);
      bonus = Math.round(task.points * pct);
      triggered = bonus > 0;
    }

    if (effect.kind === 'lastMinutePercent' && timeLeftMs <= effect.lastMinutes * 60000) {
      bonus = Math.round(task.points * effect.percent);
      triggered = true;
    }

    if (effect.kind === 'urgentRisk' && task.urgent) {
      bonus = Math.round(task.points * effect.percent);
      multiplierStep -= effect.multiplierStepPenalty;
      triggered = true;
    }

    if (effect.kind === 'multiplierStep') {
      multiplierStep += effect.step;
      triggered = true;
    }

    if (effect.kind === 'hourlyParticipation' && completedBefore === 0) {
      bonus = effect.amount + (completedHourStreak(state.day?.rounds) * (effect.step || 0));
      triggered = true;
    }

    if (effect.kind === 'earlyRoundCompletion' && completedBefore === 0 && elapsedMs <= effect.firstMinutes * 60000) {
      bonus = effect.amount;
      triggered = true;
    }

    if (effect.kind === 'sameRoundCombo' && completedBefore >= effect.minCompletedBefore) {
      bonus = effect.amount;
      triggered = true;
    }

    if (effect.kind === 'urgentBeforeLastMinute' && task.urgent && timeLeftMs > effect.lastMinutes * 60000) {
      bonus = Math.round(task.points * effect.percent);
      triggered = true;
    }

    if (effect.kind === 'shortTaskChain' && task.duration <= effect.maxDuration) {
      bonus = effect.amount + (shortTaskChain * (effect.step || 0));
      shortTaskChain += 1;
      triggered = true;
    }

    if (effect.kind === 'optionalTaskMultiplier' && !task.urgent) {
      multiplierStep += effect.step;
      triggered = true;
    }

    if (effect.kind === 'firstRoundSoftStart' && state.round.number === 1 && completedBefore === 0) {
      bonus = effect.amount;
      triggered = true;
    }

    if (triggered) {
      perkBonus += bonus;
      triggeredPerks.push({ id: perk.id, name: perk.name, bonus, label: effect.label, daily: !!perk.daily });
    }
  }

  const subtotal = baseEarned + urgentBonus + perkBonus;
  const earned = Math.round(subtotal * state.round.multiplier);
  const multiplierBonus = earned - subtotal;
  const newMult = Math.min(state.round.multiplier + Math.max(0, multiplierStep), MAX_MULTIPLIER);
  const breakdown = { baseEarned, originalPoints: task.originalPoints || task.points, creationBonus, urgentBonus, perkBonus, multiplierBonus, triggeredPerks };

  const round = {
    ...state.round,
    tasks: state.round.tasks.map(t => t.id === taskId ? { ...t, done: true, completedAt: Date.now(), earned, breakdown } : t),
    score: state.round.score + earned,
    streak: state.round.streak + 1,
    multiplier: newMult,
    peakMultiplier: Math.max(state.round.peakMultiplier, newMult),
    perkBonus: (state.round.perkBonus || 0) + perkBonus,
    comboBonus: (state.round.comboBonus || 0) + multiplierBonus,
    urgentBonus: (state.round.urgentBonus || 0) + urgentBonus,
    lastCompletedCategory: task.category,
    categoryStreak: sameCategoryStreak,
    shortTaskChain: task.duration <= 20 ? shortTaskChain : 0,
  };
  return { state: { ...state, round }, earned };
}

export function buildSummary(state) {
  const { round } = state;
  const completed = round.tasks.filter(t => t.done);
  const failed    = round.tasks.filter(t => !t.done);
  const baseScore = completed.reduce((s, t) => s + (t.originalPoints || t.points), 0);
  const score     = round.score;
  const urgentBonus = completed.reduce((s, t) => s + (t.breakdown?.urgentBonus || 0), 0);
  const perkBonus = completed.reduce((s, t) => s + (t.breakdown?.perkBonus || 0), 0);
  const comboBonus = completed.reduce((s, t) => s + (t.breakdown?.multiplierBonus || 0), 0);
  const rank = getRank(score);
  const status = failed.length === 0 && completed.length > 0
    ? 'cleared'
    : completed.length > 0 ? 'survived' : 'failed';
  const perkNames = new Set();
  for (const task of completed) {
    for (const perk of task.breakdown?.triggeredPerks || []) perkNames.add(perk.name);
  }

  return {
    roundNumber: round.number,
    nextRoundNumber: round.number + 1,
    hourKey: round.hourKey,
    hourLabel: hourLabelFromTs(round.startedAt),
    score,
    rank,
    baseScore,
    urgentBonus,
    perkBonus,
    comboBonus,
    penalty: 0,
    completed: completed.map(t => ({
      title: t.title,
      pts: t.earned ?? t.points,
      cat: t.category,
      priority: t.priority,
      duration: t.duration,
      urgent: t.urgent,
      breakdown: t.breakdown || null,
    })),
    failed: failed.map(t => ({ title: t.title, cat: t.category, priority: t.priority, duration: t.duration, urgent: t.urgent })),
    peakMultiplier: round.peakMultiplier,
    status,
    perksUsed: [...perkNames],
  };
}

function archivedFromSummary(summary, { missed = false } = {}) {
  return {
    ...summary,
    // legacy DayView fields kept for visual compatibility:
    number: summary.roundNumber,
    hour: summary.hourLabel,
    tasks: summary.completed.length,
    failedCount: summary.failed.length,
    perks: summary.perksUsed,
    mult: `×${summary.peakMultiplier.toFixed(2)}`,
    perkClaimed: false,
    missed,
  };
}

function missedRound(hourStart, number) {
  const rank = getRank(0);
  return {
    roundNumber: number,
    nextRoundNumber: number + 1,
    hourKey: hourKeyFor(hourStart),
    hourLabel: hourLabelFromTs(hourStart),
    score: 0,
    rank,
    baseScore: 0,
    perkBonus: 0,
    comboBonus: 0,
    penalty: 0,
    completed: [],
    failed: [],
    peakMultiplier: INITIAL_MULTIPLIER,
    status: 'failed',
    perksUsed: [],
    number,
    hour: hourLabelFromTs(hourStart),
    tasks: 0,
    failedCount: 0,
    perks: [],
    mult: '—',
    perkClaimed: true, // missed rounds can't claim perks
    missed: true,
  };
}

const HOUR_MS = 60 * 60 * 1000;

export function reconcileClock(state, now = Date.now()) {
  const nowHourStart = currentHourStart(now);
  const nowHourKey = hourKeyFor(nowHourStart);
  if (state.round.hourKey === nowHourKey) return state;

  const liveSummary = buildSummary(state);
  const liveArchived = archivedFromSummary(liveSummary, { missed: false });

  const missed = [];
  let cursor = state.round.startedAt + HOUR_MS;
  let nextNumber = state.round.number + 1;
  while (cursor < nowHourStart) {
    missed.push(missedRound(cursor, nextNumber));
    cursor += HOUR_MS;
    nextNumber += 1;
  }

  const newRound = emptyRound(nextNumber, nowHourStart);

  return {
    ...state,
    round: newRound,
    day: {
      ...state.day,
      rounds: [...state.day.rounds, liveArchived, ...missed],
    },
    meta: { ...state.meta, lifetimeScore: state.meta.lifetimeScore + liveSummary.score },
    pendingSummary: { hourKey: liveArchived.hourKey, score: liveArchived.score, rank: liveArchived.rank },
  };
}

export function dismissPendingSummary(state) {
  if (!state.pendingSummary) return state;
  return { ...state, pendingSummary: null };
}

export function applyPerk(state, perk) {
  if (!perk) return state;
  if (state.perks.some(p => p.id === perk.id)) return state;
  const canonical = PERK_POOL.find(p => p.id === perk.id) || perk;
  return { ...state, perks: [...state.perks, { ...canonical, ...perk, active: true, ownedAt: Date.now() }] };
}

export function claimPerkForRound(state, hourKey, perk) {
  const next = applyPerk(state, perk);
  return {
    ...next,
    day: {
      ...next.day,
      rounds: next.day.rounds.map(r => r.hourKey === hourKey ? { ...r, perkClaimed: true } : r),
    },
  };
}

export function togglePerk(state, perkId) {
  return { ...state, perks: state.perks.map(p => p.id === perkId ? { ...p, active: !p.active } : p) };
}
