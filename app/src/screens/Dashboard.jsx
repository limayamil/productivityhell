import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import TaskCard from '../components/TaskCard';
import PerkIcon from '../components/PerkIcon';
import PerkCard from '../components/PerkCard';
import BonusRevealSequence from '../components/BonusRevealSequence';
import { CAT_COLORS, PRIORITY_COLORS, RARITY_STYLES, TARGET_SCORE } from '../data/constants';
import { playScoreSound } from '../utils/scoreSound';
import introHellGate from '../assets/intro-hell-gate-transparent.png';

const STATUS_MAP = {
  safe:  { label: 'Seguro',         color: '#7CFF6B', bg: '#7CFF6B15', border: '#7CFF6B40' },
  risky: { label: 'Riesgo',        color: '#FFD166', bg: '#FFD16615', border: '#FFD16640' },
  rest:  { label: 'Descanso',     color: '#3DDCFF', bg: '#3DDCFF15', border: '#3DDCFF50' },
  hell:  { label: '⚡ Hell Mode', color: '#FF3B3B', bg: '#FF3B3B20', border: '#FF3B3B50' },
  off:   { label: 'Fuera de horario',    color: '#3DDCFF', bg: '#3DDCFF12', border: '#3DDCFF40' },
};

const RARITY_COLORS = {
  daily: '#3DDCFF',
  common: '#8A8A9A', uncommon: '#7CFF6B', rare: '#3DDCFF',
  epic: '#8F5CFF', legendary: '#FFD166', cursed: '#FF3B3B', hellborn: '#FFD166',
};

function countScoreModifiers(breakdown) {
  const perkCount = (breakdown?.triggeredPerks || []).filter(p => p.bonus > 0).length;
  const urgentCount = (breakdown?.urgentBonus || 0) > 0 ? 1 : 0;
  const multiplierCount = (breakdown?.multiplierBonus || 0) > 0 ? 1 : 0;
  return perkCount + urgentCount + multiplierCount;
}

function computeTimeLeft(round) {
  return Math.max(0, round.startedAt + round.durationMs - Date.now());
}

function roundTimeLabel(startedAt, number) {
  const d = new Date(startedAt);
  const hh = String(d.getHours()).padStart(2, '0');
  const next = new Date(startedAt + 60 * 60 * 1000);
  const nh = String(next.getHours()).padStart(2, '0');
  return `Ronda ${String(number).padStart(2, '0')} · ${hh}:00-${nh}:00`;
}

function hourRangeLabel(startedAt) {
  const d = new Date(startedAt);
  const hh = String(d.getHours()).padStart(2, '0');
  const next = new Date(startedAt + 60 * 60 * 1000);
  const nh = String(next.getHours()).padStart(2, '0');
  return `${hh}:00-${nh}:00`;
}

function roundNumberFxClass(number) {
  const capped = Math.min(Number(number) || 1, 10);
  if (capped >= 8) return 'roundNumberInferno';
  if (capped >= 6) return 'roundNumberHeat';
  if (capped >= 4) return 'roundNumberEmber';
  return undefined;
}

const APP_TITLE = 'Productivity Hell';
const TITLE_GRADIENT_TEXT_STYLE = {
  background: 'linear-gradient(110deg, #FF3B3B, #FFD166, #FF3B3B)',
  backgroundSize: '240% 100%',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
  animation: 'animatedTextGradient 2.8s ease-in-out infinite',
  textShadow: '0 0 8px #FF3B3B40',
};

export default function Dashboard({ round, perks, dailyPerk, categories, inboxTasks = [], onCompleteTask, onTakeInboxTask, dayPhase = 'active', dayNumber = 1, onStartDay }) {
  const [, setTick] = useState(0);
  const [floaters, setFloaters] = useState([]);
  const [hoveredPerk, setHoveredPerk] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [reveal, setReveal] = useState(null);
  const [inboxOpen, setInboxOpen] = useState(() => inboxTasks.length > 0);

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const timeLeft = Math.floor(computeTimeLeft(round) / 1000);
  const score = round.score;
  const multiplier = round.multiplier;
  const streak = round.streak;
  const tasks = round.tasks;
  const isRest = !!round.rest;
  const inboxExpanded = inboxOpen && inboxTasks.length > 0;
  const activePerks = [
    ...(dailyPerk ? [{ ...dailyPerk, active: true, daily: true }] : []),
    ...perks.filter(p => p.active),
  ];

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const progress = Math.min(score / TARGET_SCORE, 1);

  const isClosed = dayPhase === 'closed';
  const canTakeInbox = dayPhase === 'active';
  const roundStatus =
    isClosed ? 'off'
    : isRest ? 'rest'
    : score >= TARGET_SCORE ? 'safe'
    : timeLeft < 10 * 60 ? 'hell'
    : score / TARGET_SCORE > 0.5 ? 'safe'
    : 'risky';
  const st = STATUS_MAP[roundStatus];

  const triggerHudFeedback = (taskId, multUp) => {
    const fid = Date.now() + Math.random();
    setFeedback({ id: fid, taskId, multUp });
    setTimeout(() => setFeedback(current => current?.id === fid ? null : current), 620);
  };

  const buildBeats = (breakdown, earned) => {
    const beats = [];
    const subtotal = (breakdown.baseEarned || 0) + (breakdown.urgentBonus || 0) + (breakdown.perkBonus || 0);
    beats.push({
      kind: 'base',
      text: `+${breakdown.baseEarned}`,
      label: 'BASE',
      color: '#F0EDE8',
      size: 22,
    });
    for (const perk of breakdown.triggeredPerks || []) {
      if (!perk.bonus || perk.bonus <= 0) continue;
      beats.push({
        kind: 'perk',
        text: `+${perk.bonus}`,
        label: perk.name,
        color: RARITY_COLORS[perk.rarity] || '#FFD166',
        size: 24,
      });
    }
    if (breakdown.urgentBonus > 0) {
      beats.push({
        kind: 'urgent',
        text: `+${breakdown.urgentBonus}`,
        label: 'URGENT',
        color: '#FF3B3B',
        size: 24,
      });
    }
    if (breakdown.multiplierBonus > 0 && subtotal > 0) {
      const appliedMult = (earned / subtotal);
      beats.push({
        kind: 'mult',
        text: `×${appliedMult.toFixed(2)}`,
        label: `+${breakdown.multiplierBonus}`,
        color: '#8F5CFF',
        size: 26,
      });
    }
    const finalSize = 30 + Math.min(beats.length, 7) * 4;
    const finalSound = countScoreModifiers(breakdown) >= 3 ? 'victory' : 'win';
    beats.push({
      kind: 'final',
      text: `+${earned}`,
      label: 'TOTAL',
      color: '#FFD166',
      size: finalSize,
      sound: finalSound,
    });
    return beats;
  };

  const handleComplete = (id, rect) => {
    const multiplierWasCapped = multiplier >= 5;
    const result = onCompleteTask(id);
    const earned = result?.earned || 0;
    if (!earned) return;
    const breakdown = result?.breakdown;
    const triggeredCount = (breakdown?.triggeredPerks || []).filter(p => p.bonus > 0).length;
    const hasBonus = breakdown && (triggeredCount > 0 || (breakdown.urgentBonus || 0) > 0);

    if (hasBonus && rect) {
      const beats = buildBeats(breakdown, earned);
      const anchor = { top: rect.top, left: rect.left, width: rect.width };
      setReveal({ taskId: id, anchor, beats, multUp: !multiplierWasCapped });
      return;
    }

    const fid = Date.now() + Math.random();
    playScoreSound(0);
    setFeedback({ id: fid, taskId: id, multUp: !multiplierWasCapped });
    setFloaters(f => [...f, { id: fid, text: `+${earned}`, x: Math.random() * 60 + 20, multUp: !multiplierWasCapped }]);
    setTimeout(() => setFloaters(f => f.filter(fl => fl.id !== fid)), 1050);
    setTimeout(() => setFeedback(current => current?.id === fid ? null : current), 620);
  };

  const handleRevealEnd = () => {
    if (!reveal) return;
    triggerHudFeedback(reveal.taskId, reveal.multUp);
    setReveal(null);
  };

  const perkWithAffinityLabel = (perk) => {
    if (!perk.boundCategory) return perk;
    const label = categories?.find(c => c.id === perk.boundCategory)?.label || perk.boundCategory;
    return { ...perk, recommendation: `Ligado a: ${label}` };
  };

  const showPerkDetails = (perk, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = 176;
    const gap = 8;
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
    const belowTop = rect.bottom + gap;
    const top = belowTop + 190 > window.innerHeight
      ? Math.max(12, rect.top - 190 - gap)
      : belowTop;

    setHoveredPerk({
      perk: perkWithAffinityLabel(perk),
      position: { top, left, width },
    });
  };

  if (dayPhase === 'pending') {
    return (
      <div style={{ background: 'rgba(11,11,16,0.68)', minHeight: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', backdropFilter: 'saturate(1.05)' }}>
        <style>{`
          @keyframes startPulse { from{box-shadow: 3px 3px 0px #000, 0 0 18px #FF3B3B40} to{box-shadow: 3px 3px 0px #000, 0 0 32px #FF3B3B80} }
        `}</style>
        <div className="crtOverlay" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #2A2A35', background: 'linear-gradient(to top, transparent 0%, rgba(255, 59, 59, 0.16) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/favicon.png" alt="" aria-hidden="true" style={{ width: 48, height: 48, flex: '0 0 48px', objectFit: 'contain', filter: 'drop-shadow(0 0 8px #FF3B3B55) drop-shadow(0 0 5px #3DDCFF33)' }} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', whiteSpace: 'nowrap', ...TITLE_GRADIENT_TEXT_STYLE }}>
                {APP_TITLE}
              </div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: '#F0EDE8', letterSpacing: '0.04em', lineHeight: 1, marginTop: 4 }}>
                Dia {String(dayNumber).padStart(2, '0')} · en espera
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '22px 24px 30px', gap: 14 }}>
          <div style={{ fontFamily: "'Space Grotesk'", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#4A4A5A', textAlign: 'center' }}>
            Día sin iniciar
          </div>
          <div style={{
            width: 236,
            maxWidth: '82%',
            height: 252,
            position: 'relative',
            filter: 'drop-shadow(0 0 18px #FF3B3B40) drop-shadow(0 0 10px #3DDCFF22)',
          }}>
            <img
              src={introHellGate}
              alt="Portal pixel art hacia el infierno productivo"
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                objectFit: 'contain',
                imageRendering: 'pixelated',
              }}
            />
          </div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: '#F0EDE8', letterSpacing: '0.04em', textAlign: 'center', lineHeight: 1.1 }}>
            ¿Listo para entrar al infierno?
          </div>
          <button
            className="arcadePressable"
            onClick={onStartDay}
            style={{
              marginTop: 12,
              padding: '18px 56px',
              background: '#FF3B3B',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontFamily: "'Bebas Neue'",
              fontSize: 32,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              boxShadow: '3px 3px 0px #000, 0 0 18px #FF3B3B40',
              animation: 'startPulse 1.6s ease-in-out infinite alternate',
            }}
          >
            INICIO
          </button>
          <div style={{ fontFamily: "'Space Grotesk'", fontSize: 10, color: '#4A4A5A', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em', maxWidth: 260 }}>
            La ronda 01 quedará anclada a la hora actual.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'rgba(11,11,16,0.68)', minHeight: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', backdropFilter: 'saturate(1.05)' }}>
      <style>{`
        @keyframes hellpulse { from{box-shadow:0 0 6px #FF3B3B30} to{box-shadow:0 0 14px #FF3B3B80} }
        @keyframes activePerkGlowPulse {
          0%, 100% { opacity: 0.35; transform: scale(0.82); filter: blur(5px); }
          50% { opacity: 0.95; transform: scale(1.18); filter: blur(8px); }
        }
        @keyframes inboxCollapsedGlow {
          0%, 100% { box-shadow: 2px 2px 0 #000, inset 0 0 0 1px #3DDCFF10, 0 0 7px #3DDCFF18; border-color: #3DDCFF35; }
          50% { box-shadow: 2px 2px 0 #000, inset 0 0 0 1px #3DDCFF22, 0 0 16px #3DDCFF35; border-color: #3DDCFF55; }
        }
      `}</style>

      <div className="crtOverlay" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />

      {reveal && (
        <BonusRevealSequence
          anchor={reveal.anchor}
          beats={reveal.beats}
          onBeat={(index, beat) => playScoreSound(index, beat.sound)}
          onEnd={handleRevealEnd}
        />
      )}

      {floaters.map(fl => (
        <div key={fl.id} style={{
          position: 'fixed', top: '30%', left: `${fl.x}%`,
          fontFamily: "'Bebas Neue'", fontSize: 28, color: '#FFD166',
          textShadow: '0 0 12px #FFD16680, 2px 2px 0 #000', pointerEvents: 'none', zIndex: 200,
          animation: 'rewardPop 1.05s cubic-bezier(0.22,1,0.36,1) forwards',
        }}>
          {fl.text}
          {fl.multUp && (
            <span style={{ display: 'block', fontFamily: "'Space Mono'", fontSize: 10, color: '#8F5CFF', textAlign: 'center', marginTop: -2 }}>
              MULT+
            </span>
          )}
        </div>
      ))}

      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #2A2A35', background: 'linear-gradient(to top, transparent 0%, rgba(255, 59, 59, 0.16) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/favicon.png"
            alt=""
            aria-hidden="true"
            style={{
              width: 48,
              height: 48,
              flex: '0 0 48px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 8px #FF3B3B55) drop-shadow(0 0 5px #3DDCFF33)',
            }}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 17, letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap', lineHeight: 1, ...TITLE_GRADIENT_TEXT_STYLE }}>
              {APP_TITLE}
            </div>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 11, color: '#6A6A7A', letterSpacing: '0.03em', lineHeight: 1, marginTop: 6 }}>
              {hourRangeLabel(round.startedAt)}
            </div>
          </div>
          <div
            aria-label={roundTimeLabel(round.startedAt, round.number)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto', marginLeft: 'auto', whiteSpace: 'nowrap' }}
          >
            <span style={{ fontFamily: "'Bebas Neue'", fontSize: 18, color: '#F0EDE8', letterSpacing: '0.08em', lineHeight: 1, textTransform: 'uppercase' }}>
              Round
            </span>
            <span
              className={isClosed ? undefined : roundNumberFxClass(round.number)}
              style={{
                display: 'inline-block',
                position: 'relative',
                fontFamily: "'Bebas Neue'",
                fontSize: 34,
                color: '#F0EDE8',
                letterSpacing: '0.02em',
                lineHeight: 0.88,
                minWidth: 34,
                textAlign: 'center',
                transformOrigin: 'center',
              }}
            >
              {String(round.number).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className={roundStatus === 'hell' ? 'hellShake' : undefined} style={{
            fontFamily: "'Space Mono'", fontSize: 40, fontWeight: 700, color: st.color, lineHeight: 1,
            textShadow: roundStatus === 'hell' ? `0 0 16px ${st.color}80` : 'none',
            transition: 'color 0.5s, text-shadow 0.5s',
          }}>
            {mins}:{secs}
          </div>
          <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A5A', marginTop: 2 }}>
            hasta la siguiente hora
          </div>
        </div>
        <div style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div key={`score-${feedback?.id || 'idle'}`} className={feedback ? 'hudPop' : undefined} style={{ fontFamily: "'Space Mono'", fontSize: 20, fontWeight: 700, color: '#FFD166', lineHeight: 1, transformOrigin: 'right center' }}>
              {score.toLocaleString()}
            </div>
            <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#FFD166', marginTop: 2 }}>
              Puntos
            </div>
          </div>
          <div style={{ width: 1, background: '#2A2A35', margin: '0 16px' }} />
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div key={`mult-${feedback?.id || 'idle'}`} className={feedback?.multUp ? 'hudPop' : undefined} style={{ fontFamily: "'Space Mono'", fontSize: 20, fontWeight: 700, color: '#8F5CFF', lineHeight: 1, transformOrigin: 'right center' }}>
              ×{multiplier.toFixed(2)}
            </div>
            <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8F5CFF', marginTop: 2 }}>
              Mult
            </div>
          </div>
          <div style={{ width: 1, background: '#2A2A35', margin: '0 12px' }} />
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 20, fontWeight: 700, color: '#3DDCFF', lineHeight: 1 }}>
              {streak}
            </div>
            <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#3DDCFF', marginTop: 2 }}>
              Racha
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ height: 5, background: '#2A2A35', borderRadius: 2, overflow: 'hidden' }}>
          <div key={`progress-${feedback?.id || 'idle'}`} className={feedback ? 'progressSurge' : undefined} style={{
            height: '100%', borderRadius: 2, background: st.color,
            boxShadow: `0 0 6px ${st.color}80`,
            width: `${progress * 100}%`,
            transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontFamily: "'Space Mono'", fontSize: 9, color: '#4A4A5A' }}>{score.toLocaleString()} / {TARGET_SCORE.toLocaleString()} pts</span>
          <span style={{ fontFamily: "'Space Mono'", fontSize: 9, color: '#4A4A5A' }}>{Math.round(progress * 100)}%</span>
        </div>
      </div>

      <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {activePerks.length === 0 && (
          <span style={{ fontFamily: "'Space Grotesk'", fontSize: 9, color: '#4A4A5A', fontStyle: 'italic' }}>ninguno</span>
        )}
        {activePerks.map((p, index) => {
          const r = RARITY_STYLES[p.rarity] || RARITY_STYLES.common;
          const c = r.color || RARITY_COLORS[p.rarity] || '#8A8A9A';
          const glowBackground = r.gradient
            ? 'radial-gradient(circle, #FFD16695 0%, #FF3B3B65 34%, #8F5CFF45 58%, transparent 76%)'
            : `radial-gradient(circle, ${c}95 0%, ${c}42 48%, transparent 74%)`;
          return (
            <span
              key={p.id}
              aria-label={p.daily ? `Daily: ${p.name}` : p.name}
              title={p.daily ? `Daily: ${p.name}` : p.name}
              style={{
                width: 36,
                height: 36,
                position: 'relative',
                color: c,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: '0 0 36px',
                background: r.gradient
                  ? 'linear-gradient(135deg, #FF3B3B20, #FFD16614, #8F5CFF22)'
                  : r.bg,
                border: `1px solid ${r.border || c}`,
                borderRadius: 7,
                boxShadow: `inset 0 0 0 1px ${c}24`,
                cursor: 'default',
              }}
              onMouseEnter={(event) => showPerkDetails(p, event)}
              onMouseLeave={() => setHoveredPerk(null)}
              onFocus={(event) => showPerkDetails(p, event)}
              onBlur={() => setHoveredPerk(null)}
              tabIndex={0}
            >
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: -5,
                  borderRadius: 10,
                  background: glowBackground,
                  animation: 'activePerkGlowPulse 2.4s ease-in-out infinite',
                  animationDelay: `${index * 150}ms`,
                  zIndex: 0,
                  pointerEvents: 'none',
                }}
              />
              <span style={{ position: 'relative', zIndex: 1 }}>
                <PerkIcon perk={p} size={32} strokeWidth={2.1} />
              </span>
            </span>
          );
        })}
      </div>

      {hoveredPerk && createPortal(
        <div style={{
          position: 'fixed',
          top: hoveredPerk.position.top,
          left: hoveredPerk.position.left,
          width: hoveredPerk.position.width,
          background: '#111118',
          borderRadius: 6,
          zIndex: 300,
          pointerEvents: 'none',
        }}>
          <PerkCard perk={hoveredPerk.perk} large={false} />
        </div>,
        document.body
      )}

      <div style={{ padding: '0 16px 12px' }}>
        <div style={{
          border: '1px solid #3DDCFF35',
          borderRadius: 7,
          background: '#101018',
          boxShadow: '2px 2px 0 #000, inset 0 0 0 1px #3DDCFF10',
          animation: inboxTasks.length > 0 && !inboxExpanded ? 'inboxCollapsedGlow 2.8s ease-in-out infinite' : 'none',
          overflow: 'hidden',
        }}>
          <button
            type="button"
            aria-expanded={inboxExpanded}
            aria-label={`Bandeja: ${inboxTasks.length} tareas`}
            onClick={() => setInboxOpen(open => inboxTasks.length > 0 ? !open : false)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 10px',
              border: 'none',
              background: 'transparent',
              color: '#3DDCFF',
              cursor: inboxTasks.length > 0 ? 'pointer' : 'default',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <svg aria-hidden="true" viewBox="0 0 24 24" style={{ width: 18, height: 18, display: 'block' }} fill="none">
                <path d="M5 4h14l1.5 10h-5l-1.2 2.5H9.7L8.5 14h-5L5 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M4 14v5h16v-5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: "'Space Mono'", fontSize: 11, color: inboxTasks.length ? '#3DDCFF' : '#4A4A5A' }}>
                {inboxTasks.length}
              </span>
            </span>
            <span style={{
              fontFamily: "'Space Mono'",
              fontSize: 11,
              color: inboxTasks.length ? '#3DDCFF' : '#4A4A5A',
              transform: inboxExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 160ms cubic-bezier(0.22,1,0.36,1)',
            }}>
              &gt;
            </span>
          </button>

          {inboxExpanded && (
            <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {inboxTasks.map((task, index) => {
                const priorityStyle = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
                const catEntry = categories?.find(c => c.id === task.category);
                const catColor = catEntry?.color || CAT_COLORS[task.category?.toLowerCase()] || '#8A8A9A';
                const catLabel = catEntry?.label || task.category;
                return (
                  <div
                    key={task.id}
                    className="arcadeEnter"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 10px',
                      borderRadius: 6,
                      border: '1px solid #2A2A35',
                      background: '#101018',
                      position: 'relative',
                      overflow: 'hidden',
                      '--arcade-delay': `${Math.min(index * 35, 180)}ms`,
                    }}
                  >
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: catColor, opacity: 0.85 }} />
                    <div style={{ flex: 1, minWidth: 0, paddingLeft: 3 }}>
                      <div style={{ fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 700, color: '#F0EDE8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {task.title}
                      </div>
                      <div style={{ display: 'flex', gap: 5, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: "'Space Grotesk'", fontSize: 8, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: catColor, background: catColor + '15', padding: '2px 5px', borderRadius: 2 }}>
                          {catLabel}
                        </span>
                        <span style={{ fontFamily: "'Space Grotesk'", fontSize: 8, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: priorityStyle.color, background: priorityStyle.bg, padding: '2px 5px', borderRadius: 2 }}>
                          {task.priority}
                        </span>
                        <span style={{ fontFamily: "'Space Mono'", fontSize: 9, color: '#4A4A5A' }}>
                          {task.duration} min
                        </span>
                        <span style={{ fontFamily: "'Space Mono'", fontSize: 9, color: priorityStyle.color }}>
                          +{task.points}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={canTakeInbox ? 'arcadePressable' : undefined}
                      disabled={!canTakeInbox}
                      onClick={() => canTakeInbox && onTakeInboxTask && onTakeInboxTask(task.id)}
                      style={{
                        flex: '0 0 auto',
                        padding: '8px 10px',
                        borderRadius: 5,
                        border: `1px solid ${canTakeInbox ? '#3DDCFF70' : '#2A2A35'}`,
                        background: canTakeInbox ? '#3DDCFF18' : '#1C1C2A',
                        color: canTakeInbox ? '#3DDCFF' : '#4A4A5A',
                        fontFamily: "'Space Grotesk'",
                        fontSize: 9,
                        fontWeight: 900,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        cursor: canTakeInbox ? 'pointer' : 'not-allowed',
                      }}
                    >
                      Tomar
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 8px' }}>
        <span style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A' }}>
          Tareas activas · {tasks.filter(t => !t.done).length} restantes
        </span>
        <span style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7CFF6B' }}>
          {tasks.filter(t => t.done).length} hechas
        </span>
      </div>

      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {tasks.length === 0 && (
          <div style={{
            border: `1px dashed ${isRest ? '#3DDCFF50' : '#2A2A35'}`, borderRadius: 6, padding: '24px 16px',
            textAlign: 'center', color: isRest ? '#3DDCFF' : '#4A4A5A',
            fontFamily: "'Space Grotesk'", fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            No hay tareas cargadas · toca + para empezar
          </div>
        )}
        {tasks.map((t, index) => (
          <TaskCard
            key={t.id}
            task={t}
            categories={categories}
            onComplete={handleComplete}
            index={index}
            justCompleted={feedback?.taskId === t.id}
            suppressDone={reveal?.taskId === t.id}
          />
        ))}
      </div>

    </div>
  );
}
