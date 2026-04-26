import { useState, useEffect } from 'react';
import { getRank } from '../data/constants';

const COMPLETED_TASKS = [
  { title: 'Fix auth bug in staging env',  pts: 700, cat: 'Dev',       priority: 'high'   },
  { title: 'Write Q3 campaign brief',      pts: 375, cat: 'Marketing', priority: 'medium' },
  { title: 'Reply to team Slack threads',  pts: 90,  cat: 'Admin',     priority: 'low'    },
  { title: 'Review pull requests',         pts: 300, cat: 'Dev',       priority: 'medium' },
];

const FAILED_TASKS = [
  { title: 'Client presentation deck · FINAL', pts: 0, cat: 'Creative', priority: 'critical' },
];

export default function RoundSummary({ score = 4820, onNext, onPerkSelect }) {
  const rank       = getRank(score);
  const baseScore  = 3200;
  const perkBonus  = 960;
  const comboBonus = 660;
  const penalty    = 0;
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ background: '#0B0B10', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />

      {/* Hero */}
      <div style={{ padding: '24px 16px 20px', textAlign: 'center', borderBottom: '1px solid #2A2A35', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 100%, ${rank.color}15 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4A4A5A' }}>
          Round 03 · 10:00 — Complete
        </div>
        <div style={{
          fontFamily: "'Bebas Neue'", fontSize: 96, letterSpacing: '0.04em', lineHeight: 1,
          color: rank.color, textShadow: `0 0 40px ${rank.color}60`,
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'scale(1)' : 'scale(0.6)',
          transition: 'all 500ms cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          {rank.rank}
        </div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: rank.color, letterSpacing: '0.06em', opacity: revealed ? 1 : 0, transition: 'opacity 400ms 200ms' }}>
          {rank.label}
        </div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 36, fontWeight: 700, color: '#FFD166', lineHeight: 1, marginTop: 8, opacity: revealed ? 1 : 0, transition: 'opacity 400ms 300ms' }}>
          {score.toLocaleString()}
        </div>
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 10, color: '#4A4A5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
          Final Score
        </div>
      </div>

      {/* Score breakdown */}
      <div style={{ padding: '16px' }}>
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', marginBottom: 10 }}>
          Score Breakdown
        </div>
        {[
          { label: 'Base score',       val: baseScore.toLocaleString(),  color: '#F0EDE8', prefix: '' },
          { label: 'Perk bonuses',     val: perkBonus,                  color: '#8F5CFF', prefix: '+' },
          { label: 'Combo multipliers',val: comboBonus,                  color: '#3DDCFF', prefix: '+' },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1E1E2A' }}>
            <span style={{ fontFamily: "'Space Grotesk'", fontSize: 12, color: '#8A8A9A' }}>{row.label}</span>
            <span style={{ fontFamily: "'Space Mono'", fontSize: 13, fontWeight: 700, color: row.color }}>{row.prefix}{row.val}</span>
          </div>
        ))}
        {penalty > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1E1E2A' }}>
            <span style={{ fontFamily: "'Space Grotesk'", fontSize: 12, color: '#8A8A9A' }}>Penalties</span>
            <span style={{ fontFamily: "'Space Mono'", fontSize: 13, fontWeight: 700, color: '#FF3B3B' }}>−{penalty}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 0', marginTop: 2 }}>
          <span style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: '#F0EDE8', letterSpacing: '0.04em' }}>Total</span>
          <span style={{ fontFamily: "'Space Mono'", fontSize: 22, fontWeight: 700, color: '#FFD166', textShadow: '0 0 12px #FFD16660' }}>{score.toLocaleString()}</span>
        </div>
      </div>

      {/* Task list */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', marginBottom: 8 }}>
          Completed · {COMPLETED_TASKS.length} tasks
        </div>
        {COMPLETED_TASKS.map((t, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: '#13131C', borderRadius: 4, border: '1px solid #1E1E2A', marginBottom: 5 }}>
            <span style={{ fontFamily: "'Space Grotesk'", fontSize: 11, color: '#8A8A9A', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
            <span style={{ fontFamily: "'Space Mono'", fontSize: 11, color: '#7CFF6B', fontWeight: 700, marginLeft: 8, flexShrink: 0 }}>+{t.pts}</span>
          </div>
        ))}

        {FAILED_TASKS.length > 0 && (
          <>
            <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FF3B3B80', marginTop: 12, marginBottom: 8 }}>
              Failed · {FAILED_TASKS.length} task
            </div>
            {FAILED_TASKS.map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: '#FF3B3B08', borderRadius: 4, border: '1px solid #FF3B3B20', marginBottom: 5 }}>
                <span style={{ fontFamily: "'Space Grotesk'", fontSize: 11, color: '#FF3B3B80', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'line-through' }}>{t.title}</span>
                <span style={{ fontFamily: "'Space Mono'", fontSize: 11, color: '#FF3B3B60', fontWeight: 700, marginLeft: 8, flexShrink: 0 }}>✕</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
        <button
          style={{ width: '100%', padding: '12px', background: '#13131C', border: '1px solid #8F5CFF60', borderRadius: 6, color: '#8F5CFF', fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: '0.06em', cursor: 'pointer', boxShadow: '2px 2px 0px #000' }}
          onClick={onPerkSelect}
        >
          ◆ Choose your perk reward
        </button>
        <button
          style={{ width: '100%', padding: '14px', background: '#FF3B3B', border: 'none', borderRadius: 6, color: '#fff', fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: '0.06em', cursor: 'pointer', boxShadow: '3px 3px 0px #000, 0 0 16px #FF3B3B40' }}
          onClick={onNext}
        >
          Start Round 04 →
        </button>
      </div>
    </div>
  );
}
