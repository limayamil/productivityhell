export const SAMPLE_TASKS = [
  { id: 1, title: 'Fix auth bug in staging env',       category: 'Dev',       priority: 'high',     duration: 45, points: 280, done: false },
  { id: 2, title: 'Write Q3 campaign brief',           category: 'Marketing', priority: 'medium',   duration: 30, points: 150, done: true  },
  { id: 3, title: 'Client presentation deck · FINAL',  category: 'Creative',  priority: 'critical', duration: 60, points: 500, done: false },
  { id: 4, title: 'Reply to team Slack threads',       category: 'Admin',     priority: 'low',      duration: 10, points: 60,  done: true  },
  { id: 5, title: 'Review pull requests',              category: 'Dev',       priority: 'medium',   duration: 20, points: 120, done: false },
];

export const SAMPLE_PERKS = [
  { id: 1, name: 'Deep Work Demon', rarity: 'rare',   icon: '⏱', effect: '×1.5 on 30+ min', active: true  },
  { id: 2, name: 'Hell Multiplier', rarity: 'epic',   icon: '◆', effect: '+0.25× / streak',  active: true  },
  { id: 3, name: 'Inbox Exorcist',  rarity: 'common', icon: '⚙', effect: '+50 pts / Admin',  active: false },
];

export const PERK_POOL = [
  { id: 1, name: 'Deep Work Demon',  rarity: 'rare',      icon: '⏱', desc: 'Longer tasks yield greater rewards. The deep burns brighter.',           effect: '×1.5 pts on 30+ min tasks',       category: 'All',     type: 'Passive'   },
  { id: 2, name: 'Inbox Exorcist',   rarity: 'common',    icon: '⚙', desc: 'Complete admin tasks for bonus flat points per sacrifice.',               effect: '+50 pts / Admin task',            category: 'Admin',   type: 'Passive'   },
  { id: 3, name: 'Critical Combo',   rarity: 'epic',      icon: '◆', desc: '3 high-priority tasks in one hour. Then the score doubles.',              effect: '×2 final score on trigger',       category: 'High',    type: 'Trigger'   },
  { id: 4, name: 'Hell Multiplier',  rarity: 'legendary', icon: '★', desc: 'Every task completed without breaking your streak adds to the fire.',    effect: '+0.25× per streak task',          category: 'All',     type: 'Stack'     },
  { id: 5, name: 'Burnout Tax',      rarity: 'cursed',    icon: '✕', desc: 'Triple the points. Half the time. The deal is already made.',             effect: '×3 pts · −15 min round',          category: 'All',     type: 'Risk'      },
  { id: 6, name: 'Last Minute Pact', rarity: 'hellborn',  icon: '∞', desc: 'Final 10 min tasks are legendary. Fail, and the contract collects.',      effect: '×2 pts · lose 20% on fail',       category: 'All',     type: 'High Risk' },
  { id: 7, name: 'Category Streak',  rarity: 'uncommon',  icon: '▲', desc: 'Same category, consecutive tasks, stacking fire.',                        effect: '+0.15× per same-cat task',        category: 'Any',     type: 'Stack'     },
  { id: 8, name: 'Clean Slate',      rarity: 'rare',      icon: '◉', desc: 'Begin fresh. The penalty from last round dissolves.',                     effect: 'Remove 1 active penalty',         category: 'Utility', type: 'Instant'   },
];

export const DAY_ROUNDS = [
  { hour: '09:00', score: 2800, rank: 'C', tasks: 4, failed: 1, perks: ['Inbox Exorcist'],                    status: 'survived', mult: '×1.5'  },
  { hour: '10:00', score: 4820, rank: 'A', tasks: 5, failed: 0, perks: ['Deep Work Demon', 'Hell Multiplier'], status: 'cleared',  mult: '×2.75' },
  { hour: '11:00', score: 1100, rank: 'D', tasks: 2, failed: 3, perks: [],                                    status: 'failed',   mult: '×1.0'  },
  { hour: '12:00', score: 6200, rank: 'S', tasks: 6, failed: 0, perks: ['Critical Combo', 'Category Streak'], status: 'cleared',  mult: '×3.5'  },
  { hour: '13:00', score: 0,    rank: null, tasks: 0, failed: 0, perks: [],                                   status: 'active',   mult: '—'     },
  { hour: '14:00', score: 0,    rank: null, tasks: 0, failed: 0, perks: [],                                   status: 'upcoming', mult: '—'     },
  { hour: '15:00', score: 0,    rank: null, tasks: 0, failed: 0, perks: [],                                   status: 'upcoming', mult: '—'     },
  { hour: '16:00', score: 0,    rank: null, tasks: 0, failed: 0, perks: [],                                   status: 'upcoming', mult: '—'     },
  { hour: '17:00', score: 0,    rank: null, tasks: 0, failed: 0, perks: [],                                   status: 'upcoming', mult: '—'     },
];

export const ACTIVE_PERKS_LIBRARY = [
  { id: 1, name: 'Deep Work Demon', rarity: 'rare',     icon: '⏱', desc: 'Longer tasks yield greater rewards.',              effect: '×1.5 pts on 30+ min tasks', category: 'All',  type: 'Passive', active: true  },
  { id: 2, name: 'Hell Multiplier', rarity: 'epic',     icon: '◆', desc: 'Every task without a broken streak adds to the fire.', effect: '+0.25× per streak task', category: 'All',  type: 'Stack',   active: true  },
  { id: 3, name: 'Inbox Exorcist',  rarity: 'common',   icon: '⚙', desc: 'Complete admin tasks for flat bonus points.',       effect: '+50 pts / Admin task',      category: 'Admin', type: 'Passive', active: false },
  { id: 4, name: 'Category Streak', rarity: 'uncommon', icon: '▲', desc: 'Same category tasks stack a climbing multiplier.', effect: '+0.15× per same-cat task',   category: 'Any',  type: 'Stack',   active: true  },
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
  { rank: 'D',   label: 'Barely Alive',       color: '#8A8A9A', min: 500  },
  { rank: 'C',   label: 'Survived',           color: '#FFD166', min: 1000 },
  { rank: 'B',   label: 'Productive Sinner',  color: '#FF3B3B', min: 2000 },
  { rank: 'A',   label: 'Focus Fiend',        color: '#3DDCFF', min: 3000 },
  { rank: 'S',   label: 'Hellbreaker',        color: '#8F5CFF', min: 4500 },
  { rank: 'SS',  label: 'Productivity Demon', color: '#FFD166', min: 6000 },
  { rank: 'SSS', label: 'God Mode',           color: '#FF3B3B', min: 8000 },
];

export const RARITY_STYLES = {
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

export function getRank(score) {
  let r = RANKS[0];
  for (const rank of RANKS) {
    if (score >= rank.min) r = rank;
  }
  return r;
}
