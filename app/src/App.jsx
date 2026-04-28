import { useEffect, useState, useMemo } from 'react';
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

const NAV_ITEMS = [
  { id: 'dashboard', icon: '◉', label: 'Round' },
  { id: 'day',       icon: '▦', label: 'Day'   },
  { id: 'week',      icon: 'W', label: 'Week'  },
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
              style={{ fontSize: 16, color: active ? '#FF3B3B' : '#4A4A5A', lineHeight: 1, textShadow: active ? '0 0 10px #FF3B3B80' : 'none' }}
            >
              {item.icon}
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

function AnimatedGradientBackdrop({ phase }) {
  const colors = GRADIENT_PHASES[phase] || GRADIENT_PHASES.early;

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
        filter: 'blur(18px) saturate(1.25)',
        opacity: 0.86,
        transition: 'background 1800ms ease, opacity 1800ms ease',
        animation: 'gradientDrift 32s ease-in-out infinite alternate, gradientHue 58s linear infinite',
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

export default function App() {
  const [state, setState] = useLocalStorage(STORAGE_KEY, createInitialState);
  const [screen,  setScreen]  = useState('dashboard');
  const [overlay, setOverlay] = useState(null);
  const [selectedHourKey, setSelectedHourKey] = useState(null);
  const [, setBackdropTick] = useState(0);

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

  const selectedRound = useMemo(
    () => state.day.rounds.find(r => r.hourKey === selectedHourKey) || null,
    [state.day.rounds, selectedHourKey]
  );

  const handleAddTask = (task) => {
    if (task) setState(prev => addTaskAction(prev, task));
    setOverlay(null);
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

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return (
          <Dashboard
            round={state.round}
            perks={state.perks}
            dailyPerk={dailyPerk}
            categories={state.categories}
            onCompleteTask={handleCompleteTask}
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
          from { filter: blur(18px) saturate(1.2) hue-rotate(0deg); }
          to { filter: blur(18px) saturate(1.2) hue-rotate(24deg); }
        }
      `}</style>
      <AnimatedGradientBackdrop phase={backdropPhase} />
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
