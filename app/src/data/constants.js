export const PERK_POOL = [
  {
    id: 'deep-work-demon',
    name: 'Deep Work Demon',
    rarity: 'rare',
    icon: 'T',
    trigger: '30+ min',
    tags: ['duration', 'focus'],
    categoryAffinity: 'any',
    desc: 'Longer sacrifices burn hotter.',
    description: 'Longer sacrifices burn hotter.',
    effect: { label: '+35% task base on 30+ min tasks', kind: 'durationPercent', minDuration: 30, percent: 0.35 },
  },
  {
    id: 'patron-sigil',
    name: 'Patron Sigil',
    rarity: 'common',
    icon: '#',
    trigger: 'category',
    tags: ['category', 'steady'],
    categoryAffinity: 'dominant',
    desc: 'The category you fed most starts feeding you back.',
    description: 'The category you fed most starts feeding you back.',
    effect: { label: '+25% task base on favored category', kind: 'categoryPercent', percent: 0.25 },
  },
  {
    id: 'unfinished-altar',
    name: 'Unfinished Altar',
    rarity: 'uncommon',
    icon: '!',
    trigger: 'failed category',
    tags: ['category', 'recovery'],
    categoryAffinity: 'struggling',
    desc: 'The work you dropped last round becomes easier to redeem.',
    description: 'The work you dropped last round becomes easier to redeem.',
    effect: { label: '+90 pts on favored category', kind: 'categoryFlat', amount: 90 },
  },
  {
    id: 'critical-combo',
    name: 'Critical Combo',
    rarity: 'epic',
    icon: '*',
    trigger: 'high priority',
    tags: ['priority', 'combo'],
    categoryAffinity: 'any',
    desc: 'High-stakes tasks throw sparks into the meter.',
    description: 'High-stakes tasks throw sparks into the meter.',
    effect: { label: '+120 pts on High/Critical tasks', kind: 'priorityFlat', priorities: ['high', 'critical'], amount: 120 },
  },
  {
    id: 'hell-multiplier',
    name: 'Hell Multiplier',
    rarity: 'legendary',
    icon: '^',
    trigger: 'completion',
    tags: ['multiplier', 'scaling'],
    categoryAffinity: 'any',
    desc: 'Every completed task pushes the multiplier a little harder.',
    description: 'Every completed task pushes the multiplier a little harder.',
    effect: { label: '+0.15x extra multiplier growth', kind: 'multiplierStep', step: 0.15 },
  },
  {
    id: 'burnout-tax',
    name: 'Burnout Tax',
    rarity: 'cursed',
    icon: 'X',
    trigger: 'urgent',
    tags: ['risk', 'urgent'],
    categoryAffinity: 'any',
    desc: 'Urgency pays violently, but the meter grows slower afterward.',
    description: 'Urgency pays violently, but the meter grows slower afterward.',
    effect: { label: '+60% urgent task base, -0.10x growth', kind: 'urgentRisk', percent: 0.6, multiplierStepPenalty: 0.1 },
  },
  {
    id: 'last-minute-pact',
    name: 'Last Minute Pact',
    rarity: 'hellborn',
    icon: '8',
    trigger: 'last 10 min',
    tags: ['risk', 'timer'],
    categoryAffinity: 'any',
    desc: 'The final ten minutes turn completed tasks into contracts.',
    description: 'The final ten minutes turn completed tasks into contracts.',
    effect: { label: '+75% task base in final 10 min', kind: 'lastMinutePercent', lastMinutes: 10, percent: 0.75 },
  },
  {
    id: 'category-streak',
    name: 'Category Streak',
    rarity: 'uncommon',
    icon: 'A',
    trigger: 'same category',
    tags: ['category', 'streak'],
    categoryAffinity: 'dominant',
    desc: 'Repeat the same kind of work and the fire stacks.',
    description: 'Repeat the same kind of work and the fire stacks.',
    effect: { label: '+10% per same-category streak, max +50%', kind: 'sameCategoryStreak', stepPercent: 0.1, maxPercent: 0.5 },
  },
  {
    id: 'volatile-bounty',
    name: 'Volatile Bounty',
    rarity: 'rare',
    icon: '2x',
    trigger: 'task creation',
    tags: ['category', 'chance'],
    categoryAffinity: 'suggested',
    desc: 'A marked category sometimes spawns tasks worth twice the trouble.',
    description: 'A marked category sometimes spawns tasks worth twice the trouble.',
    effect: { label: '50% chance created tasks in bound category are x2', kind: 'randomCategoryDouble', chance: 0.5, multiplier: 2 },
  },
];

export const DAILY_PERKS = [
  {
    id: 'daily-sunday-reset-ritual',
    weekday: 0,
    name: 'Reset Ritual',
    rarity: 'daily',
    icon: 'R',
    trigger: 'first round',
    tags: ['daily', 'reset', 'early'],
    desc: 'Start soft, then make the day answer to you.',
    description: 'Start soft, then make the day answer to you.',
    effect: { label: '+180 pts on the first task of round 1', kind: 'firstRoundSoftStart', amount: 180 },
  },
  {
    id: 'daily-monday-momentum',
    weekday: 1,
    name: 'Monday Momentum',
    rarity: 'daily',
    icon: 'M',
    trigger: 'first task/hour',
    tags: ['daily', 'rhythm', 'streak'],
    desc: 'Mondays move when every hour gets at least one small win.',
    description: 'Mondays move when every hour gets at least one small win.',
    effect: { label: '+80 pts on each first hourly task, +20 per filled hour', kind: 'hourlyParticipation', amount: 80, step: 20 },
  },
  {
    id: 'daily-tuesday-second-wind',
    weekday: 2,
    name: 'Second Wind',
    rarity: 'daily',
    icon: 'W',
    trigger: 'first 15 min',
    tags: ['daily', 'pace', 'opening'],
    desc: 'Beat the hour to the first punch.',
    description: 'Beat the hour to the first punch.',
    effect: { label: '+120 pts if the first task lands in 15 min', kind: 'earlyRoundCompletion', firstMinutes: 15, amount: 120 },
  },
  {
    id: 'daily-wednesday-midweek-combo',
    weekday: 3,
    name: 'Midweek Combo',
    rarity: 'daily',
    icon: 'C',
    trigger: '2+ tasks',
    tags: ['daily', 'combo', 'chain'],
    desc: 'The second win is where Wednesday starts paying attention.',
    description: 'The second win is where Wednesday starts paying attention.',
    effect: { label: '+90 pts on the 2nd+ task each round', kind: 'sameRoundCombo', minCompletedBefore: 1, amount: 90 },
  },
  {
    id: 'daily-thursday-deadline-gravity',
    weekday: 4,
    name: 'Deadline Gravity',
    rarity: 'daily',
    icon: 'G',
    trigger: 'urgent early',
    tags: ['daily', 'urgent', 'timing'],
    desc: 'Urgent work pays better before the final panic window.',
    description: 'Urgent work pays better before the final panic window.',
    effect: { label: '+45% urgent task base before last 10 min', kind: 'urgentBeforeLastMinute', lastMinutes: 10, percent: 0.45 },
  },
  {
    id: 'daily-friday-finish-line-fever',
    weekday: 5,
    name: 'Finish Line Fever',
    rarity: 'daily',
    icon: 'F',
    trigger: 'short tasks',
    tags: ['daily', 'quick', 'chain'],
    desc: 'Friday loves quick closes and little victory laps.',
    description: 'Friday loves quick closes and little victory laps.',
    effect: { label: '+60 pts on short tasks, +25 per short-task chain', kind: 'shortTaskChain', maxDuration: 20, amount: 60, step: 25 },
  },
  {
    id: 'daily-saturday-side-quest-mode',
    weekday: 6,
    name: 'Side Quest Mode',
    rarity: 'daily',
    icon: 'Q',
    trigger: 'not urgent',
    tags: ['daily', 'optional', 'multiplier'],
    desc: 'Unforced work quietly makes the build stronger.',
    description: 'Unforced work quietly makes the build stronger.',
    effect: { label: '+0.10x multiplier growth on non-urgent tasks', kind: 'optionalTaskMultiplier', step: 0.1 },
  },
];

export const CATEGORIES = [
  { id: 'marketing', label: 'Marketing', color: '#FF3B3B' },
  { id: 'dev',       label: 'Dev',       color: '#3DDCFF' },
  { id: 'meetings',  label: 'Meetings',  color: '#FFD166' },
  { id: 'admin',     label: 'Admin',     color: '#8A8A9A' },
  { id: 'creative',  label: 'Creative',  color: '#8F5CFF' },
  { id: 'personal',  label: 'Personal',  color: '#7CFF6B' },
];

export const PRIORITIES = [
  { id: 'low',      label: 'Low',      color: '#8A8A9A', pts: 60  },
  { id: 'medium',   label: 'Medium',   color: '#FFD166', pts: 130 },
  { id: 'high',     label: 'High',     color: '#FF3B3B', pts: 260 },
  { id: 'critical', label: 'Critical', color: '#8F5CFF', pts: 480 },
];

export const DURATIONS = [10, 20, 30, 45, 60];

export const RANKS = [
  { rank: 'F',   label: 'Doomed',            color: '#4A4A5A', min: 0    },
  { rank: 'D',   label: 'Barely Alive',      color: '#8A8A9A', min: 500  },
  { rank: 'C',   label: 'Survived',          color: '#FFD166', min: 1000 },
  { rank: 'B',   label: 'Productive Sinner', color: '#FF3B3B', min: 2000 },
  { rank: 'A',   label: 'Focus Fiend',       color: '#3DDCFF', min: 3000 },
  { rank: 'S',   label: 'Hellbreaker',       color: '#8F5CFF', min: 4500 },
  { rank: 'SS',  label: 'Productivity Demon', color: '#FFD166', min: 6000 },
  { rank: 'SSS', label: 'God Mode',          color: '#FF3B3B', min: 8000 },
];

export const RARITY_STYLES = {
  daily:     { color: '#3DDCFF', border: '#FFD166', glow: '0 0 18px #3DDCFF45', bg: '#3DDCFF10' },
  common:    { color: '#8A8A9A', border: '#8A8A9A', glow: 'none',                bg: '#8A8A9A10' },
  uncommon:  { color: '#7CFF6B', border: '#7CFF6B', glow: '0 0 10px #7CFF6B30', bg: '#7CFF6B10' },
  rare:      { color: '#3DDCFF', border: '#3DDCFF', glow: '0 0 14px #3DDCFF35', bg: '#3DDCFF10' },
  epic:      { color: '#8F5CFF', border: '#8F5CFF', glow: '0 0 16px #8F5CFF40', bg: '#8F5CFF10' },
  legendary: { color: '#FFD166', border: '#FFD166', glow: '0 0 20px #FFD16650', bg: '#FFD16610' },
  cursed:    { color: '#FF3B3B', border: '#FF3B3B', glow: '0 0 16px #FF3B3B50', bg: '#FF3B3B10' },
  hellborn:  { color: '#FFD166', border: '#FF3B3B', glow: '0 0 20px #8F5CFF50', bg: '#FF3B3B08', gradient: true },
};

export const PRIORITY_COLORS = {
  low:      { color: '#8A8A9A', bg: '#8A8A9A15', border: '#8A8A9A40' },
  medium:   { color: '#FFD166', bg: '#FFD16615', border: '#FFD16640' },
  high:     { color: '#FF3B3B', bg: '#FF3B3B15', border: '#FF3B3B40' },
  critical: { color: '#8F5CFF', bg: '#8F5CFF15', border: '#8F5CFF40', glow: '0 0 6px #8F5CFF60' },
};

export const CAT_COLORS = {
  marketing: '#FF3B3B',
  dev:       '#3DDCFF',
  meetings:  '#FFD166',
  admin:     '#8A8A9A',
  creative:  '#8F5CFF',
  personal:  '#7CFF6B',
};

export const ROUND_DURATION_MS = 60 * 60 * 1000;
export const TARGET_SCORE = 3000;
export const INITIAL_MULTIPLIER = 1.5;
export const MULTIPLIER_STEP = 0.25;
export const MAX_MULTIPLIER = 5;
export const URGENT_BONUS = 1.5;

export function getRank(score) {
  let r = RANKS[0];
  for (const rank of RANKS) {
    if (score >= rank.min) r = rank;
  }
  return r;
}
