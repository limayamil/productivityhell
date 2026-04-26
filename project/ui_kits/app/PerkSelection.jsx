// PerkSelection.jsx — Productivity Hell

const PERK_POOL = [
  { id: 1,  name: 'Deep Work Demon',  rarity: 'rare',      icon: '⏱', desc: 'Longer tasks yield greater rewards. The deep burns brighter.', effect: '×1.5 pts on 30+ min tasks',    category: 'All',        type: 'Passive' },
  { id: 2,  name: 'Inbox Exorcist',   rarity: 'common',    icon: '⚙', desc: 'Complete admin tasks for bonus flat points per sacrifice.',   effect: '+50 pts / Admin task',           category: 'Admin',      type: 'Passive' },
  { id: 3,  name: 'Critical Combo',   rarity: 'epic',      icon: '◆', desc: '3 high-priority tasks in one hour. Then the score doubles.',  effect: '×2 final score on trigger',      category: 'High',       type: 'Trigger' },
  { id: 4,  name: 'Hell Multiplier',  rarity: 'legendary', icon: '★', desc: 'Every task completed without breaking your streak adds to the fire.', effect: '+0.25× per streak task', category: 'All',        type: 'Stack' },
  { id: 5,  name: 'Burnout Tax',      rarity: 'cursed',    icon: '✕', desc: 'Triple the points. Half the time. The deal is already made.', effect: '×3 pts · −15 min round',        category: 'All',        type: 'Risk' },
  { id: 6,  name: 'Last Minute Pact', rarity: 'hellborn',  icon: '∞', desc: 'Final 10 min tasks are legendary. Fail, and the contract collects.', effect: '×2 pts · lose 20% on fail', category: 'All',      type: 'High Risk' },
  { id: 7,  name: 'Category Streak',  rarity: 'uncommon',  icon: '▲', desc: 'Same category, consecutive tasks, stacking fire.',           effect: '+0.15× per same-cat task',       category: 'Any',        type: 'Stack' },
  { id: 8,  name: 'Clean Slate',      rarity: 'rare',      icon: '◉', desc: 'Begin fresh. The penalty from last round dissolves.',        effect: 'Remove 1 active penalty',        category: 'Utility',    type: 'Instant' },
];

const PerkSelection = ({ onSelect, roundScore, roundRank }) => {
  const [selected, setSelected] = React.useState(null);
  const [confirmed, setConfirmed] = React.useState(false);
  const [choices] = React.useState(() => {
    const shuffled = [...PERK_POOL].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  });

  const selPerk = choices.find(p => p.id === selected);

  const rarityOrder = { common:0, uncommon:1, rare:2, epic:3, legendary:4, cursed:5, hellborn:6 };
  const rarityColors = { common:'#8A8A9A', uncommon:'#7CFF6B', rare:'#3DDCFF', epic:'#8F5CFF', legendary:'#FFD166', cursed:'#FF3B3B', hellborn:'#FFD166' };

  const ps = {
    screen: { background: '#0B0B10', minHeight: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    crt: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' },
    topBar: { padding: '20px 16px 0', textAlign: 'center' },
    eyebrow: { fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4A4A5A' },
    headline: { fontFamily: "'Bebas Neue'", fontSize: 44, color: '#F0EDE8', letterSpacing: '0.04em', lineHeight: 1, marginTop: 4 },
    subline: { fontFamily: "'Space Grotesk'", fontSize: 12, color: '#8A8A9A', marginTop: 6, lineHeight: 1.4 },
    roundSummary: { display: 'flex', justifyContent: 'center', gap: 24, margin: '16px 0 24px', padding: '12px 16px', borderTop: '1px solid #2A2A35', borderBottom: '1px solid #2A2A35' },
    summaryBlock: { textAlign: 'center' },
    summaryVal: (color) => ({ fontFamily: "'Space Mono'", fontSize: 20, fontWeight: 700, color, lineHeight: 1 }),
    summaryLabel: { fontFamily: "'Space Grotesk'", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A5A', marginTop: 2 },
    cards: { display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px', flex: 1 },
    footer: { padding: '20px 16px 32px' },
    confirmBtn: { width: '100%', padding: '14px', background: selected ? '#FFD166' : '#1C1C2A', border: `1px solid ${selected ? '#FFD166' : '#2A2A35'}`, borderRadius: 6, color: selected ? '#0B0B10' : '#4A4A5A', fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: '0.06em', cursor: selected ? 'pointer' : 'default', boxShadow: selected ? '3px 3px 0px #000, 0 0 16px #FFD16650' : '2px 2px 0px #000', transition: 'all 200ms cubic-bezier(0.22,1,0.36,1)' },
    skipBtn: { width: '100%', padding: '10px', background: 'transparent', border: 'none', color: '#4A4A5A', fontFamily: "'Space Grotesk'", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', marginTop: 8 },
  };

  return (
    <div style={ps.screen}>
      <div style={ps.crt}></div>
      <div style={ps.topBar}>
        <div style={ps.eyebrow}>Round 03 Complete · Choose your reward</div>
        <div style={ps.headline}>Select a Perk</div>
        <div style={ps.subline}>One perk. One deal. Choose carefully — or recklessly.</div>
      </div>

      <div style={ps.roundSummary}>
        <div style={ps.summaryBlock}>
          <div style={ps.summaryVal('#FFD166')}>{(roundScore || 4820).toLocaleString()}</div>
          <div style={ps.summaryLabel}>Score</div>
        </div>
        <div style={{ width: 1, background: '#2A2A35' }}></div>
        <div style={ps.summaryBlock}>
          <div style={ps.summaryVal('#8F5CFF')}>{roundRank || 'A'}</div>
          <div style={ps.summaryLabel}>Rank</div>
        </div>
        <div style={{ width: 1, background: '#2A2A35' }}></div>
        <div style={ps.summaryBlock}>
          <div style={ps.summaryVal('#3DDCFF')}>×2.75</div>
          <div style={ps.summaryLabel}>Peak Mult</div>
        </div>
      </div>

      <div style={ps.cards}>
        {choices.map((perk) => (
          <PerkCard
            key={perk.id}
            perk={perk}
            large={true}
            selected={selected === perk.id}
            onClick={(id) => setSelected(prev => prev === id ? null : id)}
          />
        ))}
      </div>

      <div style={ps.footer}>
        <button style={ps.confirmBtn} onClick={() => selected && onSelect && onSelect(selPerk)}>
          {selected ? `Claim ${selPerk.name} →` : 'Select a perk to continue'}
        </button>
        <button style={ps.skipBtn} onClick={() => onSelect && onSelect(null)}>Skip · No deal this round</button>
      </div>
    </div>
  );
};

Object.assign(window, { PerkSelection, PERK_POOL });
