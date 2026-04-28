import { useState, useEffect, useRef } from 'react';
import PerkCard from '../components/PerkCard';

function withAffinityLabels(perks, categories) {
  return perks.map(perk => {
    if (!perk.boundCategory) return perk;
    const label = categories?.find(c => c.id === perk.boundCategory)?.label || perk.boundCategory;
    return { ...perk, recommendation: `Bound: ${label}` };
  });
}

function DeletablePerkCard({ perk, onToggle, onDelete, animationDelay }) {
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (confirming) {
      onDelete(perk.id);
    } else {
      setConfirming(true);
      timerRef.current = setTimeout(() => setConfirming(false), 2500);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <PerkCard perk={perk} large={false} onClick={onToggle} animationDelay={animationDelay} />
      <button
        onClick={handleDeleteClick}
        style={{
          position: 'absolute',
          top: 6,
          left: 6,
          width: 20,
          height: 20,
          borderRadius: 3,
          background: confirming ? '#FF3B3B' : '#1C1C2A',
          border: `1px solid ${confirming ? '#FF3B3B' : '#3A3A4A'}`,
          color: confirming ? '#fff' : '#5A5A6A',
          fontSize: 10,
          fontFamily: "'Space Mono', monospace",
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          transition: 'all 150ms',
          zIndex: 10,
          boxShadow: confirming ? '0 0 8px #FF3B3B60' : 'none',
        }}
        title={confirming ? 'Confirmar borrado' : 'Borrar perk'}
      >
        {confirming ? '!' : '×'}
      </button>
    </div>
  );
}

export default function PerksLibrary({ perks = [], dailyPerk, categories = [], roundNumber = 1, peakMultiplier = 1.5, onTogglePerk, onDeletePerk }) {
  const active   = perks.filter(p => p.active);
  const inactive = perks.filter(p => !p.active);
  const todayPerk = dailyPerk ? { ...dailyPerk, daily: true, recommendation: 'Daily pact - always active today' } : null;

  return (
    <div style={{ background: 'rgba(11,11,16,0.70)', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #2A2A35' }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: '#F0EDE8', letterSpacing: '0.04em' }}>Perk Loadout</div>
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 10, color: '#4A4A5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
          Active perks · Round {String(roundNumber).padStart(2, '0')}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0, padding: '10px 16px', borderBottom: '1px solid #2A2A35' }}>
        {[
          { val: perks.length,                       label: 'Owned',  color: '#8F5CFF' },
          { val: active.length + (todayPerk ? 1 : 0), label: 'Active', color: '#7CFF6B' },
          { val: `×${peakMultiplier.toFixed(2)}`,    label: 'Mult',   color: '#FFD166' },
        ].map((s, i) => (
          <div key={s.label} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            {i > 0 && <div style={{ width: 1, background: '#2A2A35', alignSelf: 'stretch' }} />}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 18, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A5A', marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {todayPerk && (
        <>
          <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#3DDCFF', padding: '12px 16px 8px' }}>
            Today's Pact
          </div>
          <div style={{ padding: '0 16px' }}>
            <PerkCard perk={todayPerk} large={false} animationDelay={80} />
          </div>
        </>
      )}

      {perks.length === 0 ? (
        <div style={{ padding: '32px 16px', textAlign: 'center', color: '#4A4A5A', fontFamily: "'Space Grotesk'", fontSize: 12, fontStyle: 'italic' }}>
          No perks earned yet · finish a round to claim one
        </div>
      ) : (
        <>
          <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', padding: '12px 16px 8px' }}>
            Active · {active.length} perks
          </div>
          <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {withAffinityLabels(active, categories).map((p, index) => (
              <DeletablePerkCard
                key={p.id}
                perk={p}
                onToggle={() => onTogglePerk && onTogglePerk(p.id)}
                onDelete={(id) => onDeletePerk && onDeletePerk(id)}
                animationDelay={120 + index * 55}
              />
            ))}
          </div>

          {inactive.length > 0 && (
            <>
              <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', padding: '12px 16px 8px' }}>
                Inactive
              </div>
              <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {withAffinityLabels(inactive, categories).map((p, index) => (
                  <DeletablePerkCard
                    key={p.id}
                    perk={p}
                    onToggle={() => onTogglePerk && onTogglePerk(p.id)}
                    onDelete={(id) => onDeletePerk && onDeletePerk(id)}
                    animationDelay={160 + index * 55}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <div style={{ fontFamily: "'Space Grotesk'", fontSize: 10, color: '#4A4A5A', padding: '8px 16px 12px', fontStyle: 'italic' }}>
        Earn new perks by completing rounds. Choose 1 of 3 after each hour.
      </div>
    </div>
  );
}
