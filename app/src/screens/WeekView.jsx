const RANK_COLORS = {
  F: '#4A4A5A',
  D: '#8A8A9A',
  C: '#FFD166',
  B: '#FF3B3B',
  A: '#3DDCFF',
  S: '#8F5CFF',
  SS: '#FFD166',
  SSS: '#FF3B3B',
};

const RANK_ORDER = ['F', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];

function isoDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(iso, offset) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + offset);
  return isoDate(d);
}

function formatDayName(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

function formatShortDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function rankCode(rank) {
  return typeof rank === 'object' ? rank?.rank : rank;
}

function betterRank(a, b) {
  const aCode = rankCode(a);
  const bCode = rankCode(b);
  if (!aCode) return bCode;
  if (!bCode) return aCode;
  return RANK_ORDER.indexOf(bCode) > RANK_ORDER.indexOf(aCode) ? bCode : aCode;
}

function topCategories(day, categories) {
  const names = new Map(categories.map(c => [c.id, c.label]));
  return Object.entries(day?.byCategory || {})
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([id, score]) => ({ label: names.get(id) || id, score }));
}

function buildWeekDays(historyDays, currentDaySummary) {
  const today = currentDaySummary?.date || isoDate(new Date());
  const byDate = new Map((historyDays || []).map(day => [day.date, day]));
  if (currentDaySummary?.date) byDate.set(currentDaySummary.date, currentDaySummary);

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index - 6);
    return { date, day: byDate.get(date) || null, today: date === today };
  });
}

export default function WeekView({ historyDays = [], currentDaySummary = null, categories = [] }) {
  const weekDays = buildWeekDays(historyDays, currentDaySummary);
  const activeDays = weekDays.filter(item => item.day?.startedAt);
  const totalScore = activeDays.reduce((sum, item) => sum + (item.day.totalScore || 0), 0);
  const completedTasks = activeDays.reduce((sum, item) => sum + (item.day.completedTasks || 0), 0);
  const bestRank = activeDays.reduce((best, item) => betterRank(best, item.day.rank), null);
  const bestRankColor = RANK_COLORS[bestRank] || '#4A4A5A';

  return (
    <div style={{ background: 'rgba(11,11,16,0.70)', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="crtOverlay" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />

      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #2A2A35' }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: '#F0EDE8', letterSpacing: '0.04em' }}>
          Semana
        </div>
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 10, color: '#4A4A5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
          {formatShortDate(weekDays[0].date)} - {formatShortDate(weekDays[6].date)} - ultimos 7 dias
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, padding: '12px 16px', borderBottom: '1px solid #2A2A35' }}>
        {[
          { val: totalScore.toLocaleString(), label: 'Score', color: '#FFD166' },
          { val: completedTasks, label: 'Tareas', color: '#7CFF6B' },
          { val: activeDays.length, label: 'Active', color: '#3DDCFF' },
          { val: bestRank || '-', label: 'Best', color: bestRankColor },
        ].map((s, i) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
            {i > 0 && <div style={{ width: 1, background: '#2A2A35', alignSelf: 'stretch' }} />}
            <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 17, fontWeight: 700, color: s.color, lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.val}</div>
              <div style={{ fontFamily: "'Space Grotesk'", fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A5A', marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {weekDays.map(({ date, day, today }, index) => {
          const isActive = !!day?.startedAt;
          const rank = rankCode(day?.rank);
          const rankColor = RANK_COLORS[rank] || '#4A4A5A';
          const categoriesForDay = topCategories(day, categories);
          const statusColor = !isActive ? '#4A4A5A' : today && !day.endedAt ? '#3DDCFF' : '#7CFF6B';
          const statusLabel = !isActive ? 'Off' : today && !day.endedAt ? 'En vivo' : 'Cerrado';

          return (
            <div
              key={date}
              className="arcadeEnter"
              style={{
                '--arcade-delay': `${Math.min(index * 38, 260)}ms`,
                background: isActive ? '#13131CCC' : '#0F0F16AA',
                border: `1px solid ${today ? '#3DDCFF70' : '#2A2A35'}`,
                borderRadius: 6,
                padding: '11px 12px',
                boxShadow: '2px 2px 0px #000',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 44, flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, color: today ? '#3DDCFF' : '#F0EDE8', letterSpacing: '0.04em', lineHeight: 1 }}>
                    {formatDayName(date)}
                  </div>
                  <div style={{ fontFamily: "'Space Grotesk'", fontSize: 8, color: '#4A4A5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 }}>
                    {formatShortDate(date)}
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: statusColor }}>
                      {statusLabel}
                    </span>
                    <span style={{ fontFamily: "'Space Mono'", fontSize: 12, fontWeight: 700, color: isActive ? '#FFD166' : '#4A4A5A' }}>
                      {isActive ? day.totalScore.toLocaleString() : '-'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 4 }}>
                    <span style={{ fontFamily: "'Space Grotesk'", fontSize: 9, color: '#7CFF6B' }}>{day?.completedTasks || 0} hechas</span>
                    <span style={{ fontFamily: "'Space Grotesk'", fontSize: 9, color: '#FF3B3B80' }}>{day?.failedTasks || 0} fallidas</span>
                    <span style={{ fontFamily: "'Space Grotesk'", fontSize: 9, color: '#3DDCFF' }}>{day?.rest || 0} descanso</span>
                    <span style={{ fontFamily: "'Space Grotesk'", fontSize: 9, color: '#4A4A5A' }}>{day?.hours?.length || 0} rondas</span>
                  </div>

                  {categoriesForDay.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                      {categoriesForDay.map(cat => (
                        <span key={cat.label} style={{
                          fontFamily: "'Space Grotesk'", fontSize: 8, fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 2,
                          background: '#8F5CFF15', color: '#8F5CFF', border: '1px solid #8F5CFF30',
                        }}>
                          {cat.label} {cat.score.toLocaleString()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 21, color: rankColor, textShadow: rank ? `0 0 8px ${rankColor}60` : 'none', letterSpacing: '0.04em', width: 32, flexShrink: 0, textAlign: 'center' }}>
                  {rank || '-'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
