const STATUS_STYLES = {
  cleared:  { color: '#7CFF6B', border: '#7CFF6B40', bg: '#7CFF6B08', label: 'Cleared'  },
  survived: { color: '#FFD166', border: '#FFD16640', bg: '#FFD16608', label: 'Survived' },
  failed:   { color: '#FF3B3B', border: '#FF3B3B40', bg: '#FF3B3B08', label: 'Failed'   },
  missed:   { color: '#4A4A5A', border: '#2A2A35',   bg: '#13131C',   label: 'Missed'   },
  active:   { color: '#3DDCFF', border: '#3DDCFF60', bg: '#3DDCFF10', label: 'Active'   },
  upcoming: { color: '#2A2A35', border: '#2A2A35',   bg: '#13131C',   label: 'Upcoming' },
};

const RANK_COLORS = { F:'#4A4A5A', D:'#8A8A9A', C:'#FFD166', B:'#FF3B3B', A:'#3DDCFF', S:'#8F5CFF', SS:'#FFD166', SSS:'#FF3B3B' };

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function DayView({ rounds = [], date, dayNumber = 1, perksCount = 0, onRoundSelect }) {
  const totalScore     = rounds.reduce((sum, r) => sum + (r.score || 0), 0);
  const completedRounds = rounds.filter(r => r.status === 'cleared' || r.status === 'survived').length;
  const failedRounds   = rounds.filter(r => r.status === 'failed').length;

  return (
    <div style={{ background: '#0B0B10', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes activePulse { from{box-shadow:0 0 8px #3DDCFF15} to{box-shadow:0 0 18px #3DDCFF40} }`}</style>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />

      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #2A2A35' }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: '#F0EDE8', letterSpacing: '0.04em' }}>Today's Run</div>
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 10, color: '#4A4A5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
          {formatDate(date)} · {rounds.length} {rounds.length === 1 ? 'round' : 'rounds'} · Day {dayNumber}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0, padding: '12px 16px', borderBottom: '1px solid #2A2A35' }}>
        {[
          { val: totalScore.toLocaleString(), label: 'Day Score', color: '#FFD166' },
          { val: completedRounds,             label: 'Cleared',   color: '#7CFF6B' },
          { val: failedRounds,                label: 'Failed',    color: '#FF3B3B' },
          { val: perksCount,                  label: 'Perks',     color: '#8F5CFF' },
        ].map((s, i) => (
          <div key={s.label} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            {i > 0 && <div style={{ width: 1, background: '#2A2A35', alignSelf: 'stretch' }} />}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 18, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A5A', marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {rounds.length === 0 && (
          <div style={{
            border: '1px dashed #2A2A35', borderRadius: 6, padding: '24px 16px',
            textAlign: 'center', color: '#4A4A5A',
            fontFamily: "'Space Grotesk'", fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            No rounds yet today
          </div>
        )}
        {rounds.map((r, i) => {
          const styleKey = r.missed ? 'missed' : r.status;
          const s = STATUS_STYLES[styleKey] || STATUS_STYLES.upcoming;
          const rankCode = typeof r.rank === 'object' ? r.rank?.rank : r.rank;
          const rankColor = RANK_COLORS[rankCode] || '#8A8A9A';

          return (
            <div
              key={i}
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                borderRadius: 6,
                padding: '12px 14px',
                cursor: 'pointer',
                boxShadow: '2px 2px 0px #000',
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'transform 120ms cubic-bezier(0.22,1,0.36,1)',
              }}
              onClick={() => onRoundSelect && onRoundSelect(r)}
            >
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 16, color: s.color, letterSpacing: '0.04em', width: 44, flexShrink: 0 }}>
                {r.hour}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: s.color }}>
                  {s.label}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: "'Space Grotesk'", fontSize: 9, color: '#7CFF6B' }}>{r.tasks} done</span>
                  {(r.failedCount ?? r.failed) > 0 && <span style={{ fontFamily: "'Space Grotesk'", fontSize: 9, color: '#FF3B3B80' }}>· {r.failedCount ?? r.failed} failed</span>}
                  {r.mult && <span style={{ fontFamily: "'Space Grotesk'", fontSize: 9, color: '#4A4A5A' }}>· {r.mult}</span>}
                </div>
                {r.perks && r.perks.length > 0 && (
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

              {rankCode && (
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: rankColor, textShadow: `0 0 8px ${rankColor}60`, letterSpacing: '0.04em', flexShrink: 0, width: 36, textAlign: 'center' }}>
                  {rankCode}
                </div>
              )}

              <div style={{ fontFamily: "'Space Mono'", fontSize: 12, fontWeight: 700, color: r.score > 0 ? '#FFD166' : s.color, flexShrink: 0, textAlign: 'right' }}>
                {r.score > 0 ? r.score.toLocaleString() : '—'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
