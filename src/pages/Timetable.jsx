import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { DAYS, TIME_SLOTS, FLOORS, FLOOR_LABELS } from '../utils/constants.js';
import { formatTime } from '../utils/helpers.js';
import { Clock, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import './Timetable.css';

const SUBJECT_COLORS = [
  '#4f8cff','#00d4aa','#ffb347','#b47aff','#ff6b6b',
  '#00c9ff','#f7971e','#a8edea','#ffecd2','#c3cfe2',
];

function useSubjectColors(subjects) {
  const map = {};
  subjects.forEach((s, i) => {
    map[s.id] = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
  });
  return map;
}

export default function Timetable() {
  const { rooms, subjects, faculty, allotments } = useApp();
  const [viewMode, setViewMode]   = useState('room');   // room | faculty | floor
  const [selectedId, setSelectedId] = useState('');
  const [selectedFloor, setSelectedFloor] = useState(1);
  const printRef = useRef(null);
  const subjectColors = useSubjectColors(subjects);

  const handlePrint = async () => {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, { backgroundColor: '#0a0e27', scale: 2 });
    const link = document.createElement('a');
    link.download = `timetable-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // ── Room Timetable ──────────────────────────────
  const renderRoomTimetable = () => {
    const room = rooms.find(r => r.id === selectedId);
    const roomAllots = allotments.filter(a => a.roomId === selectedId);

    return (
      <div>
        <div className="timetable-selector">
          <label className="form-label">Select Room</label>
          <select
            id="tt-room-select"
            className="form-select"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            style={{ maxWidth: 280 }}
          >
            <option value="">Choose a room…</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name} (F{r.floor})</option>)}
          </select>
        </div>
        {selectedId && room && (
          <div ref={printRef}>
            <div className="timetable-title">
              {room.name} — Weekly Timetable
              <span className="text-muted" style={{ fontSize: '0.85rem', marginLeft: 12 }}>
                Cap: {room.capacity}
              </span>
            </div>
            <TimetableGrid
              allotments={roomAllots}
              subjects={subjects}
              faculty={faculty}
              subjectColors={subjectColors}
            />
          </div>
        )}
        {!selectedId && <div className="empty-state"><Clock size={40} /><p>Select a room to view its timetable</p></div>}
      </div>
    );
  };

  // ── Faculty Timetable ───────────────────────────
  const renderFacultyTimetable = () => {
    const fac = faculty.find(f => f.id === selectedId);
    const facAllots = allotments.filter(a => a.facultyId === selectedId);

    return (
      <div>
        <div className="timetable-selector">
          <label className="form-label">Select Faculty</label>
          <select
            id="tt-faculty-select"
            className="form-select"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            style={{ maxWidth: 280 }}
          >
            <option value="">Choose faculty…</option>
            {faculty.map(f => <option key={f.id} value={f.id}>{f.name} — {f.department}</option>)}
          </select>
        </div>
        {selectedId && fac && (
          <div ref={printRef}>
            <div className="timetable-title">
              {fac.name} — Weekly Schedule
              <span className="text-muted" style={{ fontSize: '0.85rem', marginLeft: 12 }}>
                {fac.department}
              </span>
            </div>
            <TimetableGrid
              allotments={facAllots}
              subjects={subjects}
              faculty={faculty}
              rooms={rooms}
              showRoom
              subjectColors={subjectColors}
            />
          </div>
        )}
        {!selectedId && <div className="empty-state"><Clock size={40} /><p>Select faculty to view schedule</p></div>}
      </div>
    );
  };

  // ── Floor Timetable ─────────────────────────────
  const renderFloorTimetable = () => {
    const floorRooms = rooms.filter(r => r.floor === selectedFloor);
    return (
      <div>
        <div className="timetable-selector">
          <label className="form-label">Select Floor</label>
          <select
            id="tt-floor-select"
            className="form-select"
            value={selectedFloor}
            onChange={e => setSelectedFloor(parseInt(e.target.value))}
            style={{ maxWidth: 220 }}
          >
            {FLOORS.map(f => <option key={f} value={f}>Floor {f} — {FLOOR_LABELS[f]}</option>)}
          </select>
        </div>
        <div ref={printRef}>
          <div className="timetable-title">Floor {selectedFloor} — {FLOOR_LABELS[selectedFloor]}</div>
          {floorRooms.length === 0 ? (
            <div className="empty-state"><p>No rooms on this floor yet.</p></div>
          ) : (
            floorRooms.map(room => {
              const roomAllots = allotments.filter(a => a.roomId === room.id);
              return (
                <div key={room.id} className="floor-tt-section">
                  <div className="floor-tt-room-label">{room.name} <span className="text-muted">· Cap {room.capacity}</span></div>
                  <TimetableGrid
                    allotments={roomAllots}
                    subjects={subjects}
                    faculty={faculty}
                    subjectColors={subjectColors}
                    compact
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in">
      <div className="page-header-row">
        <div className="page-header">
          <h1><Clock size={28} style={{ verticalAlign: 'middle' }} /> Timetable</h1>
          <p>View room, faculty, and floor-wise weekly schedules</p>
        </div>
        <button id="export-timetable-btn" className="btn btn-secondary" onClick={handlePrint}>
          <Printer size={16} /> Export as Image
        </button>
      </div>

      {/* View mode tabs */}
      <div className="tt-mode-tabs">
        {[
          { key: 'room',    label: 'Room-wise' },
          { key: 'faculty', label: 'Faculty-wise' },
          { key: 'floor',   label: 'Floor-wise' },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`tt-mode-tab ${viewMode === key ? 'active' : ''}`}
            onClick={() => { setViewMode(key); setSelectedId(''); }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 'var(--space-lg)' }}>
        {viewMode === 'room'    && renderRoomTimetable()}
        {viewMode === 'faculty' && renderFacultyTimetable()}
        {viewMode === 'floor'   && renderFloorTimetable()}
      </div>
    </div>
  );
}

// ── Timetable Grid Component ────────────────────────────────────────────────
function TimetableGrid({ allotments, subjects, faculty, rooms, subjectColors, showRoom = false, compact = false }) {
  const getCell = (day, slot) => {
    return allotments.filter(a => {
      if (a.day !== day) return false;
      return a.startTime <= slot && slot < a.endTime;
    });
  };

  return (
    <div className={`tt-grid-wrapper ${compact ? 'compact' : ''}`}>
      <table className="tt-table">
        <thead>
          <tr>
            <th className="tt-th-time">Time</th>
            {DAYS.map(d => <th key={d} className="tt-th-day">{d.slice(0, 3)}</th>)}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.slice(0, -1).map(slot => (
            <tr key={slot}>
              <td className="tt-time-cell">{formatTime(slot)}</td>
              {DAYS.map(day => {
                const cells = getCell(day, slot);
                return (
                  <td key={day} className="tt-cell">
                    {cells.map(a => {
                      const sub = subjects.find(s => s.id === a.subjectId);
                      const fac = faculty.find(f => f.id === a.facultyId);
                      const room= rooms?.find(r => r.id === a.roomId);
                      const color = subjectColors[a.subjectId] || 'var(--blue-primary)';
                      return (
                        <div
                          key={a.id}
                          className="tt-slot"
                          style={{
                            background: `${color}22`,
                            borderLeft: `3px solid ${color}`,
                            borderRadius: 4,
                          }}
                        >
                          <div className="tt-slot-subject">{sub?.name || '?'}</div>
                          {!compact && (
                            <>
                              <div className="tt-slot-meta">{fac?.name || '—'}</div>
                              {showRoom && <div className="tt-slot-meta">{room?.name || '—'}</div>}
                              {a.section && <div className="tt-slot-meta">Sec {a.section}</div>}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
