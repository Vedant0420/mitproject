import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, DoorOpen, FlaskConical, CalendarCheck,
  Users, CheckCircle, AlertCircle, Wrench, Search,
  ChevronDown, Eye, Pencil, LayoutGrid, List,
  Building2, Clock, BookOpen, ArrowRight
} from 'lucide-react';
import { FLOORS, FLOOR_LABELS, ROOM_TYPES, ROOM_STATUSES } from '../utils/constants.js';
import { formatTimeRange, getRoomTypeColor } from '../utils/helpers.js';
import { api } from '../utils/api.js';
import './AdminPanel.css';

// ── Status icon helper ─────────────────────────────────
function StatusIcon({ status, size = 16 }) {
  if (status === 'available')   return <CheckCircle size={size} color="var(--teal)" />;
  if (status === 'occupied')    return <AlertCircle size={size} color="var(--rose)" />;
  if (status === 'maintenance') return <Wrench      size={size} color="var(--amber)" />;
  return null;
}

// ── Stat card ─────────────────────────────────────────
function AdminStat({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <div className="card admin-stat card-lift" style={{ '--acc': color }}>
      <div className="admin-stat-icon" style={{ background: bg }}>
        <Icon size={20} color={color} />
      </div>
      <div className="admin-stat-val">{value}</div>
      <div className="admin-stat-label">{label}</div>
      {sub && <div className="admin-stat-sub">{sub}</div>}
    </div>
  );
}

// ── Room status badge pill ─────────────────────────────
function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

export default function AdminPanel() {
  const { rooms, allotments, subjects, faculty, updateRoom, toast } = useApp();
  const navigate = useNavigate();

  // ── Filters ──
  const [search,       setSearch]       = useState('');
  const [filterFloor,  setFilterFloor]  = useState('all');
  const [filterType,   setFilterType]   = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDay,    setFilterDay]    = useState('all');
  const [viewMode,     setViewMode]     = useState('grid'); // 'grid' | 'table'
  const [expandFloor,  setExpandFloor]  = useState(null);

  // ── Stats ──
  const stats = useMemo(() => {
    const total       = rooms.length;
    const available   = rooms.filter(r => r.status === 'available').length;
    const occupied    = rooms.filter(r => r.status === 'occupied').length;
    const maintenance = rooms.filter(r => r.status === 'maintenance').length;
    const labs        = rooms.filter(r => r.type === 'lab').length;
    const allotted    = new Set(allotments.map(a => a.roomId)).size;
    return { total, available, occupied, maintenance, labs, allotted };
  }, [rooms, allotments]);

  // ── Filtered rooms ──
  const filtered = useMemo(() => rooms.filter(r => {
    if (filterFloor  !== 'all' && r.floor  !== parseInt(filterFloor)) return false;
    if (filterType   !== 'all' && r.type   !== filterType)            return false;
    if (filterStatus !== 'all' && r.status !== filterStatus)          return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [rooms, filterFloor, filterType, filterStatus, search]);

  // ── Allotments for a room (optionally filtered by day) ──
  const getRoomAllotments = (roomId) => {
    return allotments.filter(a =>
      a.roomId === roomId &&
      (filterDay === 'all' || a.day === filterDay)
    );
  };

  // ── Quick status change ──
  const changeStatus = async (room, newStatus) => {
    try {
      await updateRoom(room.id, { ...room, status: newStatus });
    } catch (e) {
      toast('Failed to update status', 'error');
    }
  };

  // ── Rooms grouped by floor ──
  const byFloor = useMemo(() => {
    const map = {};
    FLOORS.forEach(f => { map[f] = filtered.filter(r => r.floor === f); });
    return map;
  }, [filtered]);

  // ── Currently allotted rooms (any allotment exists) ──
  const allottedRoomIds = useMemo(() => new Set(allotments.map(a => a.roomId)), [allotments]);

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header-row">
        <div className="page-header">
          <h1><ShieldCheck size={28} style={{ verticalAlign: 'middle' }} /> Admin Panel</h1>
          <p>Live overview of all rooms, allotments, and occupancy across Vyas Building</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/rooms')}>
            <DoorOpen size={16} /> Manage Rooms
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/allotments')}>
            <CalendarCheck size={16} /> Manage Allotments
          </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="admin-stats-grid">
        <AdminStat icon={DoorOpen}      label="Total Rooms"    value={stats.total}       color="var(--blue-primary)" bg="rgba(79,140,255,0.12)" />
        <AdminStat icon={CheckCircle}   label="Available"      value={stats.available}   color="var(--teal)"         bg="rgba(0,212,170,0.12)"  sub={`${Math.round((stats.available/Math.max(stats.total,1))*100)}% of total`} />
        <AdminStat icon={AlertCircle}   label="Occupied"       value={stats.occupied}    color="var(--rose)"         bg="rgba(255,107,107,0.12)"sub={`${Math.round((stats.occupied/Math.max(stats.total,1))*100)}% of total`} />
        <AdminStat icon={Wrench}        label="Maintenance"    value={stats.maintenance} color="var(--amber)"        bg="rgba(255,179,71,0.12)" />
        <AdminStat icon={CalendarCheck} label="Allotted Rooms" value={stats.allotted}    color="var(--purple)"       bg="rgba(180,122,255,0.12)"sub="have ≥1 allotment" />
        <AdminStat icon={FlaskConical}  label="Labs"           value={stats.labs}        color="var(--teal)"         bg="rgba(0,212,170,0.12)" />
      </div>

      {/* ── Floor Utilization Bar ── */}
      <div className="card admin-floor-util">
        <h3 className="admin-section-title"><Building2 size={16} /> Floor Utilization</h3>
        <div className="floor-util-bars">
          {FLOORS.map(f => {
            const flRooms   = rooms.filter(r => r.floor === f);
            const flAllot   = allotments.filter(a => flRooms.some(r => r.id === a.roomId));
            const flOcc     = flRooms.filter(r => r.status === 'occupied').length;
            const flAvail   = flRooms.filter(r => r.status === 'available').length;
            const flMaint   = flRooms.filter(r => r.status === 'maintenance').length;
            const utilPct   = flRooms.length ? Math.round((flAllot.length / (flRooms.length * 6)) * 100) : 0;
            return (
              <div
                key={f}
                className="util-floor-row"
                onClick={() => navigate(`/floors/${f}`)}
                title={`Go to Floor ${f} map`}
              >
                <div className="util-floor-label">
                  <span className="floor-num">{f}</span>
                  <span>{FLOOR_LABELS[f]}</span>
                </div>
                <div className="util-stacked-bar">
                  {flRooms.length > 0 && (
                    <>
                      <div className="util-bar-seg occ"   style={{ width: `${(flOcc/flRooms.length)*100}%` }} title={`${flOcc} occupied`}/>
                      <div className="util-bar-seg avail" style={{ width: `${(flAvail/flRooms.length)*100}%` }} title={`${flAvail} available`}/>
                      <div className="util-bar-seg maint" style={{ width: `${(flMaint/flRooms.length)*100}%` }} title={`${flMaint} maintenance`}/>
                    </>
                  )}
                </div>
                <div className="util-meta">
                  <span>{flRooms.length} rooms</span>
                  <span>{flAllot.length} slots</span>
                  <span className="util-pct">{utilPct}%</span>
                </div>
                <ArrowRight size={14} color="var(--text-muted)" />
              </div>
            );
          })}
        </div>
        <div className="util-legend">
          <span><span className="util-dot occ"/>Occupied</span>
          <span><span className="util-dot avail"/>Available</span>
          <span><span className="util-dot maint"/>Maintenance</span>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="filter-bar" style={{ marginTop: 'var(--space-xl)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
          <input
            id="admin-search"
            className="form-input"
            placeholder="Search rooms…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32, maxWidth: 200 }}
          />
        </div>
        <select id="admin-filter-floor" className="form-select" value={filterFloor} onChange={e => setFilterFloor(e.target.value)} style={{ maxWidth: 170 }}>
          <option value="all">All Floors</option>
          {FLOORS.map(f => <option key={f} value={f}>Floor {f} — {FLOOR_LABELS[f]}</option>)}
        </select>
        <select id="admin-filter-type" className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ maxWidth: 155 }}>
          <option value="all">All Types</option>
          {ROOM_TYPES.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
        </select>
        <select id="admin-filter-status" className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ maxWidth: 155 }}>
          <option value="all">All Statuses</option>
          {ROOM_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select id="admin-filter-day" className="form-select" value={filterDay} onChange={e => setFilterDay(e.target.value)} style={{ maxWidth: 140 }}>
          <option value="all">All Days</option>
          {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d =>
            <option key={d} value={d}>{d}</option>
          )}
        </select>
        <span className="text-muted">{filtered.length} room{filtered.length !== 1 ? 's' : ''}</span>
        {/* View toggle */}
        <div className="view-toggle" style={{ marginLeft: 'auto' }}>
          <button
            id="admin-grid-view"
            className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          ><LayoutGrid size={16} /></button>
          <button
            id="admin-table-view"
            className={`btn-icon ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Table view"
          ><List size={16} /></button>
        </div>
      </div>

      {/* ── Grid View ── */}
      {viewMode === 'grid' && (
        <div className="admin-floor-sections">
          {FLOORS.map(f => {
            const fRooms = byFloor[f];
            if (fRooms.length === 0) return null;
            const isExpanded = expandFloor === null || expandFloor === f;
            return (
              <div key={f} className="admin-floor-section card">
                <div
                  className="admin-floor-header"
                  onClick={() => setExpandFloor(expandFloor === f ? null : f)}
                >
                  <div className="afl-left">
                    <span className="floor-num">{f}</span>
                    <span className="afl-name">{FLOOR_LABELS[f]}</span>
                    <span className="afl-count">{fRooms.length} rooms</span>
                  </div>
                  <div className="afl-pills">
                    {['available','occupied','maintenance'].map(st => {
                      const c = fRooms.filter(r => r.status === st).length;
                      if (!c) return null;
                      return <span key={st} className={`badge badge-${st}`}>{c} {st}</span>;
                    })}
                  </div>
                  <ChevronDown
                    size={18}
                    style={{
                      marginLeft: 'auto',
                      color: 'var(--text-muted)',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }}
                  />
                </div>

                {isExpanded && (
                  <div className="admin-room-grid">
                    {fRooms.map(room => {
                      const roomAllots = getRoomAllotments(room.id);
                      const hasAllot   = allottedRoomIds.has(room.id);
                      const typeColor  = getRoomTypeColor(room.type);
                      return (
                        <div
                          key={room.id}
                          className={`admin-room-card ${room.status}`}
                          style={{ '--tc': typeColor }}
                        >
                          {/* Top bar: type color stripe */}
                          <div className="arc-stripe" />

                          <div className="arc-header">
                            <div className="arc-name">{room.name}</div>
                            <StatusIcon status={room.status} size={15} />
                          </div>

                          <div className="arc-meta">
                            <span className={`badge badge-${room.type}`} style={{ fontSize: '0.68rem' }}>
                              {ROOM_TYPES.find(t => t.value === room.type)?.label}
                            </span>
                            <span className="arc-cap">{room.capacity}</span>
                          </div>

                          {/* Allotments */}
                          {roomAllots.length > 0 ? (
                            <div className="arc-allots">
                              {roomAllots.slice(0, 3).map(a => {
                                const sub = subjects.find(s => s.id === a.subjectId);
                                const fac = faculty.find(f => f.id === a.facultyId);
                                return (
                                  <div key={a.id} className="arc-allot-row">
                                    <span className="arc-day">{a.day.slice(0,3)}</span>
                                    <span className="arc-subj">{sub?.name || '?'}</span>
                                    <span className="arc-time">{a.startTime}</span>
                                  </div>
                                );
                              })}
                              {roomAllots.length > 3 && (
                                <div className="arc-more">+{roomAllots.length - 3} more slots</div>
                              )}
                            </div>
                          ) : (
                            <div className="arc-empty">No allotments{filterDay !== 'all' ? ` on ${filterDay}` : ''}</div>
                          )}

                          {/* Status switcher */}
                          <div className="arc-actions">
                            <select
                              className="arc-status-select"
                              value={room.status}
                              onChange={e => changeStatus(room, e.target.value)}
                              onClick={e => e.stopPropagation()}
                              title="Change status"
                            >
                              {ROOM_STATUSES.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                              ))}
                            </select>
                            <button
                              className="btn-icon"
                              style={{ padding: 5 }}
                              title="View on floor map"
                              onClick={() => navigate(`/floors/${room.floor}`)}
                            >
                              <Eye size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Table View ── */}
      {viewMode === 'table' && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Room</th>
                <th>Floor</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Allotments</th>
                <th>Subject(s)</th>
                <th>Faculty</th>
                <th>Change Status</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(room => {
                const roomAllots = getRoomAllotments(room.id);
                const typeColor  = getRoomTypeColor(room.type);
                return (
                  <tr key={room.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ width:10, height:10, borderRadius:'50%', background: typeColor, flexShrink:0 }} />
                        <strong>{room.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono" style={{ fontSize:'0.8rem' }}>
                        F{room.floor} — {FLOOR_LABELS[room.floor]}
                      </span>
                    </td>
                    <td><span className={`badge badge-${room.type}`}>{ROOM_TYPES.find(t=>t.value===room.type)?.label}</span></td>
                    <td className="font-mono">{room.capacity}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <StatusIcon status={room.status} size={14} />
                        <StatusBadge status={room.status} />
                      </div>
                    </td>
                    <td>
                      <span className="font-mono" style={{
                        color: roomAllots.length ? 'var(--blue-light)' : 'var(--text-muted)',
                        fontWeight: roomAllots.length ? 700 : 400,
                      }}>
                        {roomAllots.length}
                      </span>
                    </td>
                    <td style={{ maxWidth: 200 }}>
                      {roomAllots.length === 0 ? <span className="text-muted">—</span> : (
                        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                          {[...new Set(roomAllots.map(a => a.subjectId))].slice(0,2).map(sid => {
                            const sub = subjects.find(s => s.id === sid);
                            return <span key={sid} className="chip" style={{ fontSize:'0.72rem' }}>{sub?.code || '?'}</span>;
                          })}
                          {roomAllots.length > 2 && <span className="text-muted" style={{ fontSize:'0.72rem' }}>+more</span>}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>
                      {roomAllots.length === 0 ? '—' :
                        [...new Set(roomAllots.map(a => {
                          const f = faculty.find(fc => fc.id === a.facultyId);
                          return f?.name;
                        }).filter(Boolean))].join(', ')}
                    </td>
                    <td>
                      <select
                        className="form-select"
                        style={{ padding:'4px 8px', fontSize:'0.78rem', maxWidth:130 }}
                        value={room.status}
                        onChange={e => changeStatus(room, e.target.value)}
                      >
                        {ROOM_STATUSES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn-icon"
                        title="View floor map"
                        onClick={() => navigate(`/floors/${room.floor}`)}
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="empty-state card" style={{ padding:'var(--space-2xl)', marginTop:'var(--space-lg)' }}>
          <DoorOpen size={48} />
          <h3 style={{ marginTop:'var(--space-md)' }}>No rooms match your filters</h3>
          <p>Try adjusting the search or filter options above</p>
        </div>
      )}

      {/* ── Live Allotments Feed ── */}
      <div className="card admin-allot-feed">
        <div className="admin-section-title" style={{ marginBottom:'var(--space-md)', display:'flex', alignItems:'center', gap:8 }}>
          <Clock size={15} /> Live Allotment Feed
          <span className="text-muted" style={{ marginLeft:'auto', fontSize:'0.75rem' }}>
            {allotments.length} total allotments
          </span>
        </div>
        {allotments.length === 0 ? (
          <p className="text-muted">No allotments created yet.</p>
        ) : (
          <div className="allot-feed-grid">
            {[...allotments]
              .sort((a, b) => {
                const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                return days.indexOf(a.day) - days.indexOf(b.day) || a.startTime.localeCompare(b.startTime);
              })
              .map(a => {
                const room    = rooms.find(r => r.id === a.roomId);
                const subject = subjects.find(s => s.id === a.subjectId);
                const fac     = faculty.find(f => f.id === a.facultyId);
                const tc      = getRoomTypeColor(room?.type || 'classroom');
                return (
                  <div key={a.id} className="allot-feed-card" style={{ '--tc': tc }}>
                    <div className="afc-day">{a.day.slice(0,3).toUpperCase()}</div>
                    <div className="afc-body">
                      <div className="afc-room">{room?.name || '—'}
                        <span style={{ marginLeft:6, fontSize:'0.7rem', color:'var(--text-muted)' }}>F{room?.floor}</span>
                      </div>
                      <div className="afc-subject">{subject?.name || '—'}</div>
                      <div className="afc-meta">
                        <span>{fac?.name || '—'}</span>
                        <span>·</span>
                        <span className="font-mono">{formatTimeRange(a.startTime, a.endTime)}</span>
                        {a.section && <><span>·</span><span>Sec {a.section}</span></>}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
