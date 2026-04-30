import { useState, useEffect, useMemo } from 'react';

const RANK_COLORS = { F:'#4A4A5A', D:'#8A8A9A', C:'#FFD166', B:'#FF3B3B', A:'#3DDCFF', S:'#8F5CFF', SS:'#FFD166', SSS:'#FF3B3B' };

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function DaySummary({ summary, categories = [], onClose }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(t);
  }, []);

  const topCategories = useMemo(() => {
    const entries = Object.entries(summary?.byCategory || {});
    entries.sort((a, b) => b[1] - a[1]);
    return entries.slice(0, 5).map(([id, pts]) => {
      const cat = categories.find(c => c.id === id);
      return { id, label: cat?.label || id, color: cat?.color || '#8A8A9A', pts };
    });
  }, [summary, categories]);

  if (!summary) return null;

  const {
    date, dayNumber, totalScore, rank, baseScore, urgentBonus, perkBonus, comboBonus,
    peakMultiplier, completedTasks, failedTasks, cleared, survived, failed, rest,
    hours, endedAt,
  } = summary;

  const rankColor = rank?.color || RANK_COLORS[rank?.rank] || '#FFD166';

  const breakdownRows = [
    { label: 'Puntaje base',        val: baseScore.toLocaleString(),   color: '#F0EDE8', prefix: '' },
    { label: 'Bonos por urgencia',   val: urgentBonus.toLocaleString(), color: '#FF3B3B', prefix: '+' },
    { label: 'Bonos de perk',      val: perkBonus.toLocaleString(),   color: '#8F5CFF', prefix: '+' },
    { label: 'Bonos de multiplicador', val: comboBonus.toLocaleString(),  color: '#3DDCFF', prefix: '+' },
  ];

  return (
    <div className="overlayIn" style={{ background: '#0B0B10', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="crtOverlay" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />

      <div style={{ padding: '24px 16px 20px', textAlign: 'center', borderBottom: '1px solid #2A2A35', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 100%, ${rankColor}15 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4A4A5A' }}>
          Day {String(dayNumber).padStart(2, '0')} · {formatDate(date)} {endedAt ? `· cerrado ${formatTime(endedAt)}` : ''}
        </div>
        <div style={{
          fontFamily: "'Bebas Neue'", fontSize: 96, letterSpacing: '0.04em', lineHeight: 1,
          color: rankColor, textShadow: `0 0 40px ${rankColor}60`,
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'scale(1)' : 'scale(0.6)',
          transition: 'all 500ms cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          {rank?.rank}
        </div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: rankColor, letterSpacing: '0.06em', opacity: revealed ? 1 : 0, transition: 'opacity 400ms 200ms' }}>
          {rank?.label}
        </div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 36, fontWeight: 700, color: '#FFD166', lineHeight: 1, marginTop: 8, opacity: revealed ? 1 : 0, transition: 'opacity 400ms 300ms' }}>
          {totalScore.toLocaleString()}
        </div>
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 10, color: '#4A4A5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
          Puntaje del dia
        </div>
      </div>

      <div style={{ display: 'flex', padding: '12px 16px', borderBottom: '1px solid #2A2A35' }}>
        {[
          { val: cleared,                                label: 'Limpias',  color: '#7CFF6B' },
          { val: survived,                               label: 'Sobrevividas', color: '#FFD166' },
          { val: failed,                                 label: 'Fallidas',   color: '#FF3B3B' },
          { val: rest,                                   label: 'Descanso',     color: '#3DDCFF' },
          { val: `×${(peakMultiplier || 0).toFixed(2)}`, label: 'Peak',     color: '#8F5CFF' },
        ].map((s, i) => (
          <div key={s.label} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            {i > 0 && <div style={{ width: 1, background: '#2A2A35', alignSelf: 'stretch' }} />}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 16, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A5A', marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', marginBottom: 10 }}>
          Desglose del puntaje
        </div>
        {breakdownRows.map((row) => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1E1E2A' }}>
            <span style={{ fontFamily: "'Space Grotesk'", fontSize: 12, color: '#8A8A9A' }}>{row.label}</span>
            <span style={{ fontFamily: "'Space Mono'", fontSize: 13, fontWeight: 700, color: row.color }}>{row.prefix}{row.val}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 0', marginTop: 2 }}>
          <span style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: '#F0EDE8', letterSpacing: '0.04em' }}>Total</span>
          <span style={{ fontFamily: "'Space Mono'", fontSize: 22, fontWeight: 700, color: '#FFD166', textShadow: '0 0 12px #FFD16660' }}>{totalScore.toLocaleString()}</span>
        </div>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', marginBottom: 8 }}>
          Horas · {hours.length}
        </div>
        {hours.length === 0 && (
          <div style={{ fontFamily: "'Space Grotesk'", fontSize: 11, color: '#4A4A5A', fontStyle: 'italic', padding: '6px 0' }}>
            Sin horas registradas.
          </div>
        )}
        {hours.map((h, i) => {
          const hRankCode = typeof h.rank === 'object' ? h.rank?.rank : h.rank;
          const hRankColor = RANK_COLORS[hRankCode] || '#8A8A9A';
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: '#13131C', borderRadius: 4, border: '1px solid #1E1E2A', marginBottom: 5 }}>
              <span style={{ fontFamily: "'Bebas Neue'", fontSize: 14, color: '#F0EDE8', letterSpacing: '0.04em', width: 44, flexShrink: 0 }}>{h.hour}</span>
              <span style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: h.rest ? '#3DDCFF' : h.missed ? '#4A4A5A' : '#8A8A9A', flex: 1 }}>
                {h.rest ? 'Descanso' : h.missed ? 'Perdida' : `${h.completed?.length || 0} hechas${h.failed?.length ? ` · ${h.failed.length} fallidas` : ''}`}
                {h.live ? ' · live' : ''}
              </span>
              {hRankCode && !h.rest && !h.missed && (
                <span style={{ fontFamily: "'Bebas Neue'", fontSize: 14, color: hRankColor, textShadow: `0 0 6px ${hRankColor}60`, width: 28, textAlign: 'center', flexShrink: 0 }}>{hRankCode}</span>
              )}
              <span style={{ fontFamily: "'Space Mono'", fontSize: 12, fontWeight: 700, color: h.score > 0 ? '#FFD166' : '#4A4A5A', flexShrink: 0, textAlign: 'right', minWidth: 56 }}>
                {h.score > 0 ? h.score.toLocaleString() : '—'}
              </span>
            </div>
          );
        })}
      </div>

      {topCategories.length > 0 && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', marginBottom: 8 }}>
            Categorias principales
          </div>
          {topCategories.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1E1E2A' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 100, background: c.color, boxShadow: `0 0 6px ${c.color}60` }} />
                <span style={{ fontFamily: "'Space Grotesk'", fontSize: 11, color: '#8A8A9A' }}>{c.label}</span>
              </span>
              <span style={{ fontFamily: "'Space Mono'", fontSize: 12, fontWeight: 700, color: '#FFD166' }}>+{c.pts.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8, color: '#4A4A5A', fontFamily: "'Space Grotesk'", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', justifyContent: 'space-between' }}>
        <span>Tareas hechas · <span style={{ color: '#7CFF6B' }}>{completedTasks}</span></span>
        <span>Fallidas · <span style={{ color: '#FF3B3B' }}>{failedTasks}</span></span>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
        <button
          className="arcadePressable"
          onClick={onClose}
          style={{ width: '100%', padding: '14px', background: '#1C1C2A', border: '1px solid #2A2A35', borderRadius: 6, color: '#F0EDE8', fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: '0.06em', cursor: 'pointer', boxShadow: '2px 2px 0px #000' }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
