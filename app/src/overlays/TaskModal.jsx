import { useState } from 'react';
import { CATEGORIES, PRIORITIES, DURATIONS } from '../data/constants';

export default function TaskModal({ onClose, onAdd }) {
  const [title,    setTitle]    = useState('');
  const [cat,      setCat]      = useState('dev');
  const [priority, setPriority] = useState('medium');
  const [duration, setDuration] = useState(30);
  const [urgent,   setUrgent]   = useState(false);

  const selPriority = PRIORITIES.find(p => p.id === priority);
  const basePoints  = selPriority.pts + Math.floor(duration * 2.5);

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd && onAdd({ title: title.trim(), category: cat, priority, duration, points: basePoints, done: false, id: Date.now() });
    onClose();
  };

  const chip = (active, color) => ({
    fontFamily: "'Space Grotesk'", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
    padding: '6px 12px', borderRadius: 4, cursor: 'pointer',
    background: active ? color + '25' : '#1C1C2A',
    color: active ? color : '#4A4A5A',
    border: `1px solid ${active ? color + '60' : '#2A2A35'}`,
    boxShadow: active ? `0 0 8px ${color}30` : 'none',
    transition: 'all 120ms cubic-bezier(0.22,1,0.36,1)',
  });

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(11,11,16,0.85)', zIndex: 300, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#13131C', borderRadius: '8px 8px 0 0', border: '1px solid #2A2A35', borderBottom: 'none', width: '100%', padding: '0 0 32px', boxShadow: '0 -4px 40px rgba(0,0,0,0.6)' }}>
        <div style={{ width: 36, height: 4, background: '#2A2A35', borderRadius: 2, margin: '12px auto 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 0' }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: '#F0EDE8', letterSpacing: '0.04em' }}>Load Task</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 11, color: selPriority.color, background: selPriority.color + '15', border: `1px solid ${selPriority.color}40`, padding: '4px 10px', borderRadius: 4 }}>
              +{basePoints} pts base
            </div>
            <button
              style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid #2A2A35', background: 'transparent', color: '#8A8A9A', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ height: 14 }} />

          <label style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', marginBottom: 6, display: 'block' }}>
            Task name
          </label>
          <input
            style={{ width: '100%', background: '#1C1C2A', border: '1px solid #2A2A35', borderRadius: 6, padding: '12px 14px', fontFamily: "'Space Grotesk'", fontSize: 14, color: '#F0EDE8', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
            placeholder="What must be sacrificed?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />

          <label style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', marginBottom: 6, display: 'block' }}>
            Category
          </label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {CATEGORIES.map(c => (
              <div key={c.id} style={chip(cat === c.id, c.color)} onClick={() => setCat(c.id)}>{c.label}</div>
            ))}
          </div>

          <label style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', marginBottom: 6, display: 'block' }}>
            Priority
          </label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {PRIORITIES.map(p => (
              <div key={p.id} style={chip(priority === p.id, p.color)} onClick={() => setPriority(p.id)}>{p.label}</div>
            ))}
          </div>

          <label style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', marginBottom: 6, display: 'block' }}>
            Estimate
          </label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {DURATIONS.map(d => (
              <div key={d} style={chip(duration === d, '#3DDCFF')} onClick={() => setDuration(d)}>{d} min</div>
            ))}
          </div>

          <div style={{ height: 1, background: '#2A2A35', margin: '0 0 14px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 2px' }}>
            <div
              style={{ width: 36, height: 20, borderRadius: 10, background: urgent ? '#FF3B3B' : '#2A2A35', border: `1px solid ${urgent ? '#FF3B3B' : '#4A4A5A'}`, cursor: 'pointer', position: 'relative', transition: 'all 200ms', flexShrink: 0 }}
              onClick={() => setUrgent(u => !u)}
            >
              <div style={{ position: 'absolute', top: 2, left: urgent ? 18 : 2, width: 14, height: 14, borderRadius: 7, background: '#fff', transition: 'left 200ms cubic-bezier(0.22,1,0.36,1)' }} />
            </div>
            <span style={{ fontFamily: "'Space Grotesk'", fontSize: 11, color: urgent ? '#FF3B3B' : '#4A4A5A', fontWeight: 600 }}>Before this hour ends</span>
            <span style={{ fontFamily: "'Space Mono'", fontSize: 11, color: '#4A4A5A', marginLeft: 'auto' }}>×1.5 if urgent</span>
          </div>
        </div>

        <div style={{ padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            style={{
              width: '100%', padding: '14px', background: '#FF3B3B', border: 'none', borderRadius: 6,
              color: '#fff', fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: '0.06em', cursor: 'pointer',
              boxShadow: '3px 3px 0px #000, 0 0 16px #FF3B3B40', opacity: title.trim() ? 1 : 0.4,
            }}
            onClick={handleAdd}
          >
            Throw it in →
          </button>
        </div>
      </div>
    </div>
  );
}
