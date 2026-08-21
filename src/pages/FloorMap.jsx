import { useParams, NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useState } from 'react';
import { FLOORS, FLOOR_LABELS, UNDER_DEV_FLOORS } from '../utils/constants.js';
import { formatTimeRange } from '../utils/helpers.js';
import { X, CalendarCheck, Construction, HardHat } from 'lucide-react';
import './FloorMap.css';

// ─────────────────────────────────────────────────────────────────────────────
// STANDARD BLUEPRINT (Floors 1–5)
// Based on actual Vyas Building floor map photo (Floor 4).
// Same physical layout repeated each floor; room prefix = VY[floor]XX
//
// Canvas: 520 × 700
// Clipped top-left corner (angled like the real building)
// ─────────────────────────────────────────────────────────────────────────────
function standardBlueprint(f) {
  const p = f; // floor prefix digit
  const r = (n) => `VY${p}${String(n).padStart(2, '0')}`;

  return {
    w: 520,
    h: 700,
    clip: 'polygon(70px 0, 100% 0, 100% 100%, 0 100%, 0 70px)',
    rooms: [
      // ── Left wing — large classrooms ──────────────────────────────
      { name: r(1),  x: 18,  y: 18,  w: 132, h: 112, type: 'classroom' },
      { name: r(2),  x: 18,  y: 142, w: 132, h: 100, type: 'classroom' },
      { name: r(3),  x: 18,  y: 300, w: 132, h: 142, type: 'classroom' },
      { name: r(4),  x: 18,  y: 452, w: 132, h: 132, type: 'classroom' },

      // ── Top center — classrooms ────────────────────────────────────
      { name: r(24), x: 162, y: 18,  w: 112, h: 82,  type: 'classroom' },
      { name: r(22), x: 284, y: 18,  w: 110, h: 100, type: 'lab'       },

      // ── Far right — washrooms (stacked) ───────────────────────────
      { name: r(18), x: 404, y: 18,  w: 94,  h: 30,  type: 'washroom' },
      { name: r(17), x: 404, y: 52,  w: 94,  h: 30,  type: 'washroom' },
      { name: r(16), x: 404, y: 86,  w: 94,  h: 30,  type: 'washroom' },
      { name: r(15), x: 404, y: 120, w: 94,  h: 30,  type: 'washroom' },

      // ── Right middle — classrooms ──────────────────────────────────
      { name: r(14), x: 402, y: 158, w: 96,  h: 148, type: 'classroom' },
      { name: r(13), x: 402, y: 315, w: 96,  h: 140, type: 'classroom' },

      // ── Center — labs (2 × 2 grid) ────────────────────────────────
      { name: r(26), x: 162, y: 300, w: 110, h: 70,  type: 'lab' },
      { name: r(27), x: 162, y: 375, w: 110, h: 70,  type: 'lab' },
      { name: r(28), x: 162, y: 453, w: 110, h: 70,  type: 'lab' },
      { name: r(29), x: 162, y: 527, w: 110, h: 70,  type: 'lab' },

      // ── Bottom far right — washrooms ──────────────────────────────
      { name: r(8),  x: 410, y: 618, w: 88,  h: 30,  type: 'washroom' },
      { name: r(7),  x: 410, y: 652, w: 88,  h: 30,  type: 'washroom' },
    ],
    // Staircase / lift markers (left corridor strip)
    lifts: [
      { x: 18, y: 242 },
      { x: 18, y: 271 },
      { x: 18, y: 586 },
      { x: 18, y: 615 },
    ],
    // "You Are Here" entry marker
    entry: { x: 155, y: 225, label: 'Entry / Lift' },
  };
}

const FLOOR_BLUEPRINTS = {
  1: standardBlueprint(1),
  2: standardBlueprint(2),
  3: standardBlueprint(3),
  4: standardBlueprint(4),
  5: standardBlueprint(5),
};

// ── Type color mapping ────────────────────────────────────────────────────────
const TYPE_COLOR = {
  classroom: 'var(--fm-room-classroom)',
  lab:       'var(--fm-room-lab)',
  washroom:  'var(--fm-room-washroom)',
  faculty:   'var(--fm-room-faculty)',
};

const LEGEND_ITEMS = [
  { label: 'Classroom', color: 'var(--fm-room-classroom)' },
  { label: 'Lab',       color: 'var(--fm-room-lab)' },
  { label: 'Washroom',  color: 'var(--fm-room-washroom)' },
];

// ── Under Development screen ──────────────────────────────────────────────────
function UnderDevelopment({ floor }) {
  const label = FLOOR_LABELS[floor];
  const desc = {
    0: 'Ground floor map is being digitized. Check back soon.',
    6: 'Faculty cabin layout will be available once finalized.',
    7: 'Floor layout will be added once details are confirmed.',
    8: 'Seminar hall layout is being prepared.',
  }[floor] || 'This floor map is coming soon.';

  return (
    <div className="fm-under-dev">
      <div className="fm-under-dev-icon">
        <HardHat size={40} />
      </div>
      <h2>Under Development</h2>
      <p className="fm-under-dev-floor">{label}</p>
      <p className="fm-under-dev-desc">{desc}</p>
      <div className="fm-under-dev-badge">
        <Construction size={13} />
        Map Coming Soon
      </div>
    </div>
  );
}

// ── Room Panel ────────────────────────────────────────────────────────────────
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
        <button className="btn-icon" onClick={onClose} aria-label="Close panel"><X size={17} /></button>
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

// ── Main FloorMap ─────────────────────────────────────────────────────────────
export default function FloorMap() {
  const { floor: floorParam } = useParams();
  const floor = parseInt(floorParam ?? '1');
  const { rooms, allotments, subjects, faculty } = useApp();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [typeFilter, setTypeFilter]     = useState('all');

  const isUnderDev = UNDER_DEV_FLOORS.has(floor);
  const floorRooms = rooms.filter(r => r.floor === floor);
  const blueprint  = FLOOR_BLUEPRINTS[floor];

  // Room name → db object
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
          <p>
            {FLOOR_LABELS[floor]}
            {!isUnderDev && ` — ${floorRooms.length} rooms`}
          </p>
        </div>

        {/* Floor tabs */}
        <div className="fm-floor-tabs">
          {FLOORS.map(f => (
            <NavLink
              key={f}
              to={`/floors/${f}`}
              className={`fm-floor-tab${f === floor ? ' active' : ''}${UNDER_DEV_FLOORS.has(f) ? ' dev' : ''}`}
              onClick={() => setSelectedRoom(null)}
            >
              {f}
              {UNDER_DEV_FLOORS.has(f) && <span className="fm-tab-dev-dot" title="Under Development" />}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Under Development screen */}
      {isUnderDev ? (
        <UnderDevelopment floor={floor} />
      ) : (
        <>
          {/* Type filter chips */}
          <div className="fm-filters" style={{ marginBottom: 16 }}>
            {[
              { value: 'all',       label: 'All' },
              { value: 'classroom', label: 'Classrooms' },
              { value: 'lab',       label: 'Labs' },
              { value: 'washroom',  label: 'Washrooms' },
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
              <div
                className="fm-building"
                style={{
                  width:    blueprint.w,
                  height:   blueprint.h,
                  clipPath: blueprint.clip || undefined,
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                {/* Corridor / entry marker */}
                {blueprint.entry && (
                  <div
                    className="fm-entry-marker"
                    style={{ left: blueprint.entry.x, top: blueprint.entry.y }}
                  >
                    <span className="fm-entry-dot" />
                    <span className="fm-entry-label">{blueprint.entry.label}</span>
                  </div>
                )}

                {/* Lift markers */}
                {blueprint.lifts.map((l, i) => (
                  <div key={i} className="fm-lift" style={{ left: l.x, top: l.y }}>L</div>
                ))}

                {/* Rooms */}
                {blueprint.rooms.map(r => {
                  const dbRoom   = roomMap[r.name];
                  const isFiltered = typeFilter !== 'all' && r.type !== typeFilter;
                  const color    = TYPE_COLOR[r.type] || TYPE_COLOR.classroom;
                  const status   = dbRoom?.status || null;
                  const isWashroom = r.type === 'washroom';

                  return (
                    <div
                      key={r.name}
                      className={`fm-room${selectedRoom?.name === r.name ? ' selected' : ''}${isWashroom ? ' washroom' : ''}`}
                      style={{
                        left:          r.x,
                        top:           r.y,
                        width:         r.w,
                        height:        r.h,
                        background:    color,
                        opacity:       isFiltered ? 0.15 : 1,
                        pointerEvents: isFiltered ? 'none' : (isWashroom ? 'none' : 'auto'),
                        cursor:        isWashroom ? 'default' : 'pointer',
                      }}
                      onClick={() => !isWashroom && handleRoomClick(r.name)}
                      title={r.name}
                    >
                      <div className="fm-room-name">{r.name}</div>
                      {r.h > 60 && dbRoom && (
                        <div className="fm-room-cap">{dbRoom.capacity}</div>
                      )}
                      {status && !isWashroom && (
                        <div className={`fm-room-status ${status}`} />
                      )}
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
            {LEGEND_ITEMS.map(({ label, color }) => (
              <div key={label} className="fm-legend-item">
                <div className="fm-legend-dot" style={{ background: color }} />
                {label}
              </div>
            ))}
            <div className="fm-legend-sep" />
            <div className="fm-legend-item">
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
        </>
      )}
    </div>
  );
}
