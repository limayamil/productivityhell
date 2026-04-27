import { PRIORITY_COLORS, CAT_COLORS } from '../data/constants';
import AnimatedGradientText from './AnimatedGradientText';

export default function TaskCard({ task, categories, onComplete, index = 0, justCompleted = false, suppressDone = false }) {
  const p = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
  const catEntry = categories?.find(c => c.id === task.category);
  const catColor = catEntry?.color || CAT_COLORS[task.category?.toLowerCase()] || '#8A8A9A';
  const catLabel = catEntry?.label || task.category;
  const showAsDone = task.done && !suppressDone;
  const displayPoints = showAsDone && task.earned ? task.earned : task.points;
  const rolledDouble = task.creationPerk?.multiplier === 2;
  const triggerComplete = (e) => {
    if (task.done) return;
    if (!onComplete) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onComplete(task.id, rect);
  };

  return (
    <div
      className={`arcadeEnter arcadePressable ${justCompleted ? 'taskClear' : ''}`}
      style={{
        background: '#13131C',
        border: '1px solid #2A2A35',
        borderRadius: 6,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: showAsDone ? 'none' : '2px 2px 0px #000',
        position: 'relative',
        overflow: 'hidden',
        opacity: showAsDone ? 0.45 : 1,
        transition: 'opacity 200ms, transform 120ms cubic-bezier(0.22,1,0.36,1), filter 120ms cubic-bezier(0.22,1,0.36,1)',
        cursor: showAsDone ? 'default' : 'pointer',
        '--arcade-delay': `${Math.min(index * 45, 260)}ms`,
      }}
      onClick={triggerComplete}
    >
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: p.color,
        boxShadow: p.glow || `0 0 12px ${p.color}55`,
        animation: showAsDone ? 'none' : 'activePulse 1.8s ease-in-out infinite alternate',
      }} />

      {!showAsDone && (
        <div
          className="arcadeSweep"
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.18,
            pointerEvents: 'none',
            '--sweep-delay': `${600 + index * 120}ms`,
          }}
        />
      )}

      <div
        className={showAsDone ? 'checkPop' : undefined}
        style={{
          width: 28, height: 28, borderRadius: 4, flexShrink: 0,
          border: showAsDone ? 'none' : '1px solid #2A2A35',
          background: showAsDone ? '#7CFF6B' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: showAsDone ? '#0B0B10' : 'transparent',
          fontSize: 13, fontWeight: 900, cursor: 'pointer',
          transition: 'all 150ms cubic-bezier(0.22,1,0.36,1)',
        }}
        onClick={e => { e.stopPropagation(); triggerComplete(e); }}
      >
        {showAsDone ? '✓' : ''}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 13, fontWeight: 600,
          color: '#F0EDE8',
          textDecoration: showAsDone ? 'line-through' : 'none',
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
            {catLabel}
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
          {rolledDouble && (
            <span className="rollRewardTag" style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: '0.06em',
              padding: '2px 6px',
              borderRadius: 2,
              color: '#FFD166',
              background: '#FFD16618',
              border: '1px solid #FFD16650',
            }}>
              <AnimatedGradientText
                text="x2 roll"
                gradient="linear-gradient(110deg, #FFD166, #F0EDE8, #7CFF6B, #3DDCFF, #FFD166)"
              />
            </span>
          )}
        </div>
      </div>

      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 12, fontWeight: 700,
        color: showAsDone ? '#4A4A5A' : p.color,
        flexShrink: 0,
        textShadow: showAsDone ? 'none' : (p.glow || 'none'),
      }}>
        +{displayPoints}
      </div>
    </div>
  );
}
