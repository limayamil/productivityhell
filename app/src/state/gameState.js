import {
  ROUND_DURATION_MS,
  INITIAL_MULTIPLIER,
  MULTIPLIER_STEP,
  MAX_MULTIPLIER,
  URGENT_BONUS,
  PERK_POOL,
  DAILY_PERKS,
  RARITY_REWARD_BONUS,
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

function rarityRewardBonus(perk) {
  return RARITY_REWARD_BONUS[perk?.rarity] || 0;
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
      rarity: matchingPerk.rarity,
      label: matchingPerk.effect.label,
      multiplier: pointMultiplier,
      rewardBonus: rarityRewardBonus(matchingPerk),
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
    rest: false,
  };
}

export function createInitialState() {
  return {
    round: emptyRound(1),
    day: { date: todayStr(), dayNumber: 1, rounds: [], startedAt: null, endedAt: null },
    history: { days: [] },
    perks: [],
    categories: DEFAULT_CATEGORIES.map(c => ({ ...c })),
    meta: { totalDays: 1, lifetimeScore: 0 },
    pendingSummary: null,
  };
}

function normalizeHistory(history) {
  const days = Array.isArray(history?.days) ? history.days : [];
  return { days };
}

function upsertDayHistory(state, summary) {
  if (!summary?.date || !summary.startedAt) return state;
  const history = normalizeHistory(state.history);
  const nextDays = [
    ...history.days.filter(day => day.date !== summary.date),
    { ...summary, savedAt: Date.now() },
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14);
  return { ...state, history: { days: nextDays } };
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
  // Migrate legacy state without day lifecycle fields: assume in-progress day so
  // existing sessions don't get bumped back to a pre-Inicio state.
  const day = state.day || { date: todayStr(), dayNumber: 1, rounds: [] };
  const migratedDay = day.startedAt === undefined
    ? { ...day, startedAt: state.round?.startedAt || Date.now(), endedAt: null }
    : day;
  return { ...state, categories, perks, day: migratedDay, history: normalizeHistory(state.history) };
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
  const daySummary = state.day.startedAt
    ? { ...buildDaySummary(state), endedAt: state.day.endedAt || Date.now() }
    : null;
  const stateWithHistory = upsertDayHistory(state, daySummary);
  return {
    ...stateWithHistory,
    round: emptyRound(1),
    day: { date: today, dayNumber: stateWithHistory.day.dayNumber + 1, rounds: [], startedAt: null, endedAt: null },
    meta: { ...stateWithHistory.meta, totalDays: stateWithHistory.meta.totalDays + 1 },
    perks: [],
    pendingSummary: null,
  };
}

export function startDay(state, now = Date.now()) {
  if (state.day.startedAt) return state;
  return {
    ...state,
    round: emptyRound(1, currentHourStart(now)),
    day: { ...state.day, startedAt: now, endedAt: null },
  };
}

export function endDay(state, now = Date.now()) {
  if (!state.day.startedAt || state.day.endedAt) return state;
  // Archive the current round as the last counted round of the day.
  const liveSummary = buildSummary(state);
  const liveArchived = archivedFromSummary(liveSummary, { missed: false });
  // Start a fresh off-the-clock round so HUD keeps working without affecting Day.
  const nowHourStart = currentHourStart(now);
  const nextRound = { ...emptyRound(state.round.number + 1, nowHourStart), offTheClock: true };
  const closedState = {
    ...state,
    round: nextRound,
    day: {
      ...state.day,
      endedAt: now,
      rounds: [...state.day.rounds, liveArchived],
    },
    meta: { ...state.meta, lifetimeScore: state.meta.lifetimeScore + liveSummary.score },
    pendingSummary: null,
  };
  return upsertDayHistory(closedState, buildDaySummary(closedState));
}

export function buildDaySummary(state) {
  const archivedRounds = state.day.rounds || [];
  // Include current live round only if day is still active (not closed yet).
  const liveSummary = state.day.startedAt && !state.day.endedAt ? buildSummary(state) : null;

  const allHours = [
    ...archivedRounds.map(r => ({
      hour: r.hourLabel || r.hour,
      score: r.score || 0,
      rank: r.rank,
      status: r.status,
      rest: !!r.rest,
      missed: !!r.missed,
      baseScore: r.baseScore || 0,
      urgentBonus: r.urgentBonus || 0,
      perkBonus: r.perkBonus || 0,
      comboBonus: r.comboBonus || 0,
      completed: r.completed || [],
      failed: r.failed || [],
      peakMultiplier: r.peakMultiplier || INITIAL_MULTIPLIER,
    })),
    ...(liveSummary ? [{
      hour: liveSummary.hourLabel,
      score: liveSummary.score,
      rank: liveSummary.rank,
      status: liveSummary.status,
      rest: !!liveSummary.rest,
      missed: false,
      baseScore: liveSummary.baseScore,
      urgentBonus: liveSummary.urgentBonus,
      perkBonus: liveSummary.perkBonus,
      comboBonus: liveSummary.comboBonus,
      completed: liveSummary.completed,
      failed: liveSummary.failed,
      peakMultiplier: liveSummary.peakMultiplier,
      live: true,
    }] : []),
  ];

  const totalScore   = allHours.reduce((s, h) => s + (h.score || 0), 0);
  const baseScore    = allHours.reduce((s, h) => s + (h.baseScore || 0), 0);
  const urgentBonus  = allHours.reduce((s, h) => s + (h.urgentBonus || 0), 0);
  const perkBonus    = allHours.reduce((s, h) => s + (h.perkBonus || 0), 0);
  const comboBonus   = allHours.reduce((s, h) => s + (h.comboBonus || 0), 0);
  const peakMultiplier = allHours.reduce((m, h) => Math.max(m, h.peakMultiplier || 0), INITIAL_MULTIPLIER);
  const completedTasks = allHours.reduce((s, h) => s + (h.completed?.length || 0), 0);
  const failedTasks    = allHours.reduce((s, h) => s + (h.rest ? 0 : (h.failed?.length || 0)), 0);
  const cleared  = allHours.filter(h => h.status === 'cleared').length;
  const survived = allHours.filter(h => h.status === 'survived').length;
  const failed   = allHours.filter(h => h.status === 'failed' && !h.rest).length;
  const rest     = allHours.filter(h => h.rest).length;

  // Aggregate score by category from completed tasks.
  const byCategory = {};
  for (const h of allHours) {
    for (const t of h.completed || []) {
      const key = t.cat || 'uncategorized';
      byCategory[key] = (byCategory[key] || 0) + (t.pts || 0);
    }
  }

  return {
    date: state.day.date,
    dayNumber: state.day.dayNumber,
    startedAt: state.day.startedAt,
    endedAt: state.day.endedAt,
    totalScore,
    rank: getRank(totalScore),
    baseScore,
    urgentBonus,
    perkBonus,
    comboBonus,
    peakMultiplier,
    completedTasks,
    failedTasks,
    cleared,
    survived,
    failed,
    rest,
    hours: allHours,
    byCategory,
  };
}

export function addTask(state, task) {
  const taskWithPerks = applyCreationPerks(state, task);
  return { ...state, round: { ...state.round, rest: false, tasks: [...state.round.tasks, taskWithPerks] } };
}

export function toggleCurrentRoundRest(state) {
  return { ...state, round: { ...state.round, rest: !state.round.rest } };
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
  const creationRarityBonus = Math.round(creationBonus * rarityRewardBonus(task.creationPerk));
  const creationBonusTotal = creationBonus + creationRarityBonus;
  const urgentBonus = task.urgent ? Math.round(task.points * (URGENT_BONUS - 1)) : 0;
  const triggeredPerks = task.creationPerk
    ? [{ ...task.creationPerk, bonus: creationBonusTotal, baseBonus: creationBonus, rarityBonus: creationRarityBonus }]
    : [];
  let perkBonus = creationBonusTotal;
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
      const rarityExtra = Math.round(bonus * rarityRewardBonus(perk));
      const totalBonus = bonus + rarityExtra;
      perkBonus += totalBonus;
      triggeredPerks.push({
        id: perk.id,
        name: perk.name,
        rarity: perk.rarity,
        bonus: totalBonus,
        baseBonus: bonus,
        rarityBonus: rarityExtra,
        label: effect.label,
        daily: !!perk.daily,
      });
    }
  }

  const subtotal = baseEarned + urgentBonus + perkBonus;
  const earned = Math.round(subtotal * state.round.multiplier);
  const multiplierBonus = earned - subtotal;
  const newMult = Math.min(state.round.multiplier + Math.max(0, multiplierStep), MAX_MULTIPLIER);
  const breakdown = { baseEarned, originalPoints: task.originalPoints || task.points, creationBonus, creationRarityBonus, urgentBonus, perkBonus, multiplierBonus, triggeredPerks };

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
  const rest = !!round.rest;
  const completed = round.tasks.filter(t => t.done);
  const failed    = rest ? [] : round.tasks.filter(t => !t.done);
  const baseScore = completed.reduce((s, t) => s + (t.originalPoints || t.points), 0);
  const score     = round.score;
  const urgentBonus = completed.reduce((s, t) => s + (t.breakdown?.urgentBonus || 0), 0);
  const perkBonus = completed.reduce((s, t) => s + (t.breakdown?.perkBonus || 0), 0);
  const comboBonus = completed.reduce((s, t) => s + (t.breakdown?.multiplierBonus || 0), 0);
  const rank = getRank(score);
  const status = rest
    ? 'rest'
    : failed.length === 0 && completed.length > 0
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
    rest,
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
    perkClaimed: !!summary.rest || false,
    missed,
    rest: !!summary.rest,
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
  // Day not started yet: hold the clock — no rounds advance, no missed rounds.
  if (!state.day.startedAt) return state;

  const nowHourStart = currentHourStart(now);
  const nowHourKey = hourKeyFor(nowHourStart);
  if (state.round.hourKey === nowHourKey) return state;

  // Day already closed: rotate the round so the HUD timer keeps working, but
  // don't archive into Day, don't generate missed rounds, don't update meta.
  if (state.day.endedAt) {
    const newRound = { ...emptyRound(state.round.number + 1, nowHourStart), offTheClock: true };
    return { ...state, round: newRound };
  }

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

export function toggleArchivedRoundRest(state, hourKey) {
  return {
    ...state,
    day: {
      ...state.day,
      rounds: state.day.rounds.map(round => {
        if (round.hourKey !== hourKey) return round;
        if (round.rest && round.restBackup) {
          const { restBackup, ...restRound } = round;
          return { ...restRound, ...restBackup, rest: false };
        }

        return {
          ...round,
          restBackup: {
            status: round.status,
            missed: round.missed,
            failedCount: round.failedCount,
            perkClaimed: round.perkClaimed,
          },
          rest: true,
          status: 'rest',
          missed: false,
          failedCount: 0,
          perkClaimed: true,
        };
      }),
    },
  };
}

export function togglePerk(state, perkId) {
  return { ...state, perks: state.perks.map(p => p.id === perkId ? { ...p, active: !p.active } : p) };
}

export function deletePerk(state, perkId) {
  return { ...state, perks: state.perks.filter(p => p.id !== perkId) };
}
