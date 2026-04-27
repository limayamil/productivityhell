import { useState } from 'react';
import PerkCard from '../components/PerkCard';
import { PERK_POOL } from '../data/constants';

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const val = item[key];
    if (val) acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
}

function topKey(counts) {
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

function categoryLabel(categories, id) {
  return categories?.find(c => c.id === id)?.label || id;
}

function buildInsights(summary, categories = []) {
  const completed = summary?.completed || [];
  const failed = summary?.failed || [];
  const dominantCategory = topKey(countBy(completed, 'cat'));
  const strugglingCategory = topKey(countBy(failed, 'cat')) || dominantCategory;
  const priorityCounts = countBy(completed, 'priority');
  const highPriorityCount = (priorityCounts.high || 0) + (priorityCounts.critical || 0);
  const urgentCompleted = completed.filter(t => t.urgent).length;
  const urgentFailed = failed.filter(t => t.urgent).length;
  const durations = completed.map(t => t.duration || 0).filter(Boolean);
  const averageDuration = durations.length
    ? durations.reduce((sum, d) => sum + d, 0) / durations.length
    : 0;
  const suggestedCategory = categories.length
    ? categories[Math.floor(Math.random() * categories.length)]?.id
    : dominantCategory || strugglingCategory;

  return {
    dominantCategory,
    strugglingCategory,
    suggestedCategory,
    highPriorityCount,
    urgentCompleted,
    urgentFailed,
    averageDuration,
    dominantLabel: categoryLabel(categories, dominantCategory),
    strugglingLabel: categoryLabel(categories, strugglingCategory),
    suggestedLabel: categoryLabel(categories, suggestedCategory),
  };
}

function reasonFor(perk, insights) {
  if (perk.categoryAffinity === 'dominant' && insights.dominantCategory) {
    return {
      score: 60,
      boundCategory: insights.dominantCategory,
      recommendation: `Favored: ${insights.dominantLabel} tasks this round`,
    };
  }

  if (perk.categoryAffinity === 'struggling' && insights.strugglingCategory) {
    return {
      score: 58,
      boundCategory: insights.strugglingCategory,
      recommendation: `Recovery: ${insights.strugglingLabel} tasks were left behind`,
    };
  }

  if (perk.categoryAffinity === 'suggested' && insights.suggestedCategory) {
    return {
      score: 52,
      boundCategory: insights.suggestedCategory,
      recommendation: `Marked: ${insights.suggestedLabel} tasks may roll x2`,
    };
  }

  if (perk.effect.kind === 'durationPercent' && insights.averageDuration >= 25) {
    return { score: 46, recommendation: 'Favored: longer tasks this round' };
  }

  if (perk.effect.kind === 'priorityFlat' && insights.highPriorityCount > 0) {
    return { score: 44, recommendation: 'Favored: high-priority work appeared' };
  }

  if (perk.effect.kind === 'urgentRisk' && (insights.urgentCompleted > 0 || insights.urgentFailed > 0)) {
    return { score: 42, recommendation: 'Favored: urgent tasks are in the mix' };
  }

  if (perk.effect.kind === 'lastMinutePercent' && insights.urgentFailed > 0) {
    return { score: 40, recommendation: 'Favored: late tasks need a comeback' };
  }

  return { score: 10 + Math.random() * 8, recommendation: 'Wildcard: opens a new build path' };
}

function pushUnique(list, perk) {
  if (perk && !list.some(p => p.id === perk.id)) list.push(perk);
}

function pickThree(ownedIds, summary, categories) {
  const available = PERK_POOL.filter(p => !ownedIds || !ownedIds.has(p.id));
  const source = available.length >= 3 ? available : PERK_POOL;
  const insights = buildInsights(summary, categories);
  const scored = source
    .map(perk => ({ ...perk, ...reasonFor(perk, insights) }))
    .sort((a, b) => b.score - a.score);

  const choices = [];
  pushUnique(choices, scored.find(p => p.boundCategory));
  pushUnique(choices, scored.find(p => p.categoryAffinity === 'suggested'));

  const firstTag = choices[0]?.tags?.[0];
  pushUnique(choices, scored.find(p => p.tags?.[0] !== firstTag && !p.boundCategory));
  pushUnique(choices, scored.find(p => !choices.some(c => c.id === p.id)));

  while (choices.length < 3) {
    pushUnique(choices, scored[Math.floor(Math.random() * scored.length)]);
  }

  return choices.slice(0, 3);
}

export default function PerkSelection({
  onSelect,
  roundNumber = 1,
  roundScore = 0,
  roundRank = '-',
  peakMultiplier = 1.5,
  ownedPerkIds,
  summary,
  categories,
  mode = 'round',
}) {
  const [selected, setSelected] = useState(null);
  const [choices] = useState(() => pickThree(ownedPerkIds, summary, categories));

  const selPerk = choices.find(p => p.id === selected);

  const isDayStart = mode === 'dayStart';

  return (
    <div className="overlayIn" style={{ background: '#0B0B10', minHeight: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="crtOverlay" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />

      <div className="arcadeEnter" style={{ padding: '20px 16px 0', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4A4A5A' }}>
          {isDayStart ? 'Inicio del día · Bono de arranque' : `Round ${String(roundNumber).padStart(2, '0')} Complete - Choose your reward`}
        </div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 44, color: '#F0EDE8', letterSpacing: '0.04em', lineHeight: 1, marginTop: 4 }}>
          {isDayStart ? 'Elige tu perk inicial' : 'Select a Perk'}
        </div>
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 12, color: '#8A8A9A', marginTop: 6, lineHeight: 1.4 }}>
          {isDayStart
            ? 'Un perk activo durante todo el día. Elige bien.'
            : 'One perk. One deal. The offer bends toward your last round.'}
        </div>
      </div>

      {!isDayStart && (
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, margin: '16px 0 24px', padding: '12px 16px', borderTop: '1px solid #2A2A35', borderBottom: '1px solid #2A2A35' }}>
        {[
          { val: roundScore.toLocaleString(),    label: 'Score',     color: '#FFD166' },
          { val: roundRank,                       label: 'Rank',      color: '#8F5CFF' },
          { val: `x${peakMultiplier.toFixed(2)}`, label: 'Peak Mult', color: '#3DDCFF' },
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
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: isDayStart ? '16px 16px 0' : '0 16px', flex: 1, borderTop: isDayStart ? '1px solid #2A2A35' : 'none', marginTop: isDayStart ? 16 : 0 }}>
        {choices.map((perk, index) => (
          <PerkCard
            key={perk.id}
            perk={perk}
            large={true}
            selected={selected === perk.id}
            onClick={id => setSelected(prev => prev === id ? null : id)}
            animationDelay={120 + index * 90}
          />
        ))}
      </div>

      <div style={{ padding: '20px 16px 32px' }}>
        <button
          className={selected ? 'arcadePressable hudPop' : undefined}
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
          {selected ? `Claim ${selPerk.name} ->` : 'Select a perk to continue'}
        </button>
        <button
          style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', color: '#4A4A5A', fontFamily: "'Space Grotesk'", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', marginTop: 8 }}
          onClick={() => onSelect && onSelect(null)}
        >
          Skip - No deal this round
        </button>
      </div>
    </div>
  );
}
