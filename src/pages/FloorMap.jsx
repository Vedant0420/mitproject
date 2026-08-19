import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useState } from 'react';
import { FLOORS, FLOOR_LABELS } from '../utils/constants.js';
import { formatTimeRange } from '../utils/helpers.js';
import { X, CalendarCheck, MapPin } from 'lucide-react';
import './FloorMap.css';

// ── Floor 1 blueprint layout ─────────────────────────────────────────
// Each entry: { id: roomName, x, y, w, h, type }
// type: 'classroom' | 'lab' | 'washroom' | 'lift' | 'faculty'
// Coordinates are percentages of building container (600×760)

const FLOOR_BLUEPRINTS = {
  1: {
    w: 560, h: 760,
    // Clip path for angled top-left corner
    clip: 'polygon(80px 0, 100% 0, 100% 100%, 0 100%, 0 80px)',
    rooms: [
      // ── Top section ─────────────────────────────────────────
      { name: 'VY101', x: 90,  y: 30,  w: 120, h: 100, type: 'classroom' },
      { name: 'VY124', x: 220, y: 30,  w: 110, h: 85,  type: 'classroom' },
      { name: 'VY122', x: 340, y: 30,  w: 110, h: 100, type: 'lab' },
      { name: 'VY113', x: 460, y: 30,  w: 90,  h: 140, type: 'classroom' },
      { name: 'VY102', x: 90,  y: 140, w: 120, h: 90,  type: 'classroom' },
      { name: 'VY124B',x: 220, y: 125, w: 110, h: 55,  type: 'classroom' },

      // ── Right washrooms ──────────────────────────────────────
      { name: 'VY118', x: 462, y: 180, w: 88, h: 28, type: 'washroom' },
      { name: 'VY117', x: 462, y: 212, w: 88, h: 28, type: 'washroom' },
      { name: 'VY116', x: 462, y: 244, w: 88, h: 28, type: 'washroom' },
      { name: 'VY115', x: 462, y: 276, w: 88, h: 28, type: 'washroom' },

      // ── Middle section ───────────────────────────────────────
      { name: 'VY103', x: 90,  y: 290, w: 130, h: 140, type: 'classroom' },
      { name: 'VY126', x: 240, y: 290, w: 110, h: 65,  type: 'lab' },
      { name: 'VY127', x: 240, y: 363, w: 110, h: 65,  type: 'lab' },
      { name: 'VY114', x: 362, y: 290, w: 95,  h: 140, type: 'classroom' },

      { name: 'VY104', x: 90,  y: 445, w: 130, h: 130, type: 'classroom' },
      { name: 'VY128', x: 240, y: 438, w: 110, h: 65,  type: 'lab' },
      { name: 'VY129', x: 240, y: 511, w: 110, h: 65,  type: 'lab' },
      { name: 'VY113B',x: 362, y: 440, w: 95,  h: 140, type: 'classroom' },

      // ── Bottom washrooms ─────────────────────────────────────
      { name: 'VY108', x: 365, y: 595, w: 93,  h: 28, type: 'washroom' },
      { name: 'VY107', x: 365, y: 627, w: 93,  h: 28, type: 'washroom' },
    ],
    lifts: [
      { x: 52, y: 45 },
      { x: 52, y: 80 },
      { x: 52, y: 115 },
      { x: 52, y: 320 },
      { x: 52, y: 355 },
      { x: 52, y: 620 },
      { x: 52, y: 655 },
      { x: 52, y: 690 },
    ],
  },
  2: {
    w: 560, h: 720,
    clip: null,
    rooms: [
      { name: 'VY201', x: 30,  y: 30,  w: 120, h: 100, type: 'classroom' },
      { name: 'VY202', x: 165, y: 30,  w: 120, h: 100, type: 'classroom' },
      { name: 'VY203', x: 300, y: 30,  w: 120, h: 100, type: 'classroom' },
      { name: 'VY204', x: 435, y: 30,  w: 110, h: 100, type: 'classroom' },
      { name: 'VY222', x: 30,  y: 180, w: 120, h: 100, type: 'lab' },
      { name: 'VY224', x: 165, y: 180, w: 120, h: 100, type: 'classroom' },
      { name: 'VY213', x: 300, y: 180, w: 120, h: 100, type: 'classroom' },
      { name: 'VY214', x: 435, y: 180, w: 110, h: 100, type: 'classroom' },
      { name: 'VY226', x: 30,  y: 330, w: 120, h: 90,  type: 'lab' },
      { name: 'VY227', x: 165, y: 330, w: 120, h: 90,  type: 'lab' },
      { name: 'VY228', x: 300, y: 330, w: 120, h: 90,  type: 'lab' },
      { name: 'VY229', x: 435, y: 330, w: 110, h: 90,  type: 'lab' },
    ],
    lifts: [],
  },
};

// Generate placeholder layout for floors without a custom blueprint
function genericFloorLayout(floorNum) {
  const prefix = `VY${floorNum}`;
  const rooms = [];
  let col = 0, row = 0;
  const names = Array.from({ length: 12 }, (_, i) => `${prefix}0${i + 1}`);
  names.forEach((name, i) => {
    rooms.push({
      name,
      x: 30 + col * 145,
      y: 30 + row * 130,
      w: 130,
      h: 110,
      type: i % 4 === 2 ? 'lab' : 'classroom',
    });
    col++;
    if (col > 3) { col = 0; row++; }
  });
  return { w: 620, h: row * 130 + 160, clip: null, rooms, lifts: [] };
}

// ── Type color mapping ────────────────────────────────────────────────
const TYPE_COLOR = {
  classroom: 'var(--fm-room-classroom)',
  lab:       'var(--fm-room-lab)',
  washroom:  'var(--fm-room-washroom)',
  faculty:   'var(--fm-room-faculty)',
};

const LEGEND_ITEMS = [
  { label: 'Lifts',          color: 'var(--fm-room-lift)',      cls: 'fm-legend-lift' },
  { label: 'Classroom',      color: 'var(--fm-room-classroom)' },
  { label: 'Lab',            color: 'var(--fm-room-lab)' },
  { label: 'Washroom',       color: 'var(--fm-room-washroom)' },
  { label: 'Faculty Rooms',  color: 'var(--fm-room-faculty)' },
];

// ── Room Panel ───────────────────────────────────────────────────────
function RoomPanel({ room, allotments, subjects, faculty, onClose }) {
  if (!room) return null;
  const roomAllots = allotments.filter(a => a.roomId === room.id);

  return (
    <div className="fm-panel">
      <div className="fm-panel-head">
        <div>
          <div className="fm-panel-title">{room.name}</div>
          <span className={`badge badge-${room.status}`} style={{ marginTop: 6, display: 'inline-flex' }}>
            {room.status}
          </span>
        </div>
        <button className="btn-icon" onClick={onClose}><X size={17} /></button>
      </div>

      <div className="fm-panel-body">
        <div className="fm-panel-row">
          <span className="fm-panel-key">Type</span>
          <span className={`badge badge-${room.type}`}>{room.type.replace('_', ' ')}</span>
        </div>
        <div className="fm-panel-row">
          <span className="fm-panel-key">Capacity</span>
          <strong>{room.capacity}</strong>
        </div>
        <div className="fm-panel-row">
          <span className="fm-panel-key">Floor</span>
          <span>{FLOOR_LABELS[room.floor]}</span>
        </div>
        {room.facilities?.length > 0 && (
          <div className="fm-panel-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
            <span className="fm-panel-key">Facilities</span>
            <div>
              {room.facilities.map(f => (
                <span key={f} className="fm-chip">{f}</span>
              ))}
            </div>
          </div>
        )}

        <div className="section-title" style={{ marginTop: 20 }}>
          <CalendarCheck size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Allotments ({roomAllots.length})
        </div>
        {roomAllots.length === 0 ? (
          <p className="text-muted" style={{ fontSize: '0.82rem' }}>No allotments for this room.</p>
        ) : (
          roomAllots.map(a => {
            const sub = subjects.find(s => s.id === a.subjectId);
            const fac = faculty.find(f => f.id === a.facultyId);
            return (
              <div key={a.id} className="fm-allot-item">
                <span className="fm-allot-day">{a.day.slice(0, 3)}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                    {sub?.name || 'Unknown Subject'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {fac?.name || '—'} · {formatTimeRange(a.startTime, a.endTime)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Main FloorMap ────────────────────────────────────────────────────
export default function FloorMap() {
  const { floor: floorParam } = useParams();
  const floor = parseInt(floorParam) || 1;
  const { rooms, allotments, subjects, faculty } = useApp();
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');

  const floorRooms = rooms.filter(r => r.floor === floor);

  // Get or generate blueprint
  const blueprint = FLOOR_BLUEPRINTS[floor] || genericFloorLayout(floor);

  // Build a map of room name → db room object
  const roomMap = {};
  floorRooms.forEach(r => { roomMap[r.name] = r; });

  const handleRoomClick = (roomName) => {
    const dbRoom = roomMap[roomName];
    if (!dbRoom) return;
    if (typeFilter !== 'all' && dbRoom.type !== typeFilter) return;
    setSelectedRoom(s => s?.id === dbRoom.id ? null : dbRoom);
  };

  return (
    <div className="floormap-page fade-in">
      {/* Header */}
      <div className="fm-header">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Floor Map</h1>
          <p>{FLOOR_LABELS[floor]} — {floorRooms.length} rooms</p>
        </div>

        {/* Floor tabs */}
        <div className="fm-floor-tabs">
          {FLOORS.map(f => (
            <NavLink
              key={f}
              to={`/floors/${f}`}
              className={`fm-floor-tab${f === floor ? ' active' : ''}`}
              onClick={() => setSelectedRoom(null)}
            >
              {f}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Type filter chips */}
      <div className="fm-filters" style={{ marginBottom: 16 }}>
        {[
          { value: 'all',       label: 'All' },
          { value: 'classroom', label: 'Classrooms' },
          { value: 'lab',       label: 'Labs' },
          { value: 'washroom',  label: 'Washrooms' },
          { value: 'faculty',   label: 'Faculty' },
        ].map(t => (
          <button
            key={t.value}
            className={`fm-type-chip${typeFilter === t.value ? ' active' : ''}`}
            onClick={() => setTypeFilter(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main grid */}
      <div className={`fm-content${selectedRoom ? ' has-panel' : ''}`}>
        {/* Blueprint */}
        <div className="fm-blueprint-wrap">
          {/* Building shape */}
          <div
            className="fm-building"
            style={{
              width:  blueprint.w,
              height: blueprint.h,
              clipPath: blueprint.clip || undefined,
              position: 'relative',
              flexShrink: 0,
            }}
          >
            {/* Lifts */}
            {blueprint.lifts.map((l, i) => (
              <div key={i} className="fm-lift" style={{ left: l.x, top: l.y }}>L</div>
            ))}

            {/* Rooms */}
            {blueprint.rooms.map(r => {
              const dbRoom = roomMap[r.name];
              const isFiltered = typeFilter !== 'all' && r.type !== typeFilter;
              const color = TYPE_COLOR[r.type] || TYPE_COLOR.classroom;
              const status = dbRoom?.status || null;

              return (
                <div
                  key={r.name}
                  className={`fm-room${selectedRoom?.name === r.name ? ' selected' : ''}${r.w < 60 ? ' sm' : ''}`}
                  style={{
                    left:       r.x,
                    top:        r.y,
                    width:      r.w,
                    height:     r.h,
                    background: color,
                    opacity:    isFiltered ? 0.2 : 1,
                    pointerEvents: isFiltered ? 'none' : 'auto',
                  }}
                  onClick={() => handleRoomClick(r.name)}
                  title={r.name}
                >
                  <div className="fm-room-name">{r.name}</div>
                  {r.h > 50 && dbRoom && (
                    <div className="fm-room-cap">{dbRoom.capacity}</div>
                  )}
                  {status && <div className={`fm-room-status ${status}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Room detail panel */}
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

      {/* Legend */}
      <div className="fm-legend" style={{ marginTop: 20 }}>
        {LEGEND_ITEMS.map(({ label, color, cls }) => (
          <div key={label} className="fm-legend-item">
            <div
              className={`fm-legend-dot${cls ? ` ${cls}` : ''}`}
              style={{ background: color }}
            />
            {label}
          </div>
        ))}
        <div className="fm-legend-item" style={{ marginLeft: 'auto' }}>
          <div className="fm-legend-dot" style={{ background: 'var(--teal)', borderRadius: '50%' }} />
          Available
        </div>
        <div className="fm-legend-item">
          <div className="fm-legend-dot" style={{ background: 'var(--rose)', borderRadius: '50%' }} />
          Occupied
        </div>
        <div className="fm-legend-item">
          <div className="fm-legend-dot" style={{ background: 'var(--amber)', borderRadius: '50%' }} />
          Maintenance
        </div>
      </div>
    </div>
  );
}
