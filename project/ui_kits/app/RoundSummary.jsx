// RoundSummary.jsx — Productivity Hell

const RANKS = [
  { rank: 'F',   label: 'Doomed',             color: '#4A4A5A', min: 0    },
  { rank: 'D',   label: 'Barely Alive',        color: '#8A8A9A', min: 500  },
  { rank: 'C',   label: 'Survived',            color: '#FFD166', min: 1000 },
  { rank: 'B',   label: 'Productive Sinner',   color: '#FF3B3B', min: 2000 },
  { rank: 'A',   label: 'Focus Fiend',         color: '#3DDCFF', min: 3000 },
  { rank: 'S',   label: 'Hellbreaker',         color: '#8F5CFF', min: 4500 },
  { rank: 'SS',  label: 'Productivity Demon',  color: '#FFD166', min: 6000 },
  { rank: 'SSS', label: 'God Mode',            color: '#FF3B3B', min: 8000 },
];

const getRank = (score) => {
  let r = RANKS[0];
  for (const rank of RANKS) { if (score >= rank.min) r = rank; }
  return r;
};

const RoundSummary = ({ score = 4820, onNext, onPerkSelect }) => {
  const rank = getRank(score);
  const baseScore = 3200;
  const perkBonus = 960;
  const comboBonus = 660;
  const penalty = 0;
  const [revealed, setRevealed] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(t);
  }, []);

  const completedTasks = [
    { title: 'Fix auth bug in staging env',    pts: 700, cat: 'Dev',       priority: 'high'     },
    { title: 'Write Q3 campaign brief',        pts: 375, cat: 'Marketing', priority: 'medium'   },
    { title: 'Reply to team Slack threads',    pts: 90,  cat: 'Admin',     priority: 'low'      },
    { title: 'Review pull requests',           pts: 300, cat: 'Dev',       priority: 'medium'   },
  ];
  const failedTasks = [
    { title: 'Client presentation deck · FINAL', pts: 0, cat: 'Creative', priority: 'critical' },
  ];

  const catColors = { Marketing:'#FF3B3B', Dev:'#3DDCFF', Meetings:'#FFD166', Admin:'#8A8A9A', Creative:'#8F5CFF', Personal:'#7CFF6B' };
  const priColors = { low:'#8A8A9A', medium:'#FFD166', high:'#FF3B3B', critical:'#8F5CFF' };

  const rs = {
    screen: { background: '#0B0B10', minHeight: '100%', display: 'flex', flexDirection: 'column' },
    crt: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' },
    hero: { padding: '24px 16px 20px', textAlign: 'center', borderBottom: '1px solid #2A2A35', position: 'relative', overflow: 'hidden' },
    heroBg: { position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 100%, ${rank.color}15 0%, transparent 70%)`, pointerEvents: 'none' },
    eyebrow: { fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4A4A5A' },
    rankDisplay: { fontFamily: "'Bebas Neue'", fontSize: 96, letterSpacing: '0.04em', lineHeight: 1, color: rank.color, textShadow: `0 0 40px ${rank.color}60`, opacity: revealed ? 1 : 0, transform: revealed ? 'scale(1)' : 'scale(0.6)', transition: 'all 500ms cubic-bezier(0.34,1.56,0.64,1)' },
    rankLabel: { fontFamily: "'Bebas Neue'", fontSize: 20, color: rank.color, letterSpacing: '0.06em', opacity: revealed ? 1 : 0, transition: 'opacity 400ms 200ms' },
    scoreDisplay: { fontFamily: "'Space Mono'", fontSize: 36, fontWeight: 700, color: '#FFD166', lineHeight: 1, marginTop: 8, opacity: revealed ? 1 : 0, transition: 'opacity 400ms 300ms' },
    scoreLabel: { fontFamily: "'Space Grotesk'", fontSize: 10, color: '#4A4A5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 },
    breakdown: { padding: '16px' },
    breakdownTitle: { fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', marginBottom: 10 },
    scoreRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1E1E2A' },
    scoreRowLabel: { fontFamily: "'Space Grotesk'", fontSize: 12, color: '#8A8A9A' },
    scoreRowVal: (color) => ({ fontFamily: "'Space Mono'", fontSize: 13, fontWeight: 700, color }),
    totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 0', marginTop: 2 },
    totalLabel: { fontFamily: "'Bebas Neue'", fontSize: 20, color: '#F0EDE8', letterSpacing: '0.04em' },
    totalVal: { fontFamily: "'Space Mono'", fontSize: 22, fontWeight: 700, color: '#FFD166', textShadow: '0 0 12px #FFD16660' },
    taskSection: { padding: '0 16px 16px' },
    sectionLabel: { fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', marginBottom: 8 },
    taskRow: (failed) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: failed ? '#FF3B3B08' : '#13131C', borderRadius: 4, border: `1px solid ${failed ? '#FF3B3B20' : '#1E1E2A'}`, marginBottom: 5 }),
    taskTitle: (failed) => ({ fontFamily: "'Space Grotesk'", fontSize: 11, color: failed ? '#FF3B3B80' : '#8A8A9A', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: failed ? 'line-through' : 'none' }),
    taskPts: (failed) => ({ fontFamily: "'Space Mono'", fontSize: 11, color: failed ? '#FF3B3B60' : '#7CFF6B', fontWeight: 700, marginLeft: 8, flexShrink: 0 }),
    footer: { padding: '16px', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' },
    nextBtn: { width: '100%', padding: '14px', background: '#FF3B3B', border: 'none', borderRadius: 6, color: '#fff', fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: '0.06em', cursor: 'pointer', boxShadow: '3px 3px 0px #000, 0 0 16px #FF3B3B40' },
    perkBtn: { width: '100%', padding: '12px', background: '#13131C', border: '1px solid #8F5CFF60', borderRadius: 6, color: '#8F5CFF', fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: '0.06em', cursor: 'pointer', boxShadow: '2px 2px 0px #000' },
  };

  return (
    <div style={rs.screen}>
      <div style={rs.crt}></div>
      <div style={rs.hero}>
        <div style={rs.heroBg}></div>
        <div style={rs.eyebrow}>Round 03 · 10:00 — Complete</div>
        <div style={rs.rankDisplay}>{rank.rank}</div>
        <div style={rs.rankLabel}>{rank.label}</div>
        <div style={rs.scoreDisplay}>{score.toLocaleString()}</div>
        <div style={rs.scoreLabel}>Final Score</div>
      </div>

      <div style={rs.breakdown}>
        <div style={rs.breakdownTitle}>Score Breakdown</div>
        <div style={rs.scoreRow}><span style={rs.scoreRowLabel}>Base score</span><span style={rs.scoreRowVal('#F0EDE8')}>{baseScore.toLocaleString()}</span></div>
        <div style={rs.scoreRow}><span style={rs.scoreRowLabel}>Perk bonuses</span><span style={rs.scoreRowVal('#8F5CFF')}>+{perkBonus}</span></div>
        <div style={rs.scoreRow}><span style={rs.scoreRowLabel}>Combo multipliers</span><span style={rs.scoreRowVal('#3DDCFF')}>+{comboBonus}</span></div>
        {penalty > 0 && <div style={rs.scoreRow}><span style={rs.scoreRowLabel}>Penalties</span><span style={rs.scoreRowVal('#FF3B3B')}>−{penalty}</span></div>}
        <div style={rs.totalRow}><span style={rs.totalLabel}>Total</span><span style={rs.totalVal}>{score.toLocaleString()}</span></div>
      </div>

      <div style={rs.taskSection}>
        <div style={rs.sectionLabel}>Completed · {completedTasks.length} tasks</div>
        {completedTasks.map((t, i) => (
          <div key={i} style={rs.taskRow(false)}>
            <span style={rs.taskTitle(false)}>{t.title}</span>
            <span style={rs.taskPts(false)}>+{t.pts}</span>
          </div>
        ))}
        {failedTasks.length > 0 && <>
          <div style={{ ...rs.sectionLabel, marginTop: 12, color: '#FF3B3B80' }}>Failed · {failedTasks.length} task</div>
          {failedTasks.map((t, i) => (
            <div key={i} style={rs.taskRow(true)}>
              <span style={rs.taskTitle(true)}>{t.title}</span>
              <span style={rs.taskPts(true)}>✕</span>
            </div>
          ))}
        </>}
      </div>

      <div style={rs.footer}>
        <button style={rs.perkBtn} onClick={onPerkSelect}>◆ Choose your perk reward</button>
        <button style={rs.nextBtn} onClick={onNext}>Start Round 04 →</button>
      </div>
    </div>
  );
};

Object.assign(window, { RoundSummary, getRank, RANKS });
