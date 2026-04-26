import { useState } from 'react';
import PerkCard from '../components/PerkCard';
import { PERK_POOL } from '../data/constants';

function pickThree() {
  const shuffled = [...PERK_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export default function PerkSelection({ onSelect, roundScore, roundRank }) {
  const [selected,  setSelected]  = useState(null);
  const [choices]                  = useState(() => pickThree());

  const selPerk = choices.find(p => p.id === selected);

  return (
    <div style={{ background: '#0B0B10', minHeight: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />

      {/* Header */}
      <div style={{ padding: '20px 16px 0', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4A4A5A' }}>
          Round 03 Complete · Choose your reward
        </div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 44, color: '#F0EDE8', letterSpacing: '0.04em', lineHeight: 1, marginTop: 4 }}>
          Select a Perk
        </div>
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 12, color: '#8A8A9A', marginTop: 6, lineHeight: 1.4 }}>
          One perk. One deal. Choose carefully — or recklessly.
        </div>
      </div>

      {/* Round summary bar */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, margin: '16px 0 24px', padding: '12px 16px', borderTop: '1px solid #2A2A35', borderBottom: '1px solid #2A2A35' }}>
        {[
          { val: (roundScore || 4820).toLocaleString(), label: 'Score',     color: '#FFD166' },
          { val: roundRank || 'A',                       label: 'Rank',      color: '#8F5CFF' },
          { val: '×2.75',                                label: 'Peak Mult', color: '#3DDCFF' },
        ].map((s, i, arr) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 20, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A5A', marginTop: 2 }}>{s.label}</div>
            </div>
            {i < arr.length - 1 && <div style={{ width: 1, height: 32, background: '#2A2A35' }} />}
          </div>
        ))}
      </div>

      {/* Perk cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px', flex: 1 }}>
        {choices.map(perk => (
          <PerkCard
            key={perk.id}
            perk={perk}
            large={true}
            selected={selected === perk.id}
            onClick={id => setSelected(prev => prev === id ? null : id)}
          />
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '20px 16px 32px' }}>
        <button
          style={{
            width: '100%', padding: '14px',
            background: selected ? '#FFD166' : '#1C1C2A',
            border: `1px solid ${selected ? '#FFD166' : '#2A2A35'}`,
            borderRadius: 6,
            color: selected ? '#0B0B10' : '#4A4A5A',
            fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: '0.06em',
            cursor: selected ? 'pointer' : 'default',
            boxShadow: selected ? '3px 3px 0px #000, 0 0 16px #FFD16650' : '2px 2px 0px #000',
            transition: 'all 200ms cubic-bezier(0.22,1,0.36,1)',
          }}
          onClick={() => selected && onSelect && onSelect(selPerk)}
        >
          {selected ? `Claim ${selPerk.name} →` : 'Select a perk to continue'}
        </button>
        <button
          style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', color: '#4A4A5A', fontFamily: "'Space Grotesk'", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', marginTop: 8 }}
          onClick={() => onSelect && onSelect(null)}
        >
          Skip · No deal this round
        </button>
      </div>
    </div>
  );
}
