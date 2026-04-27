import { useState } from 'react';
import { RARITY_STYLES } from '../data/constants';
import PerkIcon from './PerkIcon';

export default function PerkCard({ perk, onClick, selected, large = false }) {
  const r = RARITY_STYLES[perk.rarity] || RARITY_STYLES.common;
  const [hovered, setHovered] = useState(false);
  const effectLabel = typeof perk.effect === 'string' ? perk.effect : perk.effect?.label;
  const description = perk.description || perk.desc;

  const glowDimmed = r.glow === 'none'
    ? 'none'
    : r.glow.replace(/[\d.]+\)$/, m => (parseFloat(m) * 0.6).toFixed(2) + ')');

  return (
    <div
      style={{
        background: r.bg || '#13131C',
        border: `${large ? 2 : 1}px solid ${r.border}`,
        borderRadius: 6,
        padding: large ? '20px 16px 16px' : '12px 10px 10px',
        display: 'flex', flexDirection: 'column', gap: large ? 10 : 6,
        boxShadow: hovered
          ? `3px 3px 0px #000, ${r.glow}`
          : `2px 2px 0px #000, ${glowDimmed}`,
        cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
        transform: hovered ? 'translateY(-3px) scale(1.02)' : selected ? 'scale(0.97)' : 'none',
        transition: 'all 150ms cubic-bezier(0.22,1,0.36,1)',
        outline: selected ? `2px solid ${r.color}` : 'none',
        outlineOffset: 2,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick && onClick(perk.id)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: large ? 40 : 28, height: large ? 40 : 28,
          borderRadius: 4,
          background: r.bg, border: `1px solid ${r.border}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: large ? 20 : 14, color: r.color,
          fontFamily: "'Space Mono', monospace", fontWeight: 700,
          boxShadow: `inset 0 0 12px ${r.color}18`,
        }}>
          <PerkIcon perk={perk} size={large ? 26 : 18} strokeWidth={large ? 1.7 : 1.9} />
        </div>
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 8, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: '2px 6px', borderRadius: 2,
          background: r.bg, color: r.color, border: `1px solid ${r.border}40`,
        }}>
          {perk.rarity}
        </div>
      </div>

      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: large ? 22 : 16, letterSpacing: '0.04em', textTransform: 'uppercase',
        color: r.gradient ? undefined : r.color,
        background: r.gradient ? 'linear-gradient(90deg,#FF3B3B,#8F5CFF)' : undefined,
        WebkitBackgroundClip: r.gradient ? 'text' : undefined,
        WebkitTextFillColor: r.gradient ? 'transparent' : undefined,
        lineHeight: 1,
      }}>
        {perk.name}
      </div>

      <div style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: large ? 11 : 9, color: '#8A8A9A', lineHeight: 1.4, flex: 1,
      }}>
        {description}
      </div>

      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: large ? 11 : 9, fontWeight: 700,
        padding: '4px 8px', borderRadius: 3, textAlign: 'center',
        background: r.bg, color: r.color,
        border: `1px solid ${r.border}30`,
      }}>
        {effectLabel}
      </div>

      {(perk.trigger || perk.tags?.length > 0) && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {perk.trigger && (
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: r.color, background: r.bg, border: `1px solid ${r.border}30`,
              borderRadius: 2, padding: '2px 6px',
            }}>
              {perk.trigger}
            </span>
          )}
          {(perk.tags || []).slice(0, large ? 3 : 2).map(tag => (
            <span key={tag} style={{
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: '#4A4A5A', background: '#1C1C2A', border: '1px solid #2A2A35',
              borderRadius: 2, padding: '2px 6px',
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {perk.recommendation && (
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 9, fontWeight: 700, color: '#FFD166',
          lineHeight: 1.3,
        }}>
          {perk.recommendation}
        </div>
      )}
    </div>
  );
}
