import {
  ROUND_DURATION_MS,
  INITIAL_MULTIPLIER,
  MULTIPLIER_STEP,
  MAX_MULTIPLIER,
  URGENT_BONUS,
  PERK_POOL,
  CATEGORIES as DEFAULT_CATEGORIES,
  getRank,
} from '../data/constants';

export const STORAGE_KEY = 'productivity-hell:v1';

const todayStr = () => new Date().toISOString().slice(0, 10);

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
  if (state.categories && state.categories.length) return state;
  return { ...state, categories: DEFAULT_CATEGORIES.map(c => ({ ...c })) };
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
  return { ...state, round: { ...state.round, tasks: [...state.round.tasks, task] } };
}

export function completeTask(state, taskId) {
  const task = state.round.tasks.find(t => t.id === taskId);
  if (!task || task.done) return { state, earned: 0 };

  const sameCategoryStreak = state.round.lastCompletedCategory === task.category
    ? (state.round.categoryStreak || 1) + 1
    : 1;
  const timeLeftMs = Math.max(0, state.round.startedAt + state.round.durationMs - Date.now());
  const activePerks = state.perks.filter(p => p.active && p.effect && typeof p.effect === 'object');
  const baseEarned = task.points;
  const urgentBonus = task.urgent ? Math.round(task.points * (URGENT_BONUS - 1)) : 0;
  const triggeredPerks = [];
  let perkBonus = 0;
  let multiplierStep = MULTIPLIER_STEP;

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

    if (triggered) {
      perkBonus += bonus;
      triggeredPerks.push({ id: perk.id, name: perk.name, bonus, label: effect.label });
    }
  }

  const subtotal = baseEarned + urgentBonus + perkBonus;
  const earned = Math.round(subtotal * state.round.multiplier);
  const multiplierBonus = earned - subtotal;
  const newMult = Math.min(state.round.multiplier + Math.max(0, multiplierStep), MAX_MULTIPLIER);
  const breakdown = { baseEarned, urgentBonus, perkBonus, multiplierBonus, triggeredPerks };

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
  };
  return { state: { ...state, round }, earned };
}

export function buildSummary(state) {
  const { round } = state;
  const completed = round.tasks.filter(t => t.done);
  const failed    = round.tasks.filter(t => !t.done);
  const baseScore = completed.reduce((s, t) => s + t.points, 0);
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
