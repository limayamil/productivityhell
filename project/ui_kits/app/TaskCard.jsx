// TaskCard.jsx — Productivity Hell
// Shared to window for use in index.html

const TaskCard = ({ task, onComplete }) => {
  const priorityColors = {
    low: { color: '#8A8A9A', bg: '#8A8A9A15', border: '#8A8A9A40' },
    medium: { color: '#FFD166', bg: '#FFD16615', border: '#FFD16640' },
    high: { color: '#FF3B3B', bg: '#FF3B3B15', border: '#FF3B3B40' },
    critical: { color: '#8F5CFF', bg: '#8F5CFF15', border: '#8F5CFF40', glow: '0 0 6px #8F5CFF60' },
  };
  const catColors = {
    marketing: '#FF3B3B', dev: '#3DDCFF', meetings: '#FFD166',
    admin: '#8A8A9A', creative: '#8F5CFF', personal: '#7CFF6B',
  };
  const p = priorityColors[task.priority] || priorityColors.medium;
  const catColor = catColors[task.category?.toLowerCase()] || '#8A8A9A';

  const taskCardStyles = {
    container: {
      background: '#13131C',
      border: `1px solid ${task.done ? '#2A2A35' : '#2A2A35'}`,
      borderRadius: 6,
      padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: task.done ? 'none' : '2px 2px 0px #000',
      position: 'relative', overflow: 'hidden',
      opacity: task.done ? 0.45 : 1,
      transition: 'opacity 200ms, transform 120ms cubic-bezier(0.22,1,0.36,1)',
      cursor: task.done ? 'default' : 'pointer',
    },
    accent: {
      position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
      background: p.color,
      boxShadow: p.glow || 'none',
    },
    check: {
      width: 28, height: 28, borderRadius: 4, flexShrink: 0,
      border: task.done ? 'none' : `1px solid #2A2A35`,
      background: task.done ? '#7CFF6B' : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: task.done ? '#0B0B10' : 'transparent',
      fontSize: 13, fontWeight: 900, cursor: 'pointer',
      transition: 'all 150ms cubic-bezier(0.22,1,0.36,1)',
    },
    body: { flex: 1, minWidth: 0 },
    title: {
      fontFamily: "'Space Grotesk', sans-serif",
      fontSize: 13, fontWeight: 600,
      color: '#F0EDE8',
      textDecoration: task.done ? 'line-through' : 'none',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    },
    meta: { display: 'flex', gap: 6, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' },
    tag: (color, bg) => ({
      fontFamily: "'Space Grotesk', sans-serif",
      fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
      padding: '2px 6px', borderRadius: 2,
      color, background: bg,
    }),
    time: {
      fontFamily: "'Space Mono', monospace",
      fontSize: 10, color: '#4A4A5A',
    },
    pts: {
      fontFamily: "'Space Mono', monospace",
      fontSize: 12, fontWeight: 700,
      color: task.done ? '#4A4A5A' : p.color,
      flexShrink: 0,
      textShadow: task.done ? 'none' : (p.glow || 'none'),
    },
  };

  return (
    <div style={taskCardStyles.container} onClick={() => !task.done && onComplete && onComplete(task.id)}>
      <div style={taskCardStyles.accent}></div>
      <div style={taskCardStyles.check} onClick={e => { e.stopPropagation(); !task.done && onComplete && onComplete(task.id); }}>
        {task.done ? '✓' : ''}
      </div>
      <div style={taskCardStyles.body}>
        <div style={taskCardStyles.title}>{task.title}</div>
        <div style={taskCardStyles.meta}>
          <span style={taskCardStyles.tag(catColor, catColor + '15')}>{task.category}</span>
          <span style={taskCardStyles.tag(p.color, p.bg)}>{task.priority}</span>
          <span style={taskCardStyles.time}>{task.duration} min</span>
        </div>
      </div>
      <div style={taskCardStyles.pts}>+{task.points}</div>
    </div>
  );
};

Object.assign(window, { TaskCard });
