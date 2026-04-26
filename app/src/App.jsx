import { useState } from 'react';
import Dashboard     from './screens/Dashboard';
import DayView       from './screens/DayView';
import PerksLibrary  from './screens/PerksLibrary';
import TaskModal     from './overlays/TaskModal';
import RoundSummary  from './overlays/RoundSummary';
import PerkSelection from './overlays/PerkSelection';

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

export default function App() {
  const [screen,  setScreen]  = useState('dashboard');
  const [overlay, setOverlay] = useState(null);
  const [tasks,   setTasks]   = useState(null);

  const handleAddTask = (task) => {
    if (task && tasks) setTasks(t => [...t, task]);
    setOverlay(null);
  };

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard': return <Dashboard onAddTask={() => setOverlay('taskModal')} onEndRound={() => setOverlay('roundSummary')} tasks={tasks} />;
      case 'day':       return <DayView onRoundSelect={() => setScreen('dashboard')} />;
      case 'perks':     return <PerksLibrary />;
      default:          return null;
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {renderScreen()}
      </div>
      <BottomNav screen={screen} onNav={setScreen} />

      {overlay === 'taskModal' && (
        <TaskModal onClose={() => setOverlay(null)} onAdd={handleAddTask} />
      )}

      {overlay === 'roundSummary' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, overflowY: 'auto', background: '#0B0B10' }}>
          <RoundSummary
            score={4820}
            onNext={() => { setOverlay(null); setScreen('dashboard'); }}
            onPerkSelect={() => setOverlay('perkSelection')}
          />
        </div>
      )}

      {overlay === 'perkSelection' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, overflowY: 'auto', background: '#0B0B10' }}>
          <PerkSelection
            onSelect={() => { setOverlay(null); setScreen('dashboard'); }}
            roundScore={4820}
            roundRank="A"
          />
        </div>
      )}
    </div>
  );
}
