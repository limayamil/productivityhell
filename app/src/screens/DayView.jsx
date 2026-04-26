import { DAY_ROUNDS } from '../data/constants';

const STATUS_STYLES = {
  cleared:  { color: '#7CFF6B', border: '#7CFF6B40', bg: '#7CFF6B08', label: 'Cleared'  },
  survived: { color: '#FFD166', border: '#FFD16640', bg: '#FFD16608', label: 'Survived' },
  failed:   { color: '#FF3B3B', border: '#FF3B3B40', bg: '#FF3B3B08', label: 'Failed'   },
  active:   { color: '#3DDCFF', border: '#3DDCFF60', bg: '#3DDCFF10', label: 'Active'   },
  upcoming: { color: '#2A2A35', border: '#2A2A35',   bg: '#13131C',   label: 'Upcoming' },
};

const RANK_COLORS = { F:'#4A4A5A', D:'#8A8A9A', C:'#FFD166', B:'#FF3B3B', A:'#3DDCFF', S:'#8F5CFF', SS:'#FFD166', SSS:'#FF3B3B' };

export default function DayView({ onRoundSelect }) {
  const totalScore     = DAY_ROUNDS.reduce((sum, r) => sum + r.score, 0);
  const completedRounds = DAY_ROUNDS.filter(r => r.status === 'cleared' || r.status === 'survived').length;
  const failedRounds   = DAY_ROUNDS.filter(r => r.status === 'failed').length;

  return (
    <div style={{ background: '#0B0B10', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes activePulse { from{box-shadow:0 0 8px #3DDCFF15} to{box-shadow:0 0 18px #3DDCFF40} }`}</style>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />

      {/* Header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #2A2A35' }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: '#F0EDE8', letterSpacing: '0.04em' }}>Today's Run</div>
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 10, color: '#4A4A5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
          April 26, 2026 · 9 rounds · Day 14
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 0, padding: '12px 16px', borderBottom: '1px solid #2A2A35' }}>
        {[
          { val: totalScore.toLocaleString(), label: 'Day Score', color: '#FFD166' },
          { val: completedRounds, label: 'Cleared', color: '#7CFF6B' },
          { val: failedRounds, label: 'Failed', color: '#FF3B3B' },
          { val: 5, label: 'Perks', color: '#8F5CFF' },
        ].map((s, i, arr) => (
          <div key={s.label} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            {i > 0 && <div style={{ width: 1, background: '#2A2A35', alignSelf: 'stretch' }} />}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 18, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A5A', marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Round list */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {DAY_ROUNDS.map((r, i) => {
          const s = STATUS_STYLES[r.status];
          const rankColor = RANK_COLORS[r.rank] || '#8A8A9A';
          const isActive = r.status === 'active';

          return (
            <div
              key={i}
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                borderRadius: 6,
                padding: '12px 14px',
                cursor: r.status !== 'upcoming' ? 'pointer' : 'default',
                boxShadow: isActive ? '0 0 12px #3DDCFF20' : '2px 2px 0px #000',
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'transform 120ms cubic-bezier(0.22,1,0.36,1)',
                animation: isActive ? 'activePulse 1.5s ease-in-out infinite alternate' : 'none',
              }}
              onClick={() => r.status !== 'upcoming' && onRoundSelect && onRoundSelect(r)}
            >
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 16, color: s.color, letterSpacing: '0.04em', width: 44, flexShrink: 0 }}>
                {r.hour}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: s.color }}>
                  {isActive ? '◉ Active' : s.label}
                  {isActive && <span style={{ color: '#4A4A5A', marginLeft: 8 }}>— in progress</span>}
                </div>

                {r.status !== 'upcoming' && !isActive && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: "'Space Grotesk'", fontSize: 9, color: '#7CFF6B' }}>{r.tasks} done</span>
                    {r.failed > 0 && <span style={{ fontFamily: "'Space Grotesk'", fontSize: 9, color: '#FF3B3B80' }}>· {r.failed} failed</span>}
                    <span style={{ fontFamily: "'Space Grotesk'", fontSize: 9, color: '#4A4A5A' }}>· {r.mult}</span>
                  </div>
                )}

                {r.perks.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                    {r.perks.map((p, j) => (
                      <span key={j} style={{
                        fontFamily: "'Space Grotesk'", fontSize: 8, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 2,
                        background: '#8F5CFF15', color: '#8F5CFF', border: '1px solid #8F5CFF30',
                      }}>
                        ◆ {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {r.rank && (
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: rankColor, textShadow: `0 0 8px ${rankColor}60`, letterSpacing: '0.04em', flexShrink: 0, width: 36, textAlign: 'center' }}>
                  {r.rank}
                </div>
              )}

              <div style={{ fontFamily: "'Space Mono'", fontSize: 12, fontWeight: 700, color: r.score > 0 ? '#FFD166' : s.color, flexShrink: 0, textAlign: 'right' }}>
                {r.score > 0 ? r.score.toLocaleString() : isActive ? 'LIVE' : '—'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
