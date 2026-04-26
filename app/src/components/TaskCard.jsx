import { PRIORITY_COLORS, CAT_COLORS } from '../data/constants';

export default function TaskCard({ task, onComplete }) {
  const p = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
  const catColor = CAT_COLORS[task.category?.toLowerCase()] || '#8A8A9A';

  return (
    <div
      style={{
        background: '#13131C',
        border: '1px solid #2A2A35',
        borderRadius: 6,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: task.done ? 'none' : '2px 2px 0px #000',
        position: 'relative',
        overflow: 'hidden',
        opacity: task.done ? 0.45 : 1,
        transition: 'opacity 200ms, transform 120ms cubic-bezier(0.22,1,0.36,1)',
        cursor: task.done ? 'default' : 'pointer',
      }}
      onClick={() => !task.done && onComplete && onComplete(task.id)}
    >
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: p.color,
        boxShadow: p.glow || 'none',
      }} />

      <div
        style={{
          width: 28, height: 28, borderRadius: 4, flexShrink: 0,
          border: task.done ? 'none' : '1px solid #2A2A35',
          background: task.done ? '#7CFF6B' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: task.done ? '#0B0B10' : 'transparent',
          fontSize: 13, fontWeight: 900, cursor: 'pointer',
          transition: 'all 150ms cubic-bezier(0.22,1,0.36,1)',
        }}
        onClick={e => { e.stopPropagation(); !task.done && onComplete && onComplete(task.id); }}
      >
        {task.done ? '✓' : ''}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 13, fontWeight: 600,
          color: '#F0EDE8',
          textDecoration: task.done ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {task.title}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
            padding: '2px 6px', borderRadius: 2,
            color: catColor, background: catColor + '15',
          }}>
            {task.category}
          </span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
            padding: '2px 6px', borderRadius: 2,
            color: p.color, background: p.bg,
          }}>
            {task.priority}
          </span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#4A4A5A' }}>
            {task.duration} min
          </span>
        </div>
      </div>

      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 12, fontWeight: 700,
        color: task.done ? '#4A4A5A' : p.color,
        flexShrink: 0,
        textShadow: task.done ? 'none' : (p.glow || 'none'),
      }}>
        +{task.points}
      </div>
    </div>
  );
}
