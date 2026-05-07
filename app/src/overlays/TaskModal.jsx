import { useState } from 'react';
import { CATEGORIES as DEFAULT_CATS, PRIORITIES, DURATIONS } from '../data/constants';

const COLOR_PALETTE = ['#FF3B3B', '#FF8C42', '#FFD166', '#7CFF6B', '#3DDCFF', '#8F5CFF', '#FF5CD6', '#8A8A9A'];

export default function TaskModal({
  onClose,
  onAdd,
  onSave,
  task = null,
  mode = 'create',
  maxDurationMin = 60,
  categories,
  continuableTasks = [],
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) {
  const cats = categories && categories.length ? categories : DEFAULT_CATS;
  const cap = Math.max(1, Math.floor(maxDurationMin));
  const allowed = DURATIONS.filter(d => d <= cap);
  const editMode = mode === 'edit' && task;
  const optionList = allowed.length > 0 ? allowed : [cap];
  const durationOptions = editMode && task.duration && !optionList.includes(task.duration)
    ? [...optionList, task.duration].sort((a, b) => a - b)
    : optionList;
  const defaultDuration = durationOptions[durationOptions.length - 1];

  const [title,    setTitle]    = useState(task?.title || '');
  const [cat,      setCat]      = useState(task?.category || cats[0]?.id || 'dev');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [duration, setDuration] = useState(task?.duration || defaultDuration);
  const [urgent,   setUrgent]   = useState(task?.urgent ?? true);
  const [destination, setDestination] = useState('active');
  const [entryMode, setEntryMode] = useState('new');
  const [selectedContinueId, setSelectedContinueId] = useState('');

  const [manageOpen, setManageOpen] = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [draftLabel, setDraftLabel] = useState('');
  const [draftColor, setDraftColor] = useState(COLOR_PALETTE[0]);
  const [newLabel,   setNewLabel]   = useState('');
  const [newColor,   setNewColor]   = useState(COLOR_PALETTE[4]);

  const startEdit = (c) => { setEditingId(c.id); setDraftLabel(c.label); setDraftColor(c.color); };
  const cancelEdit = () => { setEditingId(null); setDraftLabel(''); };
  const saveEdit = () => {
    if (!editingId) return;
    onUpdateCategory && onUpdateCategory(editingId, { label: draftLabel, color: draftColor });
    cancelEdit();
  };
  const handleDelete = (id) => {
    if (cats.length <= 1) return;
    onDeleteCategory && onDeleteCategory(id);
    if (cat === id) {
      const fallback = cats.find(c => c.id !== id);
      if (fallback) setCat(fallback.id);
    }
    if (editingId === id) cancelEdit();
  };
  const handleCreate = () => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    onAddCategory && onAddCategory({ label: trimmed, color: newColor });
    setNewLabel('');
    setNewColor(COLOR_PALETTE[4]);
  };

  const selPriority = PRIORITIES.find(p => p.id === priority);
  const basePoints  = selPriority.pts + Math.floor(duration * 2.5);
  const selectedContinueTask = continuableTasks.find(t => String(t.id) === selectedContinueId);

  const selectEntryMode = (nextMode) => {
    setEntryMode(nextMode);
    if (nextMode === 'new') {
      setSelectedContinueId('');
    }
  };

  const handleContinueSelect = (id) => {
    setSelectedContinueId(id);
    const selected = continuableTasks.find(t => String(t.id) === id);
    if (!selected) return;
    setTitle(`${selected.baseTitle || selected.title} - Parte ${selected.nextPart}`);
    setCat(selected.category || cats[0]?.id || 'dev');
    setPriority(selected.priority || 'medium');
  };

  const handleAdd = () => {
    if (!title.trim()) return;
    const continuation = selectedContinueTask
      ? {
        continuedFromTaskId: selectedContinueTask.rootId || selectedContinueTask.id,
        continuedFromTitle: selectedContinueTask.baseTitle || selectedContinueTask.title,
        continuedPart: selectedContinueTask.nextPart,
        continuedFromHourKey: selectedContinueTask.hourKey || null,
      }
      : {};
    const payload = { title: title.trim(), category: cat, priority, duration, points: basePoints, urgent, done: false, ...continuation };
    if (editMode) {
      onSave && onSave(payload);
      onClose();
      return;
    }
    onAdd && onAdd({ ...payload, id: Date.now() }, destination);
    onClose();
  };

  const chip = (active, color) => ({
    fontFamily: "'Space Grotesk'", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
    padding: '6px 12px', borderRadius: 4, cursor: 'pointer',
    background: active ? color + '25' : '#1C1C2A',
    color: active ? color : '#4A4A5A',
    border: `1px solid ${active ? color + '60' : '#2A2A35'}`,
    boxShadow: active ? `0 0 8px ${color}30` : 'none',
    transition: 'all 120ms cubic-bezier(0.22,1,0.36,1)',
  });

  return (
    <div
      className="modalShadeIn"
      style={{ position: 'fixed', inset: 0, background: 'rgba(11,11,16,0.85)', zIndex: 300, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bottomSheetUp" style={{ background: '#13131C', borderRadius: '8px 8px 0 0', border: '1px solid #2A2A35', borderBottom: 'none', width: '100%', padding: '0 0 32px', boxShadow: '0 -4px 40px rgba(0,0,0,0.6)' }}>
        <div style={{ width: 36, height: 4, background: '#2A2A35', borderRadius: 2, margin: '12px auto 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 0' }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: '#F0EDE8', letterSpacing: '0.04em' }}>{editMode ? 'Modificar tarea' : 'Cargar tarea'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 11, color: selPriority.color, background: selPriority.color + '15', border: `1px solid ${selPriority.color}40`, padding: '4px 10px', borderRadius: 4 }}>
              +{basePoints} pts base
            </div>
            <button
              className="arcadePressable"
              style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid #2A2A35', background: 'transparent', color: '#8A8A9A', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ height: 14 }} />

          {!editMode && (
            <>
          <label style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', marginBottom: 6, display: 'block' }}>
            Tipo
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: entryMode === 'continue' ? 10 : 16 }}>
            {[
              { id: 'new', label: 'Nueva', hint: 'desde cero', color: '#FFD166' },
              { id: 'continue', label: 'Continuar', hint: 'parte siguiente', color: '#8F5CFF' },
            ].map(option => {
              const active = entryMode === option.id;
              const disabled = option.id === 'continue' && continuableTasks.length === 0;
              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={disabled}
                  className={active && !disabled ? 'arcadePressable' : undefined}
                  onClick={() => !disabled && selectEntryMode(option.id)}
                  style={{
                    padding: '10px 10px',
                    borderRadius: 6,
                    border: `1px solid ${active ? option.color + '80' : '#2A2A35'}`,
                    background: active ? option.color + '18' : '#1C1C2A',
                    color: disabled ? '#4A4A5A' : active ? option.color : '#8A8A9A',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    boxShadow: active ? `0 0 12px ${option.color}25` : 'none',
                    opacity: disabled ? 0.55 : 1,
                  }}
                >
                  <span style={{ display: 'block', fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: '0.08em', lineHeight: 1 }}>
                    {option.label}
                  </span>
                  <span style={{ display: 'block', fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: active ? '#F0EDE8' : '#4A4A5A', marginTop: 3 }}>
                    {disabled ? 'sin tareas' : option.hint}
                  </span>
                </button>
              );
            })}
          </div>

          {entryMode === 'continue' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', marginBottom: 6, display: 'block' }}>
                Tarea anterior
              </label>
              <select
                value={selectedContinueId}
                onChange={e => handleContinueSelect(e.target.value)}
                style={{
                  width: '100%',
                  background: '#1C1C2A',
                  border: '1px solid #8F5CFF55',
                  borderRadius: 6,
                  padding: '11px 12px',
                  fontFamily: "'Space Grotesk'",
                  fontSize: 12,
                  color: selectedContinueId ? '#F0EDE8' : '#8A8A9A',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">Elegir tarea para continuar...</option>
                {continuableTasks.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.title} | {option.sourceLabel} | {option.status} | Parte {option.nextPart}
                  </option>
                ))}
              </select>
              {selectedContinueTask && (
                <div style={{ marginTop: 7, fontFamily: "'Space Grotesk'", fontSize: 10, color: '#8F5CFF', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Continua: {selectedContinueTask.baseTitle} | Parte {selectedContinueTask.nextPart}
                </div>
              )}
            </div>
          )}

          <label style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', marginBottom: 6, display: 'block' }}>
            Destino
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {[
              { id: 'active', label: 'Ahora', hint: 'entra a la ronda' },
              { id: 'inbox', label: 'Bandeja', hint: 'para mas tarde' },
            ].map(option => {
              const active = destination === option.id;
              const color = option.id === 'active' ? '#FF3B3B' : '#3DDCFF';
              return (
                <button
                  key={option.id}
                  type="button"
                  className={active ? 'arcadePressable' : undefined}
                  onClick={() => setDestination(option.id)}
                  style={{
                    padding: '10px 10px',
                    borderRadius: 6,
                    border: `1px solid ${active ? color + '80' : '#2A2A35'}`,
                    background: active ? color + '18' : '#1C1C2A',
                    color: active ? color : '#8A8A9A',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: active ? `0 0 12px ${color}25` : 'none',
                  }}
                >
                  <span style={{ display: 'block', fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: '0.08em', lineHeight: 1 }}>
                    {option.label}
                  </span>
                  <span style={{ display: 'block', fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: active ? '#F0EDE8' : '#4A4A5A', marginTop: 3 }}>
                    {option.hint}
                  </span>
                </button>
              );
            })}
          </div>
            </>
          )}

          <label style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', marginBottom: 6, display: 'block' }}>
            Nombre de la tarea
          </label>
          <input
            style={{ width: '100%', background: '#1C1C2A', border: '1px solid #2A2A35', borderRadius: 6, padding: '12px 14px', fontFamily: "'Space Grotesk'", fontSize: 14, color: '#F0EDE8', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
            placeholder="¿Que hay que sacrificar?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A' }}>
              Categoria
            </label>
            <button
              type="button"
              onClick={() => { setManageOpen(o => !o); cancelEdit(); }}
              style={{ background: 'transparent', border: '1px solid #2A2A35', color: manageOpen ? '#FF3B3B' : '#8A8A9A', fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '3px 8px', borderRadius: 4, cursor: 'pointer' }}
            >
              {manageOpen ? 'Listo' : 'Gestionar'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: manageOpen ? 10 : 16 }}>
            {cats.map(c => (
              <div key={c.id} style={chip(cat === c.id, c.color)} onClick={() => !manageOpen && setCat(c.id)}>
                {c.label}
                {manageOpen && (
                  <span
                    onClick={(e) => { e.stopPropagation(); startEdit(c); }}
                    style={{ marginLeft: 6, color: '#8A8A9A', cursor: 'pointer' }}
                  >
                    ✎
                  </span>
                )}
              </div>
            ))}
          </div>

          {manageOpen && (
            <div style={{ background: '#0F0F18', border: '1px solid #2A2A35', borderRadius: 6, padding: 10, marginBottom: 16 }}>
              {editingId ? (
                <div>
                  <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', marginBottom: 6 }}>Editar categoria</div>
                  <input
                    value={draftLabel}
                    onChange={e => setDraftLabel(e.target.value)}
                    style={{ width: '100%', background: '#1C1C2A', border: '1px solid #2A2A35', borderRadius: 4, padding: '8px 10px', fontFamily: "'Space Grotesk'", fontSize: 12, color: '#F0EDE8', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
                  />
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                    {COLOR_PALETTE.map(col => (
                      <div
                        key={col}
                        onClick={() => setDraftColor(col)}
                        style={{ width: 22, height: 22, borderRadius: 4, background: col, border: draftColor === col ? '2px solid #F0EDE8' : '1px solid #2A2A35', cursor: 'pointer' }}
                      />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" onClick={saveEdit} style={{ flex: 1, padding: '8px', background: '#3DDCFF20', border: '1px solid #3DDCFF60', color: '#3DDCFF', fontFamily: "'Space Grotesk'", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', borderRadius: 4, cursor: 'pointer' }}>Guardar</button>
                    <button type="button" onClick={cancelEdit} style={{ padding: '8px 10px', background: 'transparent', border: '1px solid #2A2A35', color: '#8A8A9A', fontFamily: "'Space Grotesk'", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', borderRadius: 4, cursor: 'pointer' }}>Cancelar</button>
                    {cats.length > 1 && (
                      <button type="button" onClick={() => handleDelete(editingId)} style={{ padding: '8px 10px', background: '#FF3B3B20', border: '1px solid #FF3B3B60', color: '#FF3B3B', fontFamily: "'Space Grotesk'", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', borderRadius: 4, cursor: 'pointer' }}>Borrar</button>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', marginBottom: 6 }}>Nueva categoria</div>
                  <input
                    value={newLabel}
                    onChange={e => setNewLabel(e.target.value)}
                    placeholder="e.g. Research"
                    style={{ width: '100%', background: '#1C1C2A', border: '1px solid #2A2A35', borderRadius: 4, padding: '8px 10px', fontFamily: "'Space Grotesk'", fontSize: 12, color: '#F0EDE8', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
                  />
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                    {COLOR_PALETTE.map(col => (
                      <div
                        key={col}
                        onClick={() => setNewColor(col)}
                        style={{ width: 22, height: 22, borderRadius: 4, background: col, border: newColor === col ? '2px solid #F0EDE8' : '1px solid #2A2A35', cursor: 'pointer' }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={!newLabel.trim()}
                    style={{ width: '100%', padding: '8px', background: newLabel.trim() ? '#FF3B3B' : '#2A2A35', border: 'none', color: '#fff', fontFamily: "'Space Grotesk'", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', borderRadius: 4, cursor: newLabel.trim() ? 'pointer' : 'not-allowed' }}
                  >
                    + Crear categoria
                  </button>
                </div>
              )}
            </div>
          )}

          <label style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', marginBottom: 6, display: 'block' }}>
            Prioridad
          </label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {PRIORITIES.map(p => (
              <div key={p.id} style={chip(priority === p.id, p.color)} onClick={() => setPriority(p.id)}>{p.label}</div>
            ))}
          </div>

          <label style={{ fontFamily: "'Space Grotesk'", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A5A', marginBottom: 6, display: 'block' }}>
            Estimacion
          </label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {durationOptions.map(d => (
              <div key={d} style={chip(duration === d, '#3DDCFF')} onClick={() => setDuration(d)}>{d} min</div>
            ))}
            <span style={{ fontFamily: "'Space Mono'", fontSize: 9, color: '#4A4A5A', alignSelf: 'center', marginLeft: 'auto' }}>
              ≤ {cap} min left
            </span>
          </div>

          <div style={{ height: 1, background: '#2A2A35', margin: '0 0 14px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 2px' }}>
            <div
              style={{ width: 36, height: 20, borderRadius: 10, background: urgent ? '#FF3B3B' : '#2A2A35', border: `1px solid ${urgent ? '#FF3B3B' : '#4A4A5A'}`, cursor: 'pointer', position: 'relative', transition: 'all 200ms', flexShrink: 0 }}
              onClick={() => setUrgent(u => !u)}
            >
              <div style={{ position: 'absolute', top: 2, left: urgent ? 18 : 2, width: 14, height: 14, borderRadius: 7, background: '#fff', transition: 'left 200ms cubic-bezier(0.22,1,0.36,1)' }} />
            </div>
            <span style={{ fontFamily: "'Space Grotesk'", fontSize: 11, color: urgent ? '#FF3B3B' : '#4A4A5A', fontWeight: 600 }}>Antes de que termine esta hora</span>
            <span style={{ fontFamily: "'Space Mono'", fontSize: 11, color: '#4A4A5A', marginLeft: 'auto' }}>×1.5 si es urgente</span>
          </div>
        </div>

        <div style={{ padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            className={title.trim() ? 'arcadePressable' : undefined}
            style={{
              width: '100%', padding: '14px', background: '#FF3B3B', border: 'none', borderRadius: 6,
              color: '#fff', fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: '0.06em', cursor: 'pointer',
              boxShadow: '3px 3px 0px #000, 0 0 16px #FF3B3B40', opacity: title.trim() ? 1 : 0.4,
            }}
            onClick={handleAdd}
          >
            {editMode ? 'Guardar cambios' : destination === 'inbox' ? 'Dejar en bandeja →' : 'Mandarla al infierno →'}
          </button>
        </div>
      </div>
    </div>
  );
}
