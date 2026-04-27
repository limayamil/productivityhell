import { useEffect, useState, useMemo } from 'react';
import Dashboard     from './screens/Dashboard';
import DayView       from './screens/DayView';
import PerksLibrary  from './screens/PerksLibrary';
import TaskModal     from './overlays/TaskModal';
import RoundSummary  from './overlays/RoundSummary';
import PerkSelection from './overlays/PerkSelection';
import HourTransitionToast from './components/HourTransitionToast';
import useLocalStorage from './hooks/useLocalStorage';
import {
  STORAGE_KEY,
  createInitialState,
  rolloverDayIfNeeded,
  reconcileClock,
  dismissPendingSummary,
  addTask as addTaskAction,
  completeTask as completeTaskAction,
  claimPerkForRound,
  togglePerk,
  addCategory as addCategoryAction,
  updateCategory as updateCategoryAction,
  deleteCategory as deleteCategoryAction,
} from './state/gameState';

const NAV_ITEMS = [
  { id: 'dashboard', icon: '◉', label: 'Round' },
  { id: 'day',       icon: '▦', label: 'Day'   },
  { id: 'perks',     icon: '◆', label: 'Perks' },
];

function BottomNav({ screen, onNav }) {
  return (
    <div style={{ position: 'sticky', bottom: 0, background: '#0D0D14', borderTop: '1px solid #2A2A35', display: 'flex', zIndex: 50 }}>
      {NAV_ITEMS.map(item => {
        const active = screen === item.id;
        return (
          <div
            key={item.id}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '10px 0 12px', cursor: 'pointer', gap: 3,
              borderTop: active ? '2px solid #FF3B3B' : '2px solid transparent',
              transition: 'border-color 150ms',
            }}
            onClick={() => onNav(item.id)}
          >
            <span style={{ fontSize: 16, color: active ? '#FF3B3B' : '#4A4A5A', lineHeight: 1 }}>{item.icon}</span>
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

export default function App() {
  const [state, setState] = useLocalStorage(STORAGE_KEY, createInitialState);
  const [screen,  setScreen]  = useState('dashboard');
  const [overlay, setOverlay] = useState(null);
  const [selectedHourKey, setSelectedHourKey] = useState(null);

  useEffect(() => {
    setState(prev => reconcileClock(rolloverDayIfNeeded(prev)));
    const t = setInterval(() => {
      setState(prev => reconcileClock(rolloverDayIfNeeded(prev)));
    }, 1000);
    return () => clearInterval(t);
  }, [setState]);

  const selectedRound = useMemo(
    () => state.day.rounds.find(r => r.hourKey === selectedHourKey) || null,
    [state.day.rounds, selectedHourKey]
  );

  const handleAddTask = (task) => {
    if (task) setState(prev => addTaskAction(prev, task));
    setOverlay(null);
  };

  const handleCompleteTask = (taskId) => {
    let earnedOut = 0;
    setState(prev => {
      const { state: next, earned } = completeTaskAction(prev, taskId);
      earnedOut = earned;
      return next;
    });
    return earnedOut;
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

  const categoryHandlers = {
    onAddCategory:    (cat)        => setState(prev => addCategoryAction(prev, cat)),
    onUpdateCategory: (id, patch)  => setState(prev => updateCategoryAction(prev, id, patch)),
    onDeleteCategory: (id)         => setState(prev => deleteCategoryAction(prev, id)),
  };

  const ownedPerkIds = useMemo(() => new Set(state.perks.map(p => p.id)), [state.perks]);

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return (
          <Dashboard
            round={state.round}
            perks={state.perks}
            categories={state.categories}
            onAddTask={() => setOverlay('taskModal')}
            onCompleteTask={handleCompleteTask}
          />
        );
      case 'day':
        return (
          <DayView
            rounds={state.day.rounds}
            date={state.day.date}
            dayNumber={state.meta.totalDays}
            perksCount={state.perks.length}
            onRoundSelect={(r) => r && r.hourKey && handleOpenSummary(r.hourKey)}
          />
        );
      case 'perks':
        return (
          <PerksLibrary
            perks={state.perks}
            categories={state.categories}
            roundNumber={state.round.number}
            peakMultiplier={state.round.peakMultiplier}
            onTogglePerk={handleTogglePerk}
          />
        );
      default: return null;
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {renderScreen()}
      </div>
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, overflowY: 'auto', background: '#0B0B10' }}>
          <RoundSummary
            summary={selectedRound}
            mode="archived"
            onClose={handleCloseSummary}
            onPerkSelect={() => setOverlay('perkSelection')}
          />
        </div>
      )}

      {overlay === 'perkSelection' && selectedRound && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, overflowY: 'auto', background: '#0B0B10' }}>
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
