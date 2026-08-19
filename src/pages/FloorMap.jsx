import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useState } from 'react';
import { FLOORS, FLOOR_LABELS, ROOM_TYPES } from '../utils/constants.js';
import { getRoomTypeColor, formatTimeRange } from '../utils/helpers.js';
import { X, Info, CalendarCheck, ChevronLeft, ChevronRight as ChevRight } from 'lucide-react';
import './FloorMap.css';

function RoomBlock({ room, allotments, subjects, faculty, onClick, selected }) {
  const typeColor = getRoomTypeColor(room.type);
  const statusColor = room.status === 'available' ? 'var(--teal)'
    : room.status === 'occupied' ? 'var(--rose)' : 'var(--amber)';
  const roomAllots = allotments.filter(a => a.roomId === room.id);

  return (
    <div
      className={`room-block ${selected ? 'selected' : ''}`}
      style={{ '--type-color': typeColor, '--status-color': statusColor }}
      onClick={() => onClick(room)}
      title={room.name}
    >
      <div className="room-block-header">
        <span className="room-block-name">{room.name}</span>
        <span className="room-block-status-dot" />
      </div>
      <div className="room-block-type">{ROOM_TYPES.find(t => t.value === room.type)?.label || room.type}</div>
      <div className="room-block-meta">
        <span>Cap: {room.capacity}</span>
        <span>{roomAllots.length} slots</span>
      </div>
    </div>
  );
}

function RoomPanel({ room, allotments, subjects, faculty, onClose }) {
  if (!room) return null;
  const roomAllots = allotments.filter(a => a.roomId === room.id);
  const typeColor  = getRoomTypeColor(room.type);

  return (
    <div className="room-panel">
      <div className="room-panel-header">
        <div>
          <h3 style={{ color: typeColor }}>{room.name}</h3>
          <span className={`badge badge-${room.status}`}>{room.status}</span>
        </div>
        <button className="btn-icon" onClick={onClose}><X size={18} /></button>
      </div>

      <div className="room-panel-body">
        <div className="room-panel-info">
          <div className="rpi-row">
            <span>Type</span>
            <span className={`badge badge-${room.type}`}>
              {ROOM_TYPES.find(t => t.value === room.type)?.label}
            </span>
          </div>
          <div className="rpi-row"><span>Capacity</span><strong>{room.capacity}</strong></div>
          <div className="rpi-row">
            <span>Facilities</span>
            <div className="facility-chips">
              {(room.facilities || []).map(f => (
                <span key={f} className="chip">{f}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="room-panel-allotments">
          <div className="section-title"><CalendarCheck size={12} /> Allotments ({roomAllots.length})</div>
          {roomAllots.length === 0 ? (
            <p className="text-muted">No allotments for this room.</p>
          ) : (
            <div className="rp-allot-list">
              {roomAllots.map(a => {
                const sub = subjects.find(s => s.id === a.subjectId);
                const fac = faculty.find(f => f.id === a.facultyId);
                return (
                  <div key={a.id} className="rp-allot-item">
                    <div className="rp-day">{a.day.slice(0, 3)}</div>
                    <div>
                      <div className="rp-subject">{sub?.name || 'Unknown'}</div>
                      <div className="rp-meta">
                        {fac?.name || '—'} · {formatTimeRange(a.startTime, a.endTime)}
                        {a.section && ` · Sec ${a.section}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FloorMap() {
  const { floor: floorParam } = useParams();
  const floor = parseInt(floorParam) || 1;
  const { rooms, allotments, subjects, faculty } = useApp();
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');

  const floorRooms = rooms.filter(r =>
    r.floor === floor &&
    (typeFilter === 'all' || r.type === typeFilter)
  );

  const prevFloor = floor > 1 ? floor - 1 : null;
  const nextFloor = floor < 8 ? floor + 1 : null;

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header-row">
        <div className="page-header">
          <h1>🗺️ Floor Map</h1>
          <p>{FLOOR_LABELS[floor]} — {floorRooms.length} room{floorRooms.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="floor-nav-btns">
          <button
            className="btn btn-secondary btn-sm"
            disabled={!prevFloor}
            onClick={() => { navigate(`/floors/${prevFloor}`); setSelectedRoom(null); }}
          >
            <ChevronLeft size={16} /> Floor {prevFloor}
          </button>
          <button
            className="btn btn-secondary btn-sm"
            disabled={!nextFloor}
            onClick={() => { navigate(`/floors/${nextFloor}`); setSelectedRoom(null); }}
          >
            Floor {nextFloor} <ChevRight size={16} />
          </button>
        </div>
      </div>

      {/* Floor tabs */}
      <div className="floor-tabs">
        {FLOORS.map(f => (
          <NavLink
            key={f}
            to={`/floors/${f}`}
            className={`floor-tab ${f === floor ? 'active' : ''}`}
            onClick={() => setSelectedRoom(null)}
          >
            {f}
          </NavLink>
        ))}
      </div>

      {/* Legend + filter */}
      <div className="floor-controls">
        <div className="floor-legend">
          {ROOM_TYPES.map(rt => (
            <div key={rt.value} className="legend-item">
              <span className="legend-dot" style={{ background: rt.color }} />
              <span>{rt.label}</span>
            </div>
          ))}
          <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--teal)' }} />Available</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--rose)' }} />Occupied</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--amber)' }} />Maintenance</div>
        </div>
        <select
          className="form-select"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{ maxWidth: 180 }}
        >
          <option value="all">All Types</option>
          {ROOM_TYPES.map(rt => (
            <option key={rt.value} value={rt.value}>{rt.label}</option>
          ))}
        </select>
      </div>

      {/* Map + Panel */}
      <div className={`floor-map-layout ${selectedRoom ? 'has-panel' : ''}`}>
        <div className="floor-map-area card">
          <div className="floor-map-label">
            <Info size={14} /> Click a room to view details
          </div>
          {floorRooms.length === 0 ? (
            <div className="empty-state">
              <p>No rooms on this floor yet.</p>
              <button
                className="btn btn-primary mt-md"
                onClick={() => navigate('/rooms')}
              >
                Add Rooms
              </button>
            </div>
          ) : (
            <div className="floor-grid">
              {floorRooms.map(room => (
                <RoomBlock
                  key={room.id}
                  room={room}
                  allotments={allotments}
                  subjects={subjects}
                  faculty={faculty}
                  onClick={r => setSelectedRoom(s => s?.id === r.id ? null : r)}
                  selected={selectedRoom?.id === room.id}
                />
              ))}
            </div>
          )}
        </div>

        {selectedRoom && (
          <RoomPanel
            room={rooms.find(r => r.id === selectedRoom.id) || selectedRoom}
            allotments={allotments}
            subjects={subjects}
            faculty={faculty}
            onClose={() => setSelectedRoom(null)}
          />
        )}
      </div>
    </div>
  );
}
