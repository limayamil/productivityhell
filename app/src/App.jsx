import { useEffect, useState, useMemo, useRef } from 'react';
import { flushSync } from 'react-dom';
import Dashboard     from './screens/Dashboard';
import DayView       from './screens/DayView';
import WeekView      from './screens/WeekView';
import PerksLibrary  from './screens/PerksLibrary';
import TaskModal     from './overlays/TaskModal';
import RoundSummary  from './overlays/RoundSummary';
import PerkSelection from './overlays/PerkSelection';
import HourTransitionToast from './components/HourTransitionToast';
import DaySummary from './overlays/DaySummary';
import useLocalStorage from './hooks/useLocalStorage';
import {
  STORAGE_KEY,
  createInitialState,
  rolloverDayIfNeeded,
  reconcileClock,
  dismissPendingSummary,
  addTask as addTaskAction,
  addInboxTask as addInboxTaskAction,
  takeInboxTask as takeInboxTaskAction,
  completeTask as completeTaskAction,
  toggleCurrentRoundRest,
  toggleArchivedRoundRest,
  claimPerkForRound,
  togglePerk,
  deletePerk,
  addCategory as addCategoryAction,
  updateCategory as updateCategoryAction,
  deleteCategory as deleteCategoryAction,
  getDailyPerk,
  startDay as startDayAction,
  endDay as endDayAction,
  buildDaySummary,
  applyPerk,
} from './state/gameState';
import { playCueSound } from './utils/scoreSound';

const NAV_ITEMS = [
  { id: 'dashboard', icon: '◉', label: 'Ronda' },
  { id: 'day',       icon: '▦', label: 'Dia'   },
  { id: 'week',      icon: 'week', label: 'Semana'  },
  { id: 'perks',     icon: '◆', label: 'Perks' },
];

const GRADIENT_PHASES = {
  early: {
    wash: 'rgba(61, 220, 255, 0.30)',
    accent: 'rgba(143, 92, 255, 0.24)',
    heat: 'rgba(124, 255, 107, 0.12)',
  },
  middle: {
    wash: 'rgba(255, 209, 102, 0.28)',
    accent: 'rgba(124, 255, 107, 0.20)',
    heat: 'rgba(61, 220, 255, 0.14)',
  },
  late: {
    wash: 'rgba(255, 59, 59, 0.34)',
    accent: 'rgba(255, 209, 102, 0.22)',
    heat: 'rgba(143, 92, 255, 0.24)',
  },
};

const BACKDROP_CHAOS = {
  calm: {
    opacity: 0.82,
    blur: 18,
    saturate: 1.18,
    drift: '32s',
    hue: '58s',
    scale: 1,
    emberOpacity: 0,
    streakOpacity: 0,
    shake: 'none',
  },
  ember: {
    opacity: 0.9,
    blur: 17,
    saturate: 1.34,
    drift: '24s',
    hue: '44s',
    scale: 1.03,
    emberOpacity: 0.26,
    streakOpacity: 0.14,
    shake: 'backgroundChaosPulse 7s ease-in-out infinite',
  },
  heat: {
    opacity: 0.96,
    blur: 15,
    saturate: 1.55,
    drift: '16s',
    hue: '32s',
    scale: 1.07,
    emberOpacity: 0.42,
    streakOpacity: 0.26,
    shake: 'backgroundChaosPulse 4.8s ease-in-out infinite',
  },
  inferno: {
    opacity: 1,
    blur: 13,
    saturate: 1.85,
    drift: '9s',
    hue: '22s',
    scale: 1.12,
    emberOpacity: 0.62,
    streakOpacity: 0.42,
    shake: 'backgroundChaosPulse 2.9s steps(2, end) infinite',
  },
};

const BUBBLE_COLORS = [
  'rgba(255, 59, 59, 0.56)',
  'rgba(255, 209, 102, 0.50)',
  'rgba(255, 122, 26, 0.44)',
  'rgba(143, 92, 255, 0.36)',
  'rgba(61, 220, 255, 0.28)',
];

function seededRandom(seed) {
  let h = 2166136261;
  const input = String(seed);
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  return () => {
    h += h << 13; h ^= h >>> 7;
    h += h << 3; h ^= h >>> 17;
    h += h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

function buildBackdropBubbles(seed, chaosLevel) {
  const rand = seededRandom(`${seed}-${chaosLevel}`);
  const countByLevel = { calm: 10, ember: 18, heat: 26, inferno: 34 };
  const driftByLevel = { calm: 14, ember: 24, heat: 36, inferno: 54 };
  const count = countByLevel[chaosLevel] || countByLevel.calm;
  const drift = driftByLevel[chaosLevel] || driftByLevel.calm;

  return Array.from({ length: count }, (_, index) => {
    const size = 2 + rand() * (chaosLevel === 'inferno' ? 8 : 6);
    const x1 = (rand() * 2 - 1) * drift;
    const y1 = (rand() * 2 - 1) * drift;
    const x2 = (rand() * 2 - 1) * drift;
    const y2 = (rand() * 2 - 1) * drift;
    const x3 = (rand() * 2 - 1) * drift;
    const y3 = (rand() * 2 - 1) * drift;

    return {
      id: `${seed}-${index}`,
      left: `${-6 + rand() * 112}%`,
      top: `${-6 + rand() * 112}%`,
      size,
      color: BUBBLE_COLORS[Math.floor(rand() * BUBBLE_COLORS.length)],
      blur: 0.2 + rand() * 1.8,
      duration: `${10 + rand() * 18}s`,
      delay: `${rand() * -18}s`,
      opacity: 0.42 + rand() * 0.58,
      x1: `${x1}px`,
      y1: `${y1}px`,
      x2: `${x2}px`,
      y2: `${y2}px`,
      x3: `${x3}px`,
      y3: `${y3}px`,
      pulseDuration: `${2.4 + rand() * 3.8}s`,
      pulseDelay: `${rand() * -4}s`,
    };
  });
}

function FabIcon({ type, active = false }) {
  const stroke = active ? '#0B0B10' : 'currentColor';

  if (type === 'power') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        style={{ width: 18, height: 18, display: 'block' }}
        fill="none"
      >
        <path
          d="M12 3v8"
          stroke={stroke}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.05 5.9a8 8 0 1 0 9.9 0"
          stroke={stroke}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === 'moon') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        style={{ width: 18, height: 18, display: 'block' }}
        fill="none"
      >
        <path
          d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z"
          stroke={stroke}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      style={{ width: 20, height: 20, display: 'block' }}
      fill="none"
    >
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function BottomNav({ screen, onNav }) {
  const renderIcon = item => {
    if (item.icon !== 'week') return item.icon;

    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        style={{ width: 17, height: 17, display: 'block' }}
        fill="none"
      >
        <rect x="4" y="5" width="16" height="15" rx="2.5" stroke="currentColor" strokeWidth="2" />
        <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
      </svg>
    );
  };

  return (
    <div style={{ position: 'sticky', bottom: 0, background: 'rgba(13,13,20,0.88)', backdropFilter: 'blur(10px)', borderTop: '1px solid #2A2A35', display: 'flex', zIndex: 50 }}>
      {NAV_ITEMS.map(item => {
        const active = screen === item.id;
        return (
          <div
            key={item.id}
            className="arcadePressable"
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '10px 0 12px', cursor: 'pointer', gap: 3,
              borderTop: active ? '2px solid #FF3B3B' : '2px solid transparent',
              transition: 'border-color 150ms, background 150ms, transform 150ms',
              background: active ? 'linear-gradient(to bottom, #FF3B3B16, transparent)' : 'transparent',
            }}
            onClick={() => onNav(item.id)}
          >
            <span
              className={active ? 'activeNavIcon' : undefined}
              style={{ fontSize: 16, color: active ? '#FF3B3B' : '#4A4A5A', lineHeight: 1, textShadow: active ? '0 0 10px #FF3B3B80' : 'none', height: 17, display: 'flex', alignItems: 'center' }}
            >
              {renderIcon(item)}
            </span>
            <span style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: active ? '#F0EDE8' : '#4A4A5A' }}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function remainingMinFor(round) {
  const ms = Math.max(0, round.startedAt + round.durationMs - Date.now());
  return Math.max(1, Math.floor(ms / 60000));
}

function getRoundPhase(round) {
  const remaining = Math.max(0, round.startedAt + round.durationMs - Date.now());
  const remainingRatio = round.durationMs > 0 ? remaining / round.durationMs : 0;
  if (remainingRatio > 0.55) return 'early';
  if (remainingRatio > 0.2) return 'middle';
  return 'late';
}

function getBackdropChaosLevel(round) {
  const capped = Math.min(Number(round?.number) || 1, 10);
  if (capped >= 8) return 'inferno';
  if (capped >= 6) return 'heat';
  if (capped >= 4) return 'ember';
  return 'calm';
}

function AnimatedGradientBackdrop({ phase, chaosLevel, seed }) {
  const colors = GRADIENT_PHASES[phase] || GRADIENT_PHASES.early;
  const chaos = BACKDROP_CHAOS[chaosLevel] || BACKDROP_CHAOS.calm;
  const bubbles = useMemo(() => buildBackdropBubbles(seed, chaosLevel), [seed, chaosLevel]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        background: '#0B0B10',
        pointerEvents: 'none',
      }}
    >
      <div style={{
        position: 'absolute',
        inset: '-24%',
        background: `
          linear-gradient(125deg, ${colors.wash}, transparent 34%, ${colors.accent} 62%, ${colors.heat}),
          conic-gradient(from 160deg at 50% 48%, ${colors.accent}, ${colors.wash}, ${colors.heat}, ${colors.accent})
        `,
        backgroundSize: '170% 170%, 150% 150%',
        backgroundPosition: '0% 50%, 70% 40%',
        '--backdrop-blur': `${chaos.blur}px`,
        '--backdrop-saturate': chaos.saturate,
        filter: `blur(${chaos.blur}px) saturate(${chaos.saturate})`,
        opacity: chaos.opacity,
        transform: `scale(${chaos.scale})`,
        transition: 'background 1800ms ease, opacity 1800ms ease, filter 1200ms ease',
        animation: `gradientDrift ${chaos.drift} ease-in-out infinite alternate, gradientHue ${chaos.hue} linear infinite`,
      }} />
      <div style={{
        position: 'absolute',
        inset: '-18%',
        opacity: chaos.emberOpacity,
        mixBlendMode: 'screen',
        transition: 'opacity 900ms ease',
      }}>
        {bubbles.map(bubble => (
          <span
            key={bubble.id}
            style={{
              position: 'absolute',
              left: bubble.left,
              top: bubble.top,
              width: bubble.size,
              height: bubble.size,
              borderRadius: '50%',
              '--bubble-x1': bubble.x1,
              '--bubble-y1': bubble.y1,
              '--bubble-x2': bubble.x2,
              '--bubble-y2': bubble.y2,
              '--bubble-x3': bubble.x3,
              '--bubble-y3': bubble.y3,
              animation: `backgroundBubbleDrift ${bubble.duration} cubic-bezier(0.45, 0.05, 0.2, 1) infinite`,
              animationDelay: bubble.delay,
              willChange: 'transform',
            }}
          >
            <span
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: bubble.color,
                opacity: bubble.opacity,
                filter: `blur(${bubble.blur}px)`,
                boxShadow: `0 0 ${Math.max(8, bubble.size * 2)}px ${bubble.color}`,
                animation: `backgroundBubblePulse ${bubble.pulseDuration} ease-in-out infinite`,
                animationDelay: bubble.pulseDelay,
              }}
            />
          </span>
        ))}
      </div>
      <div style={{
        position: 'absolute',
        inset: '-10%',
        opacity: chaos.streakOpacity,
        background: `
          repeating-linear-gradient(116deg, transparent 0 18px, rgba(255, 59, 59, 0.18) 19px 21px, transparent 22px 54px),
          radial-gradient(ellipse at 50% 110%, rgba(255, 59, 59, 0.35), transparent 58%)
        `,
        filter: 'blur(6px)',
        mixBlendMode: 'screen',
        animation: chaos.shake,
        transition: 'opacity 900ms ease',
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          linear-gradient(to bottom, rgba(11,11,16,0.58), rgba(11,11,16,0.28) 46%, rgba(11,11,16,0.76)),
          repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 72px)
        `,
      }} />
    </div>
  );
}

function StatusStamp({ lines, ariaLabel }) {
  return (
    <div
      aria-label={ariaLabel}
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 88,
        transform: 'translateX(-50%) rotate(-4deg)',
        zIndex: 55,
        pointerEvents: 'none',
        minWidth: 168,
        padding: '9px 16px 8px',
        border: '3px solid #3DDCFF',
        borderRadius: 4,
        background: `
          linear-gradient(135deg, #3DDCFF14, #0B0B1000 58%),
          repeating-linear-gradient(-18deg, #3DDCFF00 0 5px, #3DDCFF1E 6px 7px)
        `,
        boxShadow: '0 0 0 1px #0B0B10, 0 0 0 5px #3DDCFF2A, 3px 4px 0 #000',
        color: '#3DDCFF',
        fontFamily: "'Space Grotesk'",
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: '0.14em',
        lineHeight: 1.1,
        textAlign: 'center',
        textTransform: 'uppercase',
        textShadow: '0 0 9px #3DDCFF70',
        opacity: 0.92,
        mixBlendMode: 'screen',
      }}
    >
      {lines.map((line, index) => (
        <span key={line}>
          {index > 0 && <br />}
          {line}
        </span>
      ))}
    </div>
  );
}

export default function App() {
  const [state, setState] = useLocalStorage(STORAGE_KEY, createInitialState);
  const [screen,  setScreen]  = useState('dashboard');
  const [overlay, setOverlay] = useState(null);
  const [selectedHourKey, setSelectedHourKey] = useState(null);
  const [, setBackdropTick] = useState(0);
  const lastAnnouncedHourKeyRef = useRef(state.pendingSummary?.hourKey || null);

  useEffect(() => {
    setState(prev => reconcileClock(rolloverDayIfNeeded(prev)));
    const t = setInterval(() => {
      setState(prev => reconcileClock(rolloverDayIfNeeded(prev)));
    }, 1000);
    return () => clearInterval(t);
  }, [setState]);

  useEffect(() => {
    const t = setInterval(() => setBackdropTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const hourKey = state.pendingSummary?.hourKey;
    if (!hourKey || lastAnnouncedHourKeyRef.current === hourKey) return;
    lastAnnouncedHourKeyRef.current = hourKey;
    playCueSound('hourChange');
  }, [state.pendingSummary?.hourKey]);

  const selectedRound = useMemo(
    () => state.day.rounds.find(r => r.hourKey === selectedHourKey) || null,
    [state.day.rounds, selectedHourKey]
  );

  const handleAddTask = (task, destination = 'active') => {
    if (task) {
      setState(prev => destination === 'inbox'
        ? addInboxTaskAction(prev, task)
        : addTaskAction(prev, task)
      );
    }
    setOverlay(null);
  };

  const handleTakeInboxTask = (taskId) => {
    setState(prev => takeInboxTaskAction(prev, taskId));
  };

  const handleCompleteTask = (taskId) => {
    let result = { earned: 0, breakdown: null };
    flushSync(() => {
      setState(prev => {
        const { state: next, earned } = completeTaskAction(prev, taskId);
        const completed = next.round.tasks.find(t => t.id === taskId);
        result = { earned, breakdown: completed?.breakdown || null };
        return next;
      });
    });
    return result;
  };

  const handleToggleRest = () => {
    setState(prev => toggleCurrentRoundRest(prev));
  };

  const handleToggleArchivedRest = (hourKey) => {
    setState(prev => toggleArchivedRoundRest(prev, hourKey));
  };

  const handleOpenSummary = (hourKey) => {
    setSelectedHourKey(hourKey);
    setOverlay('roundSummary');
    setState(prev => dismissPendingSummary(prev));
  };

  const handleCloseSummary = () => {
    setOverlay(null);
    setSelectedHourKey(null);
  };

  const handlePerkSelected = (perk) => {
    if (selectedHourKey) {
      setState(prev => claimPerkForRound(prev, selectedHourKey, perk));
    }
    setOverlay(null);
    setSelectedHourKey(null);
  };

  const handleTogglePerk = (perkId) => {
    setState(prev => togglePerk(prev, perkId));
  };

  const handleDeletePerk = (perkId) => {
    setState(prev => deletePerk(prev, perkId));
  };

  const handleStartDay = () => {
    playCueSound('start');
    setOverlay('dayStartPerk');
  };

  const handleDayStartPerkSelected = (perk) => {
    setState(prev => {
      const withPerk = perk ? applyPerk(prev, perk) : prev;
      return startDayAction(withPerk);
    });
    setOverlay(null);
  };

  const handleEndDay = () => {
    setState(prev => endDayAction(prev));
    setOverlay('daySummary');
  };

  const dayPhase = !state.day.startedAt ? 'pending' : !state.day.endedAt ? 'active' : 'closed';
  const daySummary = useMemo(() => buildDaySummary(state), [state]);

  const categoryHandlers = {
    onAddCategory:    (cat)        => setState(prev => addCategoryAction(prev, cat)),
    onUpdateCategory: (id, patch)  => setState(prev => updateCategoryAction(prev, id, patch)),
    onDeleteCategory: (id)         => setState(prev => deleteCategoryAction(prev, id)),
  };

  const ownedPerkIds = useMemo(() => new Set(state.perks.map(p => p.id)), [state.perks]);
  const dailyPerk = getDailyPerk();
  const backdropPhase = getRoundPhase(state.round);
  const backdropChaosLevel = dayPhase === 'closed' ? 'calm' : getBackdropChaosLevel(state.round);
  const backdropSeed = `${state.round?.number || 1}-${state.round?.hourKey || state.round?.startedAt || 'idle'}`;

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return (
          <Dashboard
            round={state.round}
            perks={state.perks}
            dailyPerk={dailyPerk}
            categories={state.categories}
            inboxTasks={state.taskInbox || []}
            onCompleteTask={handleCompleteTask}
            onTakeInboxTask={handleTakeInboxTask}
            dayPhase={dayPhase}
            dayNumber={state.meta.totalDays}
            onStartDay={handleStartDay}
          />
        );
      case 'day':
        return (
          <DayView
            rounds={state.day.rounds}
            date={state.day.date}
            dayNumber={state.meta.totalDays}
            perksCount={state.perks.length}
            dayEndedAt={state.day.endedAt}
            onRoundSelect={(r) => r && r.hourKey && handleOpenSummary(r.hourKey)}
          />
        );
      case 'week':
        return (
          <WeekView
            historyDays={state.history?.days || []}
            currentDaySummary={daySummary}
            categories={state.categories}
          />
        );
      case 'perks':
        return (
          <PerksLibrary
            perks={state.perks}
            dailyPerk={dailyPerk}
            categories={state.categories}
            roundNumber={state.round.number}
            peakMultiplier={state.round.peakMultiplier}
            onTogglePerk={handleTogglePerk}
            onDeletePerk={handleDeletePerk}
          />
        );
      default: return null;
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', background: '#0B0B10' }}>
      <style>{`
        @keyframes gradientDrift {
          0% { transform: translate3d(-4%, -2%, 0) rotate(0deg) scale(1); background-position: 0% 50%, 70% 40%; }
          50% { transform: translate3d(3%, 2%, 0) rotate(4deg) scale(1.04); background-position: 78% 42%, 28% 62%; }
          100% { transform: translate3d(-2%, 4%, 0) rotate(-3deg) scale(1.02); background-position: 42% 84%, 84% 30%; }
        }

        @keyframes gradientHue {
          from { filter: blur(var(--backdrop-blur, 18px)) saturate(var(--backdrop-saturate, 1.2)) hue-rotate(0deg); }
          to { filter: blur(var(--backdrop-blur, 18px)) saturate(var(--backdrop-saturate, 1.2)) hue-rotate(24deg); }
        }

        @keyframes backgroundChaosPulse {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); opacity: 0.9; }
          18% { transform: translate3d(-1.5%, 0.5%, 0) rotate(-1deg) scale(1.03); opacity: 1; }
          39% { transform: translate3d(1%, -1%, 0) rotate(1.2deg) scale(1.05); opacity: 0.82; }
          64% { transform: translate3d(-0.5%, 1.2%, 0) rotate(-0.7deg) scale(1.02); opacity: 1; }
          81% { transform: translate3d(1.4%, 0, 0) rotate(0.5deg) scale(1.04); opacity: 0.88; }
        }

        @keyframes backgroundAsh {
          from { transform: translate3d(-2%, 8%, 0) rotate(0deg); background-position: 0 0, 30px 20px, 12px 44px; }
          to { transform: translate3d(3%, -8%, 0) rotate(5deg); background-position: 90px -160px, -80px -130px, 110px -190px; }
        }

        @keyframes backgroundBubbleDrift {
          0% { transform: translate3d(0, 0, 0) scale(0.82); }
          19% { transform: translate3d(var(--bubble-x1), var(--bubble-y1), 0) scale(1.08); }
          43% { transform: translate3d(var(--bubble-x2), var(--bubble-y2), 0) scale(0.94); }
          71% { transform: translate3d(var(--bubble-x3), var(--bubble-y3), 0) scale(1.18); }
          100% { transform: translate3d(0, 0, 0) scale(0.82); }
        }

        @keyframes backgroundBubblePulse {
          0%, 100% { opacity: 0.35; transform: scale(0.72); }
          27% { opacity: 0.9; transform: scale(1.22); }
          58% { opacity: 0.52; transform: scale(0.88); }
          81% { opacity: 1; transform: scale(1.04); }
        }
      `}</style>
      <AnimatedGradientBackdrop phase={backdropPhase} chaosLevel={backdropChaosLevel} seed={backdropSeed} />
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        {renderScreen()}
      </div>
      {screen === 'dashboard' && dayPhase !== 'pending' && (
        <>
          {dayPhase === 'active' && (
            <button
              className="arcadePressable"
              title="Finalizar día"
              aria-label="Finalizar día"
              style={{
                position: 'absolute',
                bottom: 77,
                right: 138,
                width: 42,
                height: 42,
                borderRadius: 100,
                background: '#13131C',
                border: '1px solid #FFD16670',
                color: '#FFD166',
                fontFamily: "'Bebas Neue'",
                fontSize: 14,
                letterSpacing: '0.06em',
                lineHeight: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '3px 3px 0px #000, 0 0 14px #FFD16630',
                zIndex: 60,
              }}
              onClick={handleEndDay}
            >
              <FabIcon type="power" />
            </button>
          )}
          {dayPhase === 'active' && (
            <button
              className="arcadePressable"
              title={state.round.rest ? 'Quitar descanso' : 'Marcar hora como descanso'}
              aria-label={state.round.rest ? 'Quitar descanso' : 'Marcar hora como descanso'}
              style={{
                position: 'absolute',
                bottom: 77,
                right: 84,
                width: 42,
                height: 42,
                borderRadius: 100,
                background: state.round.rest ? '#3DDCFF' : '#13131C',
                border: `1px solid ${state.round.rest ? '#3DDCFF' : '#3DDCFF70'}`,
                color: state.round.rest ? '#0B0B10' : '#3DDCFF',
                fontFamily: "'Bebas Neue'",
                fontSize: 20,
                lineHeight: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `3px 3px 0px #000, 0 0 14px ${state.round.rest ? '#3DDCFF70' : '#3DDCFF30'}`,
                zIndex: 60,
              }}
              onClick={handleToggleRest}
            >
              <FabIcon type="moon" active={state.round.rest} />
            </button>
          )}
          <button
            className="arcadePressable fabPulse"
            style={{
              position: 'absolute',
              bottom: 72,
              right: 20,
              width: 52,
              height: 52,
              borderRadius: 100,
              background: '#FF3B3B',
              border: 'none',
              color: '#fff',
              fontSize: 24,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '3px 3px 0px #000, 0 0 16px #FF3B3B60',
              zIndex: 60,
            }}
            onClick={() => setOverlay('taskModal')}
          >
            <FabIcon type="plus" />
          </button>
        </>
      )}
      {screen === 'dashboard' && dayPhase === 'active' && state.round.rest && (
        <StatusStamp
          ariaLabel="Hora de descanso"
          lines={['Hora de', 'Descanso']}
        />
      )}
      {screen === 'dashboard' && dayPhase === 'closed' && (
        <div
          aria-label="Dia finalizado, fuera de horario"
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 88,
            transform: 'translateX(-50%) rotate(-4deg)',
            zIndex: 55,
            pointerEvents: 'none',
            minWidth: 168,
            padding: '9px 16px 8px',
            border: '3px solid #3DDCFF',
            borderRadius: 4,
            background: `
              linear-gradient(135deg, #3DDCFF14, #0B0B1000 58%),
              repeating-linear-gradient(-18deg, #3DDCFF00 0 5px, #3DDCFF1E 6px 7px)
            `,
            boxShadow: '0 0 0 1px #0B0B10, 0 0 0 5px #3DDCFF2A, 3px 4px 0 #000',
            color: '#3DDCFF',
            fontFamily: "'Space Grotesk'",
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: '0.14em',
            lineHeight: 1.1,
            textAlign: 'center',
            textTransform: 'uppercase',
            textShadow: '0 0 9px #3DDCFF70',
            opacity: 0.92,
            mixBlendMode: 'screen',
          }}
        >
          Día finalizado
          <br />
          fuera de horario
        </div>
      )}
      <BottomNav screen={screen} onNav={setScreen} />

      <HourTransitionToast
        pending={state.pendingSummary}
        onOpen={() => state.pendingSummary && handleOpenSummary(state.pendingSummary.hourKey)}
        onDismiss={() => setState(prev => dismissPendingSummary(prev))}
      />

      {overlay === 'taskModal' && (
        <TaskModal
          onClose={() => setOverlay(null)}
          onAdd={handleAddTask}
          maxDurationMin={remainingMinFor(state.round)}
          categories={state.categories}
          {...categoryHandlers}
        />
      )}

      {overlay === 'roundSummary' && selectedRound && (
        <div className="overlayIn" style={{ position: 'fixed', inset: 0, zIndex: 200, overflowY: 'auto', background: 'rgba(11,11,16,0.94)' }}>
          <RoundSummary
            summary={selectedRound}
            mode="archived"
            canClaimPerk={!state.day.endedAt}
            onClose={handleCloseSummary}
            onPerkSelect={() => setOverlay('perkSelection')}
            onToggleRest={() => selectedRound?.hourKey && handleToggleArchivedRest(selectedRound.hourKey)}
          />
        </div>
      )}

      {overlay === 'daySummary' && (
        <div className="overlayIn" style={{ position: 'fixed', inset: 0, zIndex: 200, overflowY: 'auto', background: 'rgba(11,11,16,0.94)' }}>
          <DaySummary
            summary={daySummary}
            categories={state.categories}
            onClose={() => setOverlay(null)}
          />
        </div>
      )}

      {overlay === 'dayStartPerk' && (
        <div className="overlayIn" style={{ position: 'fixed', inset: 0, zIndex: 200, overflowY: 'auto', background: 'rgba(11,11,16,0.94)' }}>
          <PerkSelection
            mode="dayStart"
            ownedPerkIds={ownedPerkIds}
            summary={null}
            categories={state.categories}
            onSelect={handleDayStartPerkSelected}
          />
        </div>
      )}

      {overlay === 'perkSelection' && selectedRound && (
        <div className="overlayIn" style={{ position: 'fixed', inset: 0, zIndex: 200, overflowY: 'auto', background: 'rgba(11,11,16,0.94)' }}>
          <PerkSelection
            roundNumber={selectedRound.roundNumber}
            roundScore={selectedRound.score}
            roundRank={selectedRound.rank?.rank}
            peakMultiplier={selectedRound.peakMultiplier}
            ownedPerkIds={ownedPerkIds}
            summary={selectedRound}
            categories={state.categories}
            onSelect={handlePerkSelected}
          />
        </div>
      )}
    </div>
  );
}
