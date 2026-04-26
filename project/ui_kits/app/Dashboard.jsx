// Dashboard.jsx — Productivity Hell

const SAMPLE_TASKS = [
  { id: 1, title: 'Fix auth bug in staging env', category: 'Dev', priority: 'high', duration: 45, points: 280, done: false },
  { id: 2, title: 'Write Q3 campaign brief', category: 'Marketing', priority: 'medium', duration: 30, points: 150, done: true },
  { id: 3, title: 'Client presentation deck · FINAL', category: 'Creative', priority: 'critical', duration: 60, points: 500, done: false },
  { id: 4, title: 'Reply to team Slack threads', category: 'Admin', priority: 'low', duration: 10, points: 60, done: true },
  { id: 5, title: 'Review pull requests', category: 'Dev', priority: 'medium', duration: 20, points: 120, done: false },
];

const SAMPLE_PERKS = [
  { id: 1, name: 'Deep Work Demon', rarity: 'rare', icon: '⏱', effect: '×1.5 on 30+ min', active: true },
  { id: 2, name: 'Hell Multiplier', rarity: 'epic', icon: '◆', effect: '+0.25× / streak', active: true },
  { id: 3, name: 'Inbox Exorcist', rarity: 'common', icon: '⚙', effect: '+50 pts / Admin', active: false },
];

const Dashboard = ({ onAddTask, onEndRound, tasks: propTasks }) => {
  const [tasks, setTasks] = React.useState(propTasks || SAMPLE_TASKS);
  const [timeLeft, setTimeLeft] = React.useState(38 * 60 + 22);
  const [score, setScore] = React.useState(1240);
  const [multiplier, setMultiplier] = React.useState(1.5);
  const [streak, setStreak] = React.useState(3);
  const [floaters, setFloaters] = React.useState([]);
  const [hellMode, setHellMode] = React.useState(false);
  const TARGET = 3000;

  React.useEffect(() => {
    const t = setInterval(() => setTimeLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  React.useEffect(() => {
    setHellMode(timeLeft < 10 * 60 && score < TARGET * 0.7);
  }, [timeLeft, score]);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const progress = Math.min(score / TARGET, 1);

  const roundStatus = score >= TARGET ? 'safe' : timeLeft < 10 * 60 ? 'hell' : score / TARGET > 0.5 ? 'safe' : 'risky';
  const statusMap = {
    safe:  { label: 'Safe',      color: '#7CFF6B', bg: '#7CFF6B15', border: '#7CFF6B40' },
    risky: { label: 'Risky',     color: '#FFD166', bg: '#FFD16615', border: '#FFD16640' },
    hell:  { label: '⚡ Hell Mode', color: '#FF3B3B', bg: '#FF3B3B20', border: '#FF3B3B50' },
  };
  const st = statusMap[roundStatus];

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

  const ds = {
    screen: { background: '#0B0B10', minHeight: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' },
    crt: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' },
    header: { padding: '16px 16px 12px', borderBottom: '1px solid #2A2A35' },
    appTitle: { fontFamily: "'Bebas Neue'", fontSize: 13, letterSpacing: '0.14em', color: '#4A4A5A', textTransform: 'uppercase' },
    roundRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    roundName: { fontFamily: "'Bebas Neue'", fontSize: 28, color: '#F0EDE8', letterSpacing: '0.04em', lineHeight: 1 },
    statusBadge: { fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 100, background: st.bg, color: st.color, border: `1px solid ${st.border}`, animation: roundStatus === 'hell' ? 'hellpulse 1.2s ease-in-out infinite alternate' : 'none' },
    timerBlock: { padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    timer: { fontFamily: "'Space Mono'", fontSize: 40, fontWeight: 700, color: st.color, lineHeight: 1, textShadow: roundStatus === 'hell' ? `0 0 16px ${st.color}80` : 'none', transition: 'color 0.5s, text-shadow 0.5s' },
    timerLabel: { fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A5A', marginTop: 2 },
    statsRow: { display: 'flex', gap: 0 },
    statBlock: { flex: 1, textAlign: 'right' },
    statVal: (color) => ({ fontFamily: "'Space Mono'", fontSize: 20, fontWeight: 700, color, lineHeight: 1 }),
    statLabel: { fontFamily: "'Space Grotesk'", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A5A', marginTop: 2 },
    progressWrap: { padding: '0 16px 12px' },
    progressTrack: { height: 5, background: '#2A2A35', borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 2, background: st.color, boxShadow: `0 0 6px ${st.color}80`, width: `${progress * 100}%`, transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)' },
    progressLabel: { display: 'flex', justifyContent: 'space-between', marginTop: 4 },
    progressText: { fontFamily: "'Space Mono'", fontSize: 9, color: '#4A4A5A' },
    perksRow: { padding: '0 16px 12px', display: 'flex', gap: 6 },
    perkChip: (p) => {
      const rc = { common:'#8A8A9A', uncommon:'#7CFF6B', rare:'#3DDCFF', epic:'#8F5CFF', legendary:'#FFD166', cursed:'#FF3B3B', hellborn:'#FFD166' };
      const c = rc[p.rarity] || '#8A8A9A';
      return { fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 100, background: c + '15', color: p.active ? c : '#4A4A5A', border: `1px solid ${p.active ? c + '50' : '#2A2A35'}`, display: 'inline-flex', alignItems: 'center', gap: 4 };
    },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 8px' },
    sectionLabel: { fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A' },
    tasks: { padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 },
    fab: { position: 'fixed', bottom: 80, right: 20, width: 52, height: 52, borderRadius: 100, background: '#FF3B3B', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '3px 3px 0px #000, 0 0 16px #FF3B3B60', zIndex: 100 },
    endBtn: { margin: '16px', padding: '12px', background: 'transparent', border: '1px solid #2A2A35', borderRadius: 6, color: '#4A4A5A', fontFamily: "'Space Grotesk'", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', boxShadow: '2px 2px 0px #000' },
    streakBar: { padding: '0 16px 12px', display: 'flex', alignItems: 'center', gap: 8 },
    streakLabel: { fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A5A' },
    streakVal: { fontFamily: "'Space Mono'", fontSize: 13, fontWeight: 700, color: '#3DDCFF' },
    floater: (fl) => ({ position: 'fixed', top: '30%', left: `${fl.x}%`, fontFamily: "'Bebas Neue'", fontSize: 28, color: '#FFD166', textShadow: '0 0 12px #FFD16680', pointerEvents: 'none', zIndex: 200, animation: 'floatUp 0.9s cubic-bezier(0.22,1,0.36,1) forwards' }),
  };

  return (
    <div style={ds.screen}>
      <style>{`
        @keyframes floatUp { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(-60px)} }
        @keyframes hellpulse { from{box-shadow:0 0 6px #FF3B3B30} to{box-shadow:0 0 14px #FF3B3B80} }
      `}</style>
      <div style={ds.crt}></div>
      {floaters.map(fl => <div key={fl.id} style={ds.floater(fl)}>{fl.text}</div>)}

      <div style={ds.header}>
        <div style={ds.appTitle}>Productivity Hell</div>
        <div style={ds.roundRow}>
          <div style={ds.roundName}>Round 03 · 10:00</div>
          <div style={ds.statusBadge}>{st.label}</div>
        </div>
      </div>

      <div style={ds.timerBlock}>
        <div>
          <div style={ds.timer}>{mins}:{secs}</div>
          <div style={ds.timerLabel}>remaining</div>
        </div>
        <div style={ds.statsRow}>
          <div style={ds.statBlock}>
            <div style={ds.statVal('#FFD166')}>{score.toLocaleString()}</div>
            <div style={ds.statLabel}>Points</div>
          </div>
          <div style={{ width: 1, background: '#2A2A35', margin: '0 16px' }}></div>
          <div style={ds.statBlock}>
            <div style={ds.statVal('#8F5CFF')}>×{multiplier.toFixed(2)}</div>
            <div style={ds.statLabel}>Mult</div>
          </div>
        </div>
      </div>

      <div style={ds.progressWrap}>
        <div style={ds.progressTrack}><div style={ds.progressFill}></div></div>
        <div style={ds.progressLabel}>
          <span style={ds.progressText}>{score.toLocaleString()} / {TARGET.toLocaleString()} pts</span>
          <span style={ds.progressText}>{Math.round(progress * 100)}%</span>
        </div>
      </div>

      <div style={ds.streakBar}>
        <span style={ds.streakLabel}>Streak</span>
        <span style={ds.streakVal}>◉ {streak}</span>
        <span style={{ ...ds.streakLabel, marginLeft: 'auto' }}>Perks Active</span>
        {SAMPLE_PERKS.filter(p => p.active).map(p => (
          <span key={p.id} style={ds.perkChip(p)}>{p.icon} {p.name.split(' ')[0]}</span>
        ))}
      </div>

      <div style={ds.sectionHeader}>
        <span style={ds.sectionLabel}>Active Tasks · {tasks.filter(t => !t.done).length} remaining</span>
        <span style={{ ...ds.sectionLabel, color: '#7CFF6B' }}>{tasks.filter(t => t.done).length} done</span>
      </div>

      <div style={ds.tasks}>
        {tasks.map(t => <TaskCard key={t.id} task={t} onComplete={completeTask} />)}
      </div>

      <button style={ds.endBtn} onClick={onEndRound}>End Round Early →</button>
      <button style={ds.fab} onClick={onAddTask}>+</button>
    </div>
  );
};

Object.assign(window, { Dashboard, SAMPLE_TASKS, SAMPLE_PERKS });
