import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import Modal from '../components/Modal.jsx';
import { FLOORS, FLOOR_LABELS, ROOM_TYPES, ROOM_STATUSES, FACILITIES } from '../utils/constants.js';
import { nanoid } from '../utils/nanoid.js';
import { getRoomTypeColor } from '../utils/helpers.js';
import { Plus, Pencil, Trash2, Search, Filter, DoorOpen } from 'lucide-react';
import './RoomManagement.css';

const EMPTY_ROOM = {
  name: '', floor: 1, type: 'classroom', capacity: 60,
  facilities: [], status: 'available',
};

function RoomForm({ value, onChange }) {
  const toggle = (f) => {
    const arr = value.facilities || [];
    onChange({
      ...value,
      facilities: arr.includes(f) ? arr.filter(x => x !== f) : [...arr, f],
    });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Room Name *</label>
          <input
            id="room-name"
            className="form-input"
            placeholder="e.g. Room 201, CS Lab 3"
            value={value.name}
            onChange={e => onChange({ ...value, name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Floor *</label>
          <select
            id="room-floor"
            className="form-select"
            value={value.floor}
            onChange={e => onChange({ ...value, floor: parseInt(e.target.value) })}
          >
            {FLOORS.map(f => (
              <option key={f} value={f}>{f} — {FLOOR_LABELS[f]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Room Type *</label>
          <select
            id="room-type"
            className="form-select"
            value={value.type}
            onChange={e => onChange({ ...value, type: e.target.value })}
          >
            {ROOM_TYPES.map(rt => (
              <option key={rt.value} value={rt.value}>{rt.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Capacity</label>
          <input
            id="room-capacity"
            type="number"
            className="form-input"
            min={1}
            value={value.capacity}
            onChange={e => onChange({ ...value, capacity: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            id="room-status"
            className="form-select"
            value={value.status}
            onChange={e => onChange({ ...value, status: e.target.value })}
          >
            {ROOM_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Facilities</label>
        <div className="checkbox-group">
          {FACILITIES.map(f => (
            <label key={f} className={`checkbox-chip ${(value.facilities || []).includes(f) ? 'active' : ''}`}>
              <input
                type="checkbox"
                checked={(value.facilities || []).includes(f)}
                onChange={() => toggle(f)}
              />
              {f}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RoomManagement() {
  const { rooms, createRoom, updateRoom, deleteRoom } = useApp();
  const [search, setSearch]       = useState('');
  const [filterFloor, setFilterFloor] = useState('all');
  const [filterType, setFilterType]   = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState({ ...EMPTY_ROOM });
  const [saving, setSaving]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = rooms.filter(r => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterFloor !== 'all' && r.floor !== parseInt(filterFloor)) return false;
    if (filterType  !== 'all' && r.type  !== filterType)            return false;
    if (filterStatus !== 'all' && r.status !== filterStatus)        return false;
    return true;
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_ROOM });
    setModalOpen(true);
  };
  const openEdit = (room) => {
    setEditing(room);
    setForm({ ...room });
    setModalOpen(true);
  };
  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await updateRoom(editing.id, form);
      } else {
        await createRoom({ ...form, id: `room-${nanoid(6)}` });
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
          <h1><DoorOpen size={28} style={{ verticalAlign: 'middle' }} /> Rooms</h1>
          <p>Manage classrooms and labs across all 8 floors of Vyas Building</p>
        </div>
        <button id="add-room-btn" className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Add Room
        </button>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
          <input
            id="room-search"
            className="form-input"
            placeholder="Search rooms…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32, maxWidth: 220 }}
          />
        </div>
        <select id="filter-floor" className="form-select" value={filterFloor} onChange={e => setFilterFloor(e.target.value)} style={{ maxWidth: 170 }}>
          <option value="all">All Floors</option>
          {FLOORS.map(f => <option key={f} value={f}>Floor {f} — {FLOOR_LABELS[f]}</option>)}
        </select>
        <select id="filter-type" className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ maxWidth: 160 }}>
          <option value="all">All Types</option>
          {ROOM_TYPES.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
        </select>
        <select id="filter-status" className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ maxWidth: 160 }}>
          <option value="all">All Statuses</option>
          {ROOM_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <span className="text-muted">{filtered.length} room{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state card" style={{ padding: 'var(--space-2xl)' }}>
          <DoorOpen size={48} />
          <h3 style={{ marginTop: 'var(--space-md)' }}>No rooms found</h3>
          <p>Add a room to get started</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Room Name</th>
                <th>Floor</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Facilities</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(room => (
                <tr key={room.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                          background: getRoomTypeColor(room.type),
                        }}
                      />
                      <strong>{room.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono" style={{ fontSize: '0.82rem' }}>
                      F{room.floor} — {FLOOR_LABELS[room.floor]}
                    </span>
                  </td>
                  <td><span className={`badge badge-${room.type}`}>{ROOM_TYPES.find(t=>t.value===room.type)?.label}</span></td>
                  <td className="font-mono">{room.capacity}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 260 }}>
                      {(room.facilities || []).slice(0, 3).map(f => (
                        <span key={f} className="chip">{f}</span>
                      ))}
                      {(room.facilities || []).length > 3 && (
                        <span className="chip">+{room.facilities.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td><span className={`badge badge-${room.status}`}>{room.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-icon" title="Edit" onClick={() => openEdit(room)}>
                        <Pencil size={15} />
                      </button>
                      <button className="btn-icon" title="Delete" onClick={() => setConfirmDelete(room)}
                        style={{ color: 'var(--rose)' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit Room — ${editing.name}` : 'Add New Room'}
        size="lg"
      >
        <RoomForm value={form} onChange={setForm} />
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button
            id="save-room-btn"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
          >
            {saving ? 'Saving…' : editing ? 'Update Room' : 'Add Room'}
          </button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Room"
        size="sm"
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{confirmDelete?.name}</strong>? This action cannot be undone.
        </p>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
          <button
            id="confirm-delete-btn"
            className="btn btn-danger"
            onClick={async () => {
              await deleteRoom(confirmDelete.id);
              setConfirmDelete(null);
            }}
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
