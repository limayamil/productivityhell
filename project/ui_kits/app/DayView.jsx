// DayView.jsx — Productivity Hell

const DAY_ROUNDS = [
  { hour: '09:00', score: 2800, rank: 'C', tasks: 4, failed: 1, perks: ['Inbox Exorcist'], status: 'survived', mult: '×1.5' },
  { hour: '10:00', score: 4820, rank: 'A', tasks: 5, failed: 0, perks: ['Deep Work Demon', 'Hell Multiplier'], status: 'cleared', mult: '×2.75' },
  { hour: '11:00', score: 1100, rank: 'D', tasks: 2, failed: 3, perks: [], status: 'failed', mult: '×1.0' },
  { hour: '12:00', score: 6200, rank: 'S', tasks: 6, failed: 0, perks: ['Critical Combo', 'Category Streak'], status: 'cleared', mult: '×3.5' },
  { hour: '13:00', score: 0,    rank: null, tasks: 0, failed: 0, perks: [], status: 'active', mult: '—' },
  { hour: '14:00', score: 0,    rank: null, tasks: 0, failed: 0, perks: [], status: 'upcoming', mult: '—' },
  { hour: '15:00', score: 0,    rank: null, tasks: 0, failed: 0, perks: [], status: 'upcoming', mult: '—' },
  { hour: '16:00', score: 0,    rank: null, tasks: 0, failed: 0, perks: [], status: 'upcoming', mult: '—' },
  { hour: '17:00', score: 0,    rank: null, tasks: 0, failed: 0, perks: [], status: 'upcoming', mult: '—' },
];

const statusStyles = {
  cleared:  { color: '#7CFF6B', border: '#7CFF6B40', bg: '#7CFF6B08', label: 'Cleared'  },
  survived: { color: '#FFD166', border: '#FFD16640', bg: '#FFD16608', label: 'Survived' },
  failed:   { color: '#FF3B3B', border: '#FF3B3B40', bg: '#FF3B3B08', label: 'Failed'   },
  active:   { color: '#3DDCFF', border: '#3DDCFF60', bg: '#3DDCFF10', label: 'Active'   },
  upcoming: { color: '#2A2A35', border: '#2A2A35',   bg: '#13131C',   label: 'Upcoming' },
};

const rankColors = { 'F':'#4A4A5A','D':'#8A8A9A','C':'#FFD166','B':'#FF3B3B','A':'#3DDCFF','S':'#8F5CFF','SS':'#FFD166','SSS':'#FF3B3B' };

const DayView = ({ onRoundSelect }) => {
  const totalScore = DAY_ROUNDS.reduce((sum, r) => sum + r.score, 0);
  const completedRounds = DAY_ROUNDS.filter(r => r.status === 'cleared' || r.status === 'survived').length;
  const failedRounds = DAY_ROUNDS.filter(r => r.status === 'failed').length;

  const dv = {
    screen: { background: '#0B0B10', minHeight: '100%', display: 'flex', flexDirection: 'column' },
    crt: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' },
    header: { padding: '16px 16px 12px', borderBottom: '1px solid #2A2A35' },
    title: { fontFamily: "'Bebas Neue'", fontSize: 28, color: '#F0EDE8', letterSpacing: '0.04em' },
    subtitle: { fontFamily: "'Space Grotesk'", fontSize: 10, color: '#4A4A5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 },
    statsRow: { display: 'flex', gap: 0, padding: '12px 16px', borderBottom: '1px solid #2A2A35' },
    statBlock: { flex: 1, textAlign: 'center' },
    statVal: (color) => ({ fontFamily: "'Space Mono'", fontSize: 18, fontWeight: 700, color, lineHeight: 1 }),
    statLabel: { fontFamily: "'Space Grotesk'", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A5A', marginTop: 3 },
    divider: { width: 1, background: '#2A2A35' },
    list: { padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 },
    roundCard: (r) => {
      const s = statusStyles[r.status];
      return {
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 6,
        padding: '12px 14px',
        cursor: r.status !== 'upcoming' ? 'pointer' : 'default',
        boxShadow: r.status === 'active' ? '0 0 12px #3DDCFF20' : '2px 2px 0px #000',
        display: 'flex', alignItems: 'center', gap: 12,
        transition: 'transform 120ms cubic-bezier(0.22,1,0.36,1)',
      };
    },
    hourBadge: (r) => {
      const s = statusStyles[r.status];
      return { fontFamily: "'Bebas Neue'", fontSize: 16, color: s.color, letterSpacing: '0.04em', width: 44, flexShrink: 0 };
    },
    roundBody: { flex: 1, minWidth: 0 },
    roundStatus: (r) => {
      const s = statusStyles[r.status];
      return { fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: s.color };
    },
    roundMeta: { display: 'flex', gap: 8, marginTop: 3, flexWrap: 'wrap' },
    metaTag: (color) => ({ fontFamily: "'Space Grotesk'", fontSize: 9, color: color || '#4A4A5A' }),
    rankBadge: (r) => {
      if (!r.rank) return { display: 'none' };
      const c = rankColors[r.rank] || '#8A8A9A';
      return { fontFamily: "'Bebas Neue'", fontSize: 20, color: c, textShadow: `0 0 8px ${c}60`, letterSpacing: '0.04em', flexShrink: 0, width: 36, textAlign: 'center' };
    },
    scoreRight: (r) => {
      const s = statusStyles[r.status];
      return { fontFamily: "'Space Mono'", fontSize: 12, fontWeight: 700, color: r.score > 0 ? '#FFD166' : s.color, flexShrink: 0, textAlign: 'right' };
    },
    perkChips: { display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' },
    perkChip: { fontFamily: "'Space Grotesk'", fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 2, background: '#8F5CFF15', color: '#8F5CFF', border: '1px solid #8F5CFF30' },
    activePulse: { animation: 'activePulse 1.5s ease-in-out infinite alternate' },
  };

  return (
    <div style={dv.screen}>
      <style>{`@keyframes activePulse { from{box-shadow:0 0 8px #3DDCFF15} to{box-shadow:0 0 18px #3DDCFF40} }`}</style>
      <div style={dv.crt}></div>
      <div style={dv.header}>
        <div style={dv.title}>Today's Run</div>
        <div style={dv.subtitle}>April 26, 2026 · 9 rounds · Day 14</div>
      </div>

      <div style={dv.statsRow}>
        <div style={dv.statBlock}>
          <div style={dv.statVal('#FFD166')}>{totalScore.toLocaleString()}</div>
          <div style={dv.statLabel}>Day Score</div>
        </div>
        <div style={dv.divider}></div>
        <div style={dv.statBlock}>
          <div style={dv.statVal('#7CFF6B')}>{completedRounds}</div>
          <div style={dv.statLabel}>Cleared</div>
        </div>
        <div style={dv.divider}></div>
        <div style={dv.statBlock}>
          <div style={dv.statVal('#FF3B3B')}>{failedRounds}</div>
          <div style={dv.statLabel}>Failed</div>
        </div>
        <div style={dv.divider}></div>
        <div style={dv.statBlock}>
          <div style={dv.statVal('#8F5CFF')}>5</div>
          <div style={dv.statLabel}>Perks</div>
        </div>
      </div>

      <div style={dv.list}>
        {DAY_ROUNDS.map((r, i) => (
          <div key={i}
            style={{ ...dv.roundCard(r), ...(r.status === 'active' ? dv.activePulse : {}) }}
            onClick={() => r.status !== 'upcoming' && onRoundSelect && onRoundSelect(r)}>
            <div style={dv.hourBadge(r)}>{r.hour}</div>
            <div style={dv.roundBody}>
              <div style={dv.roundStatus(r)}>
                {r.status === 'active' ? '◉ Active' : statusStyles[r.status].label}
                {r.status === 'active' && <span style={{ color:'#4A4A5A', marginLeft:8 }}>— in progress</span>}
              </div>
              {r.status !== 'upcoming' && r.status !== 'active' && (
                <div style={dv.roundMeta}>
                  <span style={dv.metaTag('#7CFF6B')}>{r.tasks} done</span>
                  {r.failed > 0 && <span style={dv.metaTag('#FF3B3B80')}>· {r.failed} failed</span>}
                  <span style={dv.metaTag()}>· {r.mult}</span>
                </div>
              )}
              {r.perks.length > 0 && (
                <div style={dv.perkChips}>
                  {r.perks.map((p, j) => <span key={j} style={dv.perkChip}>◆ {p}</span>)}
                </div>
              )}
            </div>
            {r.rank && <div style={dv.rankBadge(r)}>{r.rank}</div>}
            <div style={dv.scoreRight(r)}>
              {r.score > 0 ? r.score.toLocaleString() : r.status === 'active' ? 'LIVE' : '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { DayView, DAY_ROUNDS });
