import { useState, useEffect } from 'react';

export default function RoundSummary({ summary, onNext, onPerkSelect, onClose, onToggleRest, mode = 'live', canClaimPerk = true }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(t);
  }, []);

  if (!summary) return null;

  const { score, rank, baseScore, urgentBonus = 0, perkBonus, comboBonus, penalty, completed, failed, roundNumber, hourLabel } = summary;
  const archived = mode === 'archived';
  const perkClaimed = !!summary.perkClaimed;
  const missed = !!summary.missed;
  const rest = !!summary.rest;
  const accentColor = rest ? '#3DDCFF' : rank.color;
  const visibleFailed = rest ? [] : failed;

  const breakdownRows = [
    { label: 'Puntaje base',        val: baseScore.toLocaleString(),  color: '#F0EDE8', prefix: '' },
    { label: 'Bonos por urgencia',   val: urgentBonus.toLocaleString(), color: '#FF3B3B', prefix: '+' },
    { label: 'Bonos de perk',      val: perkBonus.toLocaleString(),  color: '#8F5CFF', prefix: '+' },
    { label: 'Bonos de multiplicador', val: comboBonus.toLocaleString(), color: '#3DDCFF', prefix: '+' },
  ].filter(row => !rest || row.label !== 'Bonos de perk');

  return (
    <div className="overlayIn" style={{ background: '#0B0B10', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="crtOverlay" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />

      <div style={{ padding: '24px 16px 20px', textAlign: 'center', borderBottom: '1px solid #2A2A35', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 100%, ${accentColor}15 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4A4A5A' }}>
          Round {String(roundNumber).padStart(2, '0')} · {hourLabel} — Complete
        </div>
        <div style={{
          display: rest ? 'none' : 'block',
          fontFamily: "'Bebas Neue'", fontSize: 96, letterSpacing: '0.04em', lineHeight: 1,
          color: rank.color, textShadow: `0 0 40px ${rank.color}60`,
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'scale(1)' : 'scale(0.6)',
          transition: 'all 500ms cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          {rank.rank}
        </div>
        <div style={{ display: rest ? 'none' : 'block', fontFamily: "'Bebas Neue'", fontSize: 20, color: rank.color, letterSpacing: '0.06em', opacity: revealed ? 1 : 0, transition: 'opacity 400ms 200ms' }}>
          {rank.label}
        </div>
        <div style={{ display: rest ? 'none' : 'block', fontFamily: "'Space Mono'", fontSize: 36, fontWeight: 700, color: '#FFD166', lineHeight: 1, marginTop: 8, opacity: revealed ? 1 : 0, transition: 'opacity 400ms 300ms' }}>
          {score.toLocaleString()}
        </div>
        <div style={{ display: rest ? 'none' : 'block', fontFamily: "'Space Grotesk'", fontSize: 10, color: '#4A4A5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
          Puntaje final
        </div>
        {rest && (
          <div style={{ display: 'inline-flex', marginTop: 28, minWidth: 190, justifyContent: 'center', padding: '12px 20px 10px', border: '3px solid #3DDCFF', borderRadius: 4, background: 'linear-gradient(135deg, #3DDCFF14, #0B0B1000 58%), repeating-linear-gradient(-18deg, #3DDCFF00 0 5px, #3DDCFF1E 6px 7px)', boxShadow: '0 0 0 1px #0B0B10, 0 0 0 5px #3DDCFF2A, 3px 4px 0 #000', color: '#3DDCFF', fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.14em', lineHeight: 1.1, textShadow: '0 0 9px #3DDCFF70', opacity: revealed ? 0.92 : 0, transform: revealed ? 'rotate(-4deg) scale(1)' : 'rotate(-4deg) scale(0.85)', transition: 'all 500ms cubic-bezier(0.34,1.56,0.64,1)', mixBlendMode: 'screen' }}>
            Hora de Descanso
          </div>
        )}
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', marginBottom: 10 }}>
          Desglose del puntaje
        </div>
        {breakdownRows.map((row, index) => (
          <div key={row.label} className="summaryRow" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1E1E2A', '--arcade-delay': `${120 + index * 55}ms` }}>
            <span style={{ fontFamily: "'Space Grotesk'", fontSize: 12, color: '#8A8A9A' }}>{row.label}</span>
            <span style={{ fontFamily: "'Space Mono'", fontSize: 13, fontWeight: 700, color: row.color }}>{row.prefix}{row.val}</span>
          </div>
        ))}
        {penalty > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1E1E2A' }}>
            <span style={{ fontFamily: "'Space Grotesk'", fontSize: 12, color: '#8A8A9A' }}>Penalties</span>
            <span style={{ fontFamily: "'Space Mono'", fontSize: 13, fontWeight: 700, color: '#FF3B3B' }}>−{penalty}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 0', marginTop: 2 }}>
          <span style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: '#F0EDE8', letterSpacing: '0.04em' }}>Total</span>
          <span style={{ fontFamily: "'Space Mono'", fontSize: 22, fontWeight: 700, color: '#FFD166', textShadow: '0 0 12px #FFD16660' }}>{score.toLocaleString()}</span>
        </div>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', marginBottom: 8 }}>
          Completadas · {completed.length} {completed.length === 1 ? 'tarea' : 'tareas'}
        </div>
        {completed.length === 0 && (
          <div style={{ fontFamily: "'Space Grotesk'", fontSize: 11, color: '#4A4A5A', fontStyle: 'italic', padding: '6px 0' }}>
            No se completaron tareas en esta ronda.
          </div>
        )}
        {completed.map((t, i) => {
          const triggered = t.breakdown?.triggeredPerks || [];
          return (
            <div key={i} className="summaryRow" style={{ padding: '7px 10px', background: '#13131C', borderRadius: 4, border: '1px solid #1E1E2A', marginBottom: 5, '--arcade-delay': `${220 + i * 45}ms` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: "'Space Grotesk'", fontSize: 11, color: '#8A8A9A', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                <span style={{ fontFamily: "'Space Mono'", fontSize: 11, color: '#7CFF6B', fontWeight: 700, marginLeft: 8, flexShrink: 0 }}>+{t.pts}</span>
              </div>
              {!rest && triggered.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 5 }}>
                  {triggered.map(perk => (
                    <span key={perk.id} style={{
                      fontFamily: "'Space Grotesk'", fontSize: 8, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 2,
                      background: '#8F5CFF15', color: '#8F5CFF', border: '1px solid #8F5CFF30',
                    }}>
                      {perk.name}{perk.bonus > 0 ? ` +${perk.bonus}` : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {visibleFailed.length > 0 && (
          <>
            <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FF3B3B80', marginTop: 12, marginBottom: 8 }}>
              Fallidas · {failed.length} {failed.length === 1 ? 'tarea' : 'tareas'}
            </div>
            {visibleFailed.map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: '#FF3B3B08', borderRadius: 4, border: '1px solid #FF3B3B20', marginBottom: 5 }}>
                <span style={{ fontFamily: "'Space Grotesk'", fontSize: 11, color: '#FF3B3B80', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'line-through' }}>{t.title}</span>
                <span style={{ fontFamily: "'Space Mono'", fontSize: 11, color: '#FF3B3B60', fontWeight: 700, marginLeft: 8, flexShrink: 0 }}>✕</span>
              </div>
            ))}
          </>
        )}
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
        {!missed && !rest && !perkClaimed && canClaimPerk && (
          <button
            className="arcadePressable"
            style={{ width: '100%', padding: '12px', background: '#13131C', border: '1px solid #8F5CFF60', borderRadius: 6, color: '#8F5CFF', fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: '0.06em', cursor: 'pointer', boxShadow: '2px 2px 0px #000' }}
            onClick={onPerkSelect}
          >
            ◆ {archived ? 'Reclamar perk' : 'Elegi tu recompensa de perk'}
          </button>
        )}
        {archived && onToggleRest && (
          <button
            className="arcadePressable"
            style={{ width: '100%', padding: '12px', background: rest ? '#3DDCFF18' : '#13131C', border: `1px solid ${rest ? '#3DDCFF70' : '#2A2A35'}`, borderRadius: 6, color: rest ? '#3DDCFF' : '#8A8A9A', fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: '0.06em', cursor: 'pointer', boxShadow: '2px 2px 0px #000' }}
            onClick={onToggleRest}
          >
            {rest ? 'Quitar descanso' : 'Marcar como descanso'}
          </button>
        )}
        {!archived && (
          <button
            className="arcadePressable"
            style={{ width: '100%', padding: '14px', background: '#FF3B3B', border: 'none', borderRadius: 6, color: '#fff', fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: '0.06em', cursor: 'pointer', boxShadow: '3px 3px 0px #000, 0 0 16px #FF3B3B40' }}
            onClick={onNext}
          >
            Continue →
          </button>
        )}
        {archived && (
          <button
            className="arcadePressable"
            style={{ width: '100%', padding: '14px', background: '#1C1C2A', border: '1px solid #2A2A35', borderRadius: 6, color: '#F0EDE8', fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: '0.06em', cursor: 'pointer', boxShadow: '2px 2px 0px #000' }}
            onClick={onClose}
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}
