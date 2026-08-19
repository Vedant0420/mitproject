import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import Modal from '../components/Modal.jsx';
import { DEPARTMENTS } from '../utils/constants.js';
import { nanoid } from '../utils/nanoid.js';
import { Plus, Pencil, Trash2, Users, BookOpen, Search } from 'lucide-react';
import './FacultySubjects.css';

const EMPTY_FAC = { name: '', department: '', email: '', subjects: [] };
const EMPTY_SUB = { name: '', code: '', department: '', type: 'theory' };

export default function FacultySubjects() {
  const {
    faculty, subjects,
    createFaculty, updateFaculty, deleteFaculty,
    createSubject, updateSubject, deleteSubject,
  } = useApp();

  const [tab, setTab] = useState('faculty');
  const [search, setSearch] = useState('');

  // Faculty state
  const [facModal, setFacModal] = useState(false);
  const [editFac, setEditFac]   = useState(null);
  const [facForm, setFacForm]   = useState({ ...EMPTY_FAC });
  const [savingFac, setSavingFac] = useState(false);
  const [confirmFac, setConfirmFac] = useState(null);

  // Subject state
  const [subModal, setSubModal] = useState(false);
  const [editSub, setEditSub]   = useState(null);
  const [subForm, setSubForm]   = useState({ ...EMPTY_SUB });
  const [savingSub, setSavingSub] = useState(false);
  const [confirmSub, setConfirmSub] = useState(null);

  // Filtered lists
  const filteredFac = faculty.filter(f =>
    !search || f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.department.toLowerCase().includes(search.toLowerCase())
  );
  const filteredSub = subjects.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  // Faculty CRUD
  const openCreateFac = () => { setEditFac(null); setFacForm({ ...EMPTY_FAC }); setFacModal(true); };
  const openEditFac   = (f)  => { setEditFac(f); setFacForm({ ...f }); setFacModal(true); };
  const saveFac = async () => {
    if (!facForm.name.trim()) return;
    setSavingFac(true);
    try {
      if (editFac) await updateFaculty(editFac.id, facForm);
      else         await createFaculty({ ...facForm, id: `fac-${nanoid(6)}` });
      setFacModal(false);
    } finally { setSavingFac(false); }
  };

  // Subject CRUD
  const openCreateSub = () => { setEditSub(null); setSubForm({ ...EMPTY_SUB }); setSubModal(true); };
  const openEditSub   = (s)  => { setEditSub(s); setSubForm({ ...s }); setSubModal(true); };
  const saveSub = async () => {
    if (!subForm.name.trim() || !subForm.code.trim()) return;
    setSavingSub(true);
    try {
      if (editSub) await updateSubject(editSub.id, subForm);
      else         await createSubject({ ...subForm, id: `sub-${nanoid(6)}` });
      setSubModal(false);
    } finally { setSavingSub(false); }
  };

  return (
    <div className="fade-in">
      <div className="page-header-row">
        <div className="page-header">
          <h1><Users size={28} style={{ verticalAlign: 'middle' }} /> Faculty & Subjects</h1>
          <p>Manage faculty members, departments, and subjects</p>
        </div>
        <div className="page-actions">
          {tab === 'faculty' && (
            <button id="add-faculty-btn" className="btn btn-primary" onClick={openCreateFac}>
              <Plus size={18} /> Add Faculty
            </button>
          )}
          {tab === 'subjects' && (
            <button id="add-subject-btn" className="btn btn-primary" onClick={openCreateSub}>
              <Plus size={18} /> Add Subject
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="fs-tabs">
        <button className={`fs-tab ${tab === 'faculty' ? 'active' : ''}`} onClick={() => { setTab('faculty'); setSearch(''); }}>
          <Users size={16} /> Faculty ({faculty.length})
        </button>
        <button className={`fs-tab ${tab === 'subjects' ? 'active' : ''}`} onClick={() => { setTab('subjects'); setSearch(''); }}>
          <BookOpen size={16} /> Subjects ({subjects.length})
        </button>
      </div>

      {/* Search */}
      <div className="filter-bar">
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
          <input
            id="fs-search"
            className="form-input"
            placeholder={tab === 'faculty' ? 'Search faculty…' : 'Search subjects…'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32, maxWidth: 260 }}
          />
        </div>
      </div>

      {/* Faculty Table */}
      {tab === 'faculty' && (
        filteredFac.length === 0 ? (
          <div className="empty-state card" style={{ padding: 'var(--space-2xl)' }}>
            <Users size={48} />
            <h3 style={{ marginTop: 'var(--space-md)' }}>No faculty found</h3>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Subjects</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFac.map(f => (
                  <tr key={f.id}>
                    <td><strong>{f.name}</strong></td>
                    <td>
                      <span className="badge" style={{ background:'rgba(180,122,255,0.12)', color:'var(--purple)', border:'1px solid rgba(180,122,255,0.25)' }}>
                        {f.department}
                      </span>
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {f.email || '—'}
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                        {(f.subjects || []).map(sid => {
                          const sub = subjects.find(s => s.id === sid);
                          return sub ? (
                            <span key={sid} className="chip">{sub.code}</span>
                          ) : null;
                        })}
                        {(!f.subjects || f.subjects.length === 0) && <span className="text-muted">—</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn-icon" onClick={() => openEditFac(f)}><Pencil size={15} /></button>
                        <button className="btn-icon" onClick={() => setConfirmFac(f)} style={{ color:'var(--rose)' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Subjects Table */}
      {tab === 'subjects' && (
        filteredSub.length === 0 ? (
          <div className="empty-state card" style={{ padding: 'var(--space-2xl)' }}>
            <BookOpen size={48} />
            <h3 style={{ marginTop: 'var(--space-md)' }}>No subjects found</h3>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Subject Name</th>
                  <th>Code</th>
                  <th>Department</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSub.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong></td>
                    <td className="font-mono" style={{ color: 'var(--blue-light)' }}>{s.code}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.department}</td>
                    <td>
                      <span className={`badge ${s.type === 'practical' ? 'badge-lab' : 'badge-classroom'}`}>
                        {s.type === 'practical' ? 'Practical' : 'Theory'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn-icon" onClick={() => openEditSub(s)}><Pencil size={15} /></button>
                        <button className="btn-icon" onClick={() => setConfirmSub(s)} style={{ color:'var(--rose)' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ── Faculty Modal ── */}
      <Modal open={facModal} onClose={() => setFacModal(false)} title={editFac ? 'Edit Faculty' : 'Add Faculty'} size="md">
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-md)' }}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input id="fac-name" className="form-input" placeholder="Dr. Full Name"
                value={facForm.name} onChange={e => setFacForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select id="fac-dept" className="form-select" value={facForm.department}
                onChange={e => setFacForm(f => ({ ...f, department: e.target.value }))}>
                <option value="">Select department…</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input id="fac-email" className="form-input" type="email" placeholder="email@vyas.edu"
              value={facForm.email} onChange={e => setFacForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Assigned Subjects</label>
            <div className="checkbox-group">
              {subjects.map(s => {
                const checked = (facForm.subjects || []).includes(s.id);
                return (
                  <label key={s.id} className={`checkbox-chip ${checked ? 'active' : ''}`}>
                    <input type="checkbox" checked={checked} onChange={() =>
                      setFacForm(f => ({
                        ...f,
                        subjects: checked
                          ? f.subjects.filter(x => x !== s.id)
                          : [...(f.subjects || []), s.id],
                      }))
                    } />
                    {s.code} — {s.name}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setFacModal(false)}>Cancel</button>
          <button id="save-faculty-btn" className="btn btn-primary" onClick={saveFac}
            disabled={savingFac || !facForm.name.trim()}>
            {savingFac ? 'Saving…' : editFac ? 'Update' : 'Add Faculty'}
          </button>
        </div>
      </Modal>

      {/* ── Subject Modal ── */}
      <Modal open={subModal} onClose={() => setSubModal(false)} title={editSub ? 'Edit Subject' : 'Add Subject'} size="md">
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-md)' }}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Subject Name *</label>
              <input id="sub-name" className="form-input" placeholder="e.g. Data Structures"
                value={subForm.name} onChange={e => setSubForm(s => ({ ...s, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Subject Code *</label>
              <input id="sub-code" className="form-input font-mono" placeholder="e.g. CS301"
                value={subForm.code} onChange={e => setSubForm(s => ({ ...s, code: e.target.value.toUpperCase() }))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department</label>
              <select id="sub-dept" className="form-select" value={subForm.department}
                onChange={e => setSubForm(s => ({ ...s, department: e.target.value }))}>
                <option value="">Select department…</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select id="sub-type" className="form-select" value={subForm.type}
                onChange={e => setSubForm(s => ({ ...s, type: e.target.value }))}>
                <option value="theory">Theory</option>
                <option value="practical">Practical</option>
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setSubModal(false)}>Cancel</button>
          <button id="save-subject-btn" className="btn btn-primary" onClick={saveSub}
            disabled={savingSub || !subForm.name.trim() || !subForm.code.trim()}>
            {savingSub ? 'Saving…' : editSub ? 'Update' : 'Add Subject'}
          </button>
        </div>
      </Modal>

      {/* Delete faculty */}
      <Modal open={!!confirmFac} onClose={() => setConfirmFac(null)} title="Remove Faculty" size="sm">
        <p style={{ color:'var(--text-secondary)' }}>
          Remove <strong style={{ color:'var(--text-primary)' }}>{confirmFac?.name}</strong>? This cannot be undone.
        </p>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setConfirmFac(null)}>Cancel</button>
          <button id="confirm-delete-fac-btn" className="btn btn-danger"
            onClick={async () => { await deleteFaculty(confirmFac.id); setConfirmFac(null); }}>
            <Trash2 size={15} /> Remove
          </button>
        </div>
      </Modal>

      {/* Delete subject */}
      <Modal open={!!confirmSub} onClose={() => setConfirmSub(null)} title="Remove Subject" size="sm">
        <p style={{ color:'var(--text-secondary)' }}>
          Remove <strong style={{ color:'var(--text-primary)' }}>{confirmSub?.name}</strong>?
        </p>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setConfirmSub(null)}>Cancel</button>
          <button id="confirm-delete-sub-btn" className="btn btn-danger"
            onClick={async () => { await deleteSubject(confirmSub.id); setConfirmSub(null); }}>
            <Trash2 size={15} /> Remove
          </button>
        </div>
      </Modal>
    </div>
  );
}
