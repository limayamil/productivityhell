import { useState, useEffect, useRef } from 'react';
import TaskCard from '../components/TaskCard';
import { SAMPLE_TASKS, SAMPLE_PERKS } from '../data/constants';

const STATUS_MAP = {
  safe:  { label: 'Safe',         color: '#7CFF6B', bg: '#7CFF6B15', border: '#7CFF6B40' },
  risky: { label: 'Risky',        color: '#FFD166', bg: '#FFD16615', border: '#FFD16640' },
  hell:  { label: '⚡ Hell Mode', color: '#FF3B3B', bg: '#FF3B3B20', border: '#FF3B3B50' },
};

const RARITY_COLORS = {
  common: '#8A8A9A', uncommon: '#7CFF6B', rare: '#3DDCFF',
  epic: '#8F5CFF', legendary: '#FFD166', cursed: '#FF3B3B', hellborn: '#FFD166',
};

const TARGET = 3000;

export default function Dashboard({ onAddTask, onEndRound, tasks: propTasks }) {
  const [tasks, setTasks] = useState(propTasks || SAMPLE_TASKS);
  const [timeLeft, setTimeLeft] = useState(38 * 60 + 22);
  const [score, setScore] = useState(1240);
  const [multiplier, setMultiplier] = useState(1.5);
  const [streak, setStreak] = useState(3);
  const [floaters, setFloaters] = useState([]);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const progress = Math.min(score / TARGET, 1);

  const roundStatus = score >= TARGET ? 'safe' : timeLeft < 10 * 60 ? 'hell' : score / TARGET > 0.5 ? 'safe' : 'risky';
  const st = STATUS_MAP[roundStatus];

  const completeTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.done) return;
    const earned = Math.round(task.points * multiplier);
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: true } : t));
    setScore(s => s + earned);
    setStreak(s => s + 1);
    setMultiplier(m => Math.min(m + 0.25, 5));
    const fid = Date.now();
    setFloaters(f => [...f, { id: fid, text: `+${earned}`, x: Math.random() * 60 + 20 }]);
    setTimeout(() => setFloaters(f => f.filter(fl => fl.id !== fid)), 900);
  };

  return (
    <div style={{ background: '#0B0B10', minHeight: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes floatUp { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(-60px)} }
        @keyframes hellpulse { from{box-shadow:0 0 6px #FF3B3B30} to{box-shadow:0 0 14px #FF3B3B80} }
      `}</style>

      {/* CRT overlay */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />

      {/* Point floaters */}
      {floaters.map(fl => (
        <div key={fl.id} style={{
          position: 'fixed', top: '30%', left: `${fl.x}%`,
          fontFamily: "'Bebas Neue'", fontSize: 28, color: '#FFD166',
          textShadow: '0 0 12px #FFD16680', pointerEvents: 'none', zIndex: 200,
          animation: 'floatUp 0.9s cubic-bezier(0.22,1,0.36,1) forwards',
        }}>
          {fl.text}
        </div>
      ))}

      {/* Header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #2A2A35' }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 13, letterSpacing: '0.14em', color: '#4A4A5A', textTransform: 'uppercase' }}>
          Productivity Hell
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: '#F0EDE8', letterSpacing: '0.04em', lineHeight: 1 }}>
            Round 03 · 10:00
          </div>
          <div style={{
            fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '4px 10px', borderRadius: 100,
            background: st.bg, color: st.color, border: `1px solid ${st.border}`,
            animation: roundStatus === 'hell' ? 'hellpulse 1.2s ease-in-out infinite alternate' : 'none',
          }}>
            {st.label}
          </div>
        </div>
      </div>

      {/* Timer + Stats */}
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{
            fontFamily: "'Space Mono'", fontSize: 40, fontWeight: 700, color: st.color, lineHeight: 1,
            textShadow: roundStatus === 'hell' ? `0 0 16px ${st.color}80` : 'none',
            transition: 'color 0.5s, text-shadow 0.5s',
          }}>
            {mins}:{secs}
          </div>
          <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A5A', marginTop: 2 }}>
            remaining
          </div>
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 20, fontWeight: 700, color: '#FFD166', lineHeight: 1 }}>
              {score.toLocaleString()}
            </div>
            <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A5A', marginTop: 2 }}>
              Points
            </div>
          </div>
          <div style={{ width: 1, background: '#2A2A35', margin: '0 16px' }} />
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 20, fontWeight: 700, color: '#8F5CFF', lineHeight: 1 }}>
              ×{multiplier.toFixed(2)}
            </div>
            <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A5A', marginTop: 2 }}>
              Mult
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ height: 5, background: '#2A2A35', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 2, background: st.color,
            boxShadow: `0 0 6px ${st.color}80`,
            width: `${progress * 100}%`,
            transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontFamily: "'Space Mono'", fontSize: 9, color: '#4A4A5A' }}>{score.toLocaleString()} / {TARGET.toLocaleString()} pts</span>
          <span style={{ fontFamily: "'Space Mono'", fontSize: 9, color: '#4A4A5A' }}>{Math.round(progress * 100)}%</span>
        </div>
      </div>

      {/* Streak + Perks */}
      <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A5A' }}>Streak</span>
        <span style={{ fontFamily: "'Space Mono'", fontSize: 13, fontWeight: 700, color: '#3DDCFF' }}>◉ {streak}</span>
        <span style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A5A', marginLeft: 'auto' }}>Perks Active</span>
        {SAMPLE_PERKS.filter(p => p.active).map(p => {
          const c = RARITY_COLORS[p.rarity] || '#8A8A9A';
          return (
            <span key={p.id} style={{
              fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              padding: '3px 8px', borderRadius: 100, background: c + '15', color: c, border: `1px solid ${c}50`,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              {p.icon} {p.name.split(' ')[0]}
            </span>
          );
        })}
      </div>

      {/* Task list header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 8px' }}>
        <span style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A' }}>
          Active Tasks · {tasks.filter(t => !t.done).length} remaining
        </span>
        <span style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7CFF6B' }}>
          {tasks.filter(t => t.done).length} done
        </span>
      </div>

      {/* Tasks */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {tasks.map(t => <TaskCard key={t.id} task={t} onComplete={completeTask} />)}
      </div>

      <button
        style={{
          margin: '16px', padding: '12px', background: 'transparent',
          border: '1px solid #2A2A35', borderRadius: 6, color: '#4A4A5A',
          fontFamily: "'Space Grotesk'", fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer',
          boxShadow: '2px 2px 0px #000',
        }}
        onClick={onEndRound}
      >
        End Round Early →
      </button>

      {/* FAB */}
      <button
        style={{
          position: 'fixed', bottom: 80, right: 20,
          width: 52, height: 52, borderRadius: 100,
          background: '#FF3B3B', border: 'none', color: '#fff', fontSize: 24,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '3px 3px 0px #000, 0 0 16px #FF3B3B60', zIndex: 100,
        }}
        onClick={onAddTask}
      >
        +
      </button>
    </div>
  );
}
