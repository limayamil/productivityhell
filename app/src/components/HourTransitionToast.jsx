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
        position: 'fixed', left: '50%', top: 16, transform: 'translateX(-50%)',
        zIndex: 400, cursor: 'pointer',
        background: '#13131C', border: `1px solid ${rank.color}60`,
        borderRadius: 6, padding: '10px 14px',
        boxShadow: `3px 3px 0px #000, 0 0 16px ${rank.color}40`,
        display: 'flex', alignItems: 'center', gap: 12,
        minWidth: 240, maxWidth: 340,
      }}
    >
      <div style={{
        fontFamily: "'Bebas Neue'", fontSize: 28, lineHeight: 1, color: rank.color,
        textShadow: `0 0 8px ${rank.color}80`, width: 36, textAlign: 'center', flexShrink: 0,
      }}>
        {rank.rank}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A',
        }}>
          Hour closed · tap for details
        </div>
        <div style={{
          fontFamily: "'Space Mono'", fontSize: 16, fontWeight: 700, color: '#FFD166', marginTop: 2,
        }}>
          {score.toLocaleString()} pts
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        style={{
          background: 'transparent', border: 'none', color: '#4A4A5A',
          fontSize: 14, cursor: 'pointer', padding: 4,
        }}
      >
        ✕
      </button>
    </div>
  );
}
