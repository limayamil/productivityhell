import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function BonusRevealSequence({ anchor, beats, onEnd }) {
  const [active, setActive] = useState([]);
  const idRef = useRef(0);
  const onEndRef = useRef(onEnd);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    if (!beats || beats.length === 0) {
      onEndRef.current?.();
      return;
    }

    let cancelled = false;
    const timers = [];

    const run = (i) => {
      if (cancelled) return;
      if (i >= beats.length) {
        const endTimer = setTimeout(() => onEndRef.current?.(), 380);
        timers.push(endTimer);
        return;
      }
      const beat = beats[i];
      const id = ++idRef.current;
      setActive(a => [...a, { id, beat }]);

      const lifetime = beat.kind === 'final' ? 1100 : 720;
      const removeTimer = setTimeout(() => {
        setActive(a => a.filter(x => x.id !== id));
      }, lifetime);
      timers.push(removeTimer);

      const interBeat = beat.kind === 'final' ? 360 : 280;
      const nextTimer = setTimeout(() => run(i + 1), interBeat);
      timers.push(nextTimer);
    };

    run(0);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [beats]);

  if (!anchor) return null;

  const centerX = anchor.left + anchor.width / 2;
  const baseTop = anchor.top - 6;

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 250 }}>
      {active.map(({ id, beat }) => {
        const isFinal = beat.kind === 'final';
        return (
          <div
            key={id}
            style={{
              position: 'fixed',
              top: baseTop,
              left: centerX,
              transform: 'translate(-50%, -100%)',
              fontFamily: "'Bebas Neue'",
              fontSize: beat.size || 24,
              color: beat.color,
              textShadow: `0 0 14px ${beat.color}aa, 2px 2px 0 #000`,
              whiteSpace: 'nowrap',
              textAlign: 'center',
              animation: `${isFinal ? 'bonusFinal 1.1s' : 'bonusBeat 0.72s'} cubic-bezier(0.22,1,0.36,1) forwards`,
              letterSpacing: '0.02em',
            }}
          >
            <div>{beat.text}</div>
            {beat.label && (
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: isFinal ? 10 : 8,
                  fontWeight: 700,
                  color: beat.color,
                  opacity: 0.85,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  marginTop: -2,
                  textShadow: `0 0 6px ${beat.color}66`,
                }}
              >
                {beat.label}
              </div>
            )}
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
