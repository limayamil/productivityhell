import { useEffect } from 'react';

export default function HourTransitionToast({ pending, onOpen, onDismiss }) {
  useEffect(() => {
    if (!pending) return;
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [pending, onDismiss]);

  if (!pending) return null;
  const { score, rank } = pending;

  return (
    <div
      className="toastDrop arcadePressable"
      onClick={onOpen}
      style={{
        position: 'fixed', left: '50%', bottom: 74, transform: 'translateX(-50%)',
        zIndex: 400, cursor: 'pointer',
        background: 'linear-gradient(135deg, #1A1A28 0%, #13131C 100%)',
        border: `2px solid ${rank.color}`,
        borderRadius: 10, padding: '12px 16px',
        boxShadow: `0 0 0 1px ${rank.color}30, 0 0 24px ${rank.color}60, 0 8px 32px #000A`,
        display: 'flex', alignItems: 'center', gap: 14,
        minWidth: 280, maxWidth: 360,
      }}
    >
      <div style={{
        fontFamily: "'Bebas Neue'", fontSize: 38, lineHeight: 1, color: rank.color,
        textShadow: `0 0 12px ${rank.color}, 0 0 24px ${rank.color}80`,
        width: 42, textAlign: 'center', flexShrink: 0,
      }}>
        {rank.rank}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Space Grotesk'", fontSize: 10, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.12em', color: `${rank.color}CC`,
        }}>
          Hora cerrada · toca para ver detalles
        </div>
        <div style={{
          fontFamily: "'Space Mono'", fontSize: 20, fontWeight: 700, color: '#FFD166',
          textShadow: '0 0 10px #FFD16680', marginTop: 3,
        }}>
          {score.toLocaleString()} pts
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        style={{
          background: 'transparent', border: 'none', color: '#6A6A7A',
          fontSize: 16, cursor: 'pointer', padding: 4, lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  );
}
