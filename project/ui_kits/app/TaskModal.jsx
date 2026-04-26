// TaskModal.jsx — Productivity Hell

const CATEGORIES = [
  { id: 'marketing', label: 'Marketing', color: '#FF3B3B' },
  { id: 'dev',       label: 'Dev',       color: '#3DDCFF' },
  { id: 'meetings',  label: 'Meetings',  color: '#FFD166' },
  { id: 'admin',     label: 'Admin',     color: '#8A8A9A' },
  { id: 'creative',  label: 'Creative',  color: '#8F5CFF' },
  { id: 'personal',  label: 'Personal',  color: '#7CFF6B' },
];

const PRIORITIES = [
  { id: 'low',      label: 'Low',      color: '#8A8A9A', pts: 60  },
  { id: 'medium',   label: 'Medium',   color: '#FFD166', pts: 130 },
  { id: 'high',     label: 'High',     color: '#FF3B3B', pts: 260 },
  { id: 'critical', label: 'Critical', color: '#8F5CFF', pts: 480 },
];

const DURATIONS = [10, 20, 30, 45, 60];

const TaskModal = ({ onClose, onAdd }) => {
  const [title, setTitle] = React.useState('');
  const [cat, setCat] = React.useState('dev');
  const [priority, setPriority] = React.useState('medium');
  const [duration, setDuration] = React.useState(30);
  const [urgent, setUrgent] = React.useState(false);

  const selPriority = PRIORITIES.find(p => p.id === priority);
  const basePoints = selPriority.pts + Math.floor(duration * 2.5);

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd && onAdd({ title: title.trim(), category: cat, priority, duration, points: basePoints, done: false, id: Date.now() });
    onClose();
  };

  const ms = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(11,11,16,0.85)', zIndex: 300, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' },
    sheet: { background: '#13131C', borderRadius: '8px 8px 0 0', border: '1px solid #2A2A35', borderBottom: 'none', width: '100%', padding: '0 0 32px', boxShadow: '0 -4px 40px rgba(0,0,0,0.6)' },
    handle: { width: 36, height: 4, background: '#2A2A35', borderRadius: 2, margin: '12px auto 0' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 0' },
    title: { fontFamily: "'Bebas Neue'", fontSize: 24, color: '#F0EDE8', letterSpacing: '0.04em' },
    closeBtn: { width: 28, height: 28, borderRadius: 4, border: '1px solid #2A2A35', background: 'transparent', color: '#8A8A9A', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    body: { padding: '16px 16px 0' },
    label: { fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', marginBottom: 6, display: 'block' },
    input: { width: '100%', background: '#1C1C2A', border: '1px solid #2A2A35', borderRadius: 6, padding: '12px 14px', fontFamily: "'Space Grotesk'", fontSize: 14, color: '#F0EDE8', outline: 'none', boxSizing: 'border-box', marginBottom: 16 },
    chipRow: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 },
    chip: (active, color) => ({
      fontFamily: "'Space Grotesk'", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      padding: '6px 12px', borderRadius: 4, cursor: 'pointer',
      background: active ? color + '25' : '#1C1C2A',
      color: active ? color : '#4A4A5A',
      border: `1px solid ${active ? color + '60' : '#2A2A35'}`,
      boxShadow: active ? `0 0 8px ${color}30` : 'none',
      transition: 'all 120ms cubic-bezier(0.22,1,0.36,1)',
    }),
    ptsBadge: { fontFamily: "'Space Mono'", fontSize: 11, color: selPriority.color, background: selPriority.color + '15', border: `1px solid ${selPriority.color}40`, padding: '4px 10px', borderRadius: 4, marginLeft: 'auto' },
    footer: { padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 },
    addBtn: { width: '100%', padding: '14px', background: '#FF3B3B', border: 'none', borderRadius: 6, color: '#fff', fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: '0.06em', cursor: 'pointer', boxShadow: '3px 3px 0px #000, 0 0 16px #FF3B3B40', opacity: title.trim() ? 1 : 0.4 },
    urgentRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 2px' },
    urgentToggle: { width: 36, height: 20, borderRadius: 10, background: urgent ? '#FF3B3B' : '#2A2A35', border: `1px solid ${urgent ? '#FF3B3B' : '#4A4A5A'}`, cursor: 'pointer', position: 'relative', transition: 'all 200ms', flexShrink: 0 },
    urgentThumb: { position: 'absolute', top: 2, left: urgent ? 18 : 2, width: 14, height: 14, borderRadius: 7, background: '#fff', transition: 'left 200ms cubic-bezier(0.22,1,0.36,1)' },
    urgentLabel: { fontFamily: "'Space Grotesk'", fontSize: 11, color: urgent ? '#FF3B3B' : '#4A4A5A', fontWeight: 600 },
    ptsPreview: { fontFamily: "'Space Mono'", fontSize: 11, color: '#4A4A5A', marginLeft: 'auto' },
    divider: { height: 1, background: '#2A2A35', margin: '0 0 14px' },
  };

  return (
    <div style={ms.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={ms.sheet}>
        <div style={ms.handle}></div>
        <div style={ms.header}>
          <div style={ms.title}>Load Task</div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={ms.ptsBadge}>+{basePoints} pts base</div>
            <button style={ms.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>
        <div style={ms.body}>
          <div style={{ height: 14 }}></div>
          <label style={ms.label}>Task name</label>
          <input
            style={ms.input}
            placeholder="What must be sacrificed?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />

          <label style={ms.label}>Category</label>
          <div style={ms.chipRow}>
            {CATEGORIES.map(c => (
              <div key={c.id} style={ms.chip(cat === c.id, c.color)} onClick={() => setCat(c.id)}>{c.label}</div>
            ))}
          </div>

          <label style={ms.label}>Priority</label>
          <div style={ms.chipRow}>
            {PRIORITIES.map(p => (
              <div key={p.id} style={ms.chip(priority === p.id, p.color)} onClick={() => setPriority(p.id)}>{p.label}</div>
            ))}
          </div>

          <label style={ms.label}>Estimate</label>
          <div style={ms.chipRow}>
            {DURATIONS.map(d => (
              <div key={d} style={ms.chip(duration === d, '#3DDCFF')} onClick={() => setDuration(d)}>{d} min</div>
            ))}
          </div>

          <div style={ms.divider}></div>
          <div style={ms.urgentRow}>
            <div style={ms.urgentToggle} onClick={() => setUrgent(u => !u)}>
              <div style={ms.urgentThumb}></div>
            </div>
            <span style={ms.urgentLabel}>Before this hour ends</span>
            <span style={ms.ptsPreview}>×1.5 if urgent</span>
          </div>
        </div>
        <div style={ms.footer}>
          <button style={ms.addBtn} onClick={handleAdd}>Throw it in →</button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { TaskModal, CATEGORIES, PRIORITIES, DURATIONS });
