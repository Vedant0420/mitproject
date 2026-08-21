import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import Modal from '../components/Modal.jsx';
import { DAYS, TIME_SLOTS, SEMESTERS, FLOORS, FLOOR_LABELS } from '../utils/constants.js';
import { checkConflict, formatTimeRange } from '../utils/helpers.js';
import { nanoid } from '../utils/nanoid.js';
import {
  Plus, Pencil, Trash2, Search, CalendarCheck, AlertTriangle, Upload, Download
} from 'lucide-react';
import { exportToExcel } from '../utils/excel.js';
import ExcelImportModal from '../components/ExcelImportModal.jsx';
import './Allotments.css';

const EMPTY = {
  roomId: '', subjectId: '', facultyId: '',
  day: 'Monday', startTime: '09:00', endTime: '10:00',
  semester: 'Odd 2026', section: '',
};

function AllotmentForm({ value, onChange, rooms, subjects, faculty, allotments, editId }) {
  const conflict = value.roomId && value.day && value.startTime && value.endTime &&
    checkConflict(allotments, value.roomId, value.facultyId, value.day, value.startTime, value.endTime, editId);

  const filterFloor = useState('all');
  const filteredRooms = filterFloor[0] === 'all'
    ? rooms
    : rooms.filter(r => r.floor === parseInt(filterFloor[0]));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      {conflict && (
        <div className="conflict-alert">
          <AlertTriangle size={16} />
          <span>{conflict.message}</span>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Floor Filter</label>
          <select
            className="form-select"
            value={filterFloor[0]}
            onChange={e => filterFloor[1](e.target.value)}
          >
            <option value="all">All Floors</option>
            {FLOORS.map(f => <option key={f} value={f}>Floor {f} — {FLOOR_LABELS[f]}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Room *</label>
          <select
            id="allot-room"
            className="form-select"
            value={value.roomId}
            onChange={e => onChange({ ...value, roomId: e.target.value })}
          >
            <option value="">Select room…</option>
            {filteredRooms.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} (F{r.floor} · Cap {r.capacity})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Subject *</label>
          <select
            id="allot-subject"
            className="form-select"
            value={value.subjectId}
            onChange={e => onChange({ ...value, subjectId: e.target.value })}
          >
            <option value="">Select subject…</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Faculty *</label>
          <select
            id="allot-faculty"
            className="form-select"
            value={value.facultyId}
            onChange={e => onChange({ ...value, facultyId: e.target.value })}
          >
            <option value="">Select faculty…</option>
            {faculty.map(f => (
              <option key={f.id} value={f.id}>{f.name} — {f.department}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Day *</label>
          <select
            id="allot-day"
            className="form-select"
            value={value.day}
            onChange={e => onChange({ ...value, day: e.target.value })}
          >
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Start Time *</label>
          <select
            id="allot-start"
            className="form-select"
            value={value.startTime}
            onChange={e => onChange({ ...value, startTime: e.target.value })}
          >
            {TIME_SLOTS.slice(0, -1).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">End Time *</label>
          <select
            id="allot-end"
            className="form-select"
            value={value.endTime}
            onChange={e => onChange({ ...value, endTime: e.target.value })}
          >
            {TIME_SLOTS.slice(1).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Semester</label>
          <select
            id="allot-semester"
            className="form-select"
            value={value.semester}
            onChange={e => onChange({ ...value, semester: e.target.value })}
          >
            {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Section</label>
          <input
            id="allot-section"
            className="form-input"
            placeholder="e.g. A, B, C"
            value={value.section}
            onChange={e => onChange({ ...value, section: e.target.value })}
            maxLength={5}
          />
        </div>
      </div>
    </div>
  );
}

export default function Allotments() {
  const { rooms, subjects, faculty, allotments, createAllotment, updateAllotment, deleteAllotment } = useApp();
  const [search, setSearch]     = useState('');
  const [filterDay, setFilterDay]       = useState('all');
  const [filterRoom, setFilterRoom]     = useState('all');
  const [modalOpen, setModalOpen]       = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [editing, setEditing]           = useState(null);
  const [form, setForm]                 = useState({ ...EMPTY });
  const [saving, setSaving]             = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = allotments.filter(a => {
    if (filterDay  !== 'all' && a.day    !== filterDay)  return false;
    if (filterRoom !== 'all' && a.roomId !== filterRoom) return false;
    const room    = rooms.find(r => r.id === a.roomId);
    const subject = subjects.find(s => s.id === a.subjectId);
    const fac     = faculty.find(f => f.id === a.facultyId);
    if (search) {
      const q = search.toLowerCase();
      const hit = [room?.name, subject?.name, fac?.name, a.day, a.section]
        .some(s => s?.toLowerCase().includes(q));
      if (!hit) return false;
    }
    return true;
  });

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY }); setModalOpen(true); };
  const openEdit   = (a) => { setEditing(a); setForm({ ...a }); setModalOpen(true); };

  const conflict = form.roomId && form.day && form.startTime && form.endTime &&
    checkConflict(allotments, form.roomId, form.facultyId, form.day, form.startTime, form.endTime, editing?.id);

  const handleSave = async () => {
    if (!form.roomId || !form.subjectId || !form.facultyId) return;
    setSaving(true);
    try {
      if (editing) {
        await updateAllotment(editing.id, form);
      } else {
        await createAllotment({ ...form, id: `allot-${nanoid(6)}` });
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header-row">
        <div className="page-header">
          <h1><CalendarCheck size={28} style={{ verticalAlign: 'middle' }} /> Allotments</h1>
          <p>Assign subjects, faculty, and time slots to rooms</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => setImportModal(true)}>
            <Upload size={18} /> Import
          </button>
          <button className="btn btn-secondary" onClick={() => exportToExcel(filtered, 'Allotments', 'Allotments_Export')}>
            <Download size={18} /> Export
          </button>
          <button id="add-allotment-btn" className="btn btn-primary" onClick={openCreate}>
            <Plus size={18} /> New Allotment
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
          <input
            id="allot-search"
            className="form-input"
            placeholder="Search allotments…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32, maxWidth: 220 }}
          />
        </div>
        <select id="filter-allot-day" className="form-select" value={filterDay} onChange={e => setFilterDay(e.target.value)} style={{ maxWidth: 150 }}>
          <option value="all">All Days</option>
          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select id="filter-allot-room" className="form-select" value={filterRoom} onChange={e => setFilterRoom(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="all">All Rooms</option>
          {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <span className="text-muted">{filtered.length} allotment{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state card" style={{ padding: 'var(--space-2xl)' }}>
          <CalendarCheck size={48} />
          <h3 style={{ marginTop: 'var(--space-md)' }}>No allotments found</h3>
          <p>Create your first allotment to get started</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Room</th>
                <th>Subject</th>
                <th>Faculty</th>
                <th>Day</th>
                <th>Time</th>
                <th>Semester</th>
                <th>Section</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const room    = rooms.find(r => r.id === a.roomId);
                const subject = subjects.find(s => s.id === a.subjectId);
                const fac     = faculty.find(f => f.id === a.facultyId);
                return (
                  <tr key={a.id}>
                    <td>
                      <div>
                        <strong>{room?.name || '—'}</strong>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          Floor {room?.floor} · Cap {room?.capacity}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span>{subject?.name || '—'}</span>
                        <div className="font-mono text-muted" style={{ fontSize: '0.75rem' }}>{subject?.code}</div>
                      </div>
                    </td>
                    <td>{fac?.name || '—'}</td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(79,140,255,0.12)', color: 'var(--blue-light)', border:'1px solid rgba(79,140,255,0.25)' }}>
                        {a.day}
                      </span>
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.82rem' }}>
                      {formatTimeRange(a.startTime, a.endTime)}
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{a.semester}</td>
                    <td>
                      {a.section ? (
                        <span className="badge" style={{ background: 'rgba(180,122,255,0.12)', color: 'var(--purple)', border:'1px solid rgba(180,122,255,0.25)' }}>
                          Sec {a.section}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-icon" title="Edit" aria-label="Edit allotment" onClick={() => openEdit(a)}>
                          <Pencil size={15} />
                        </button>
                        <button className="btn-icon" title="Delete" aria-label="Delete allotment" onClick={() => setConfirmDelete(a)}
                          style={{ color: 'var(--rose)' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Allotment' : 'New Allotment'}
        size="lg"
      >
        <AllotmentForm
          value={form}
          onChange={setForm}
          rooms={rooms}
          subjects={subjects}
          faculty={faculty}
          allotments={allotments}
          editId={editing?.id}
        />
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button
            id="save-allotment-btn"
            className="btn btn-primary"
            disabled={saving || !!conflict || !form.roomId || !form.subjectId || !form.facultyId}
            onClick={handleSave}
          >
            {saving ? 'Saving...' : 'Save Allotment'}
          </button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Allotment" size="sm">
        <p style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to delete this allotment? This cannot be undone.
        </p>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
          <button
            id="confirm-delete-allot-btn"
            className="btn btn-danger"
            onClick={async () => { await deleteAllotment(confirmDelete.id); setConfirmDelete(null); }}
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </Modal>

      {importModal && (
        <ExcelImportModal
          mode="allotments"
          onClose={() => setImportModal(false)}
        />
      )}
    </div>
  );
}
