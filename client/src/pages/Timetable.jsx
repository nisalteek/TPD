import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function Timetable() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [modalSlot, setModalSlot] = useState(null); // { day, period } when adding/editing
  const [form, setForm] = useState({ subject: '', className: '', room: '' });
  const [clashes, setClashes] = useState([]);

  const [subForm, setSubForm] = useState({ day: 'Monday', period: 1, subject: '' });
  const [substitutes, setSubstitutes] = useState(null);
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    if (user.role === 'admin') {
      api.get('/teachers').then((res) => {
        setTeachers(res.data);
        if (res.data.length > 0) setSelectedTeacherId(res.data[0]._id);
      });
    }
  }, [user.role]);

  const load = () => {
    const params = {};
    if (user.role === 'admin' && selectedTeacherId) params.teacherId = selectedTeacherId;
    api.get('/timetable', { params }).then((res) => setEntries(res.data));
  };

  useEffect(() => {
    if (user.role === 'teacher' || (user.role === 'admin' && selectedTeacherId)) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeacherId, user.role]);

  const findEntry = (day, period) => entries.find((e) => e.day === day && e.period === period);

  const openSlot = (day, period) => {
    const existing = findEntry(day, period);
    setForm(existing ? { subject: existing.subject, className: existing.className || '', room: existing.room || '' } : { subject: '', className: '', room: '' });
    setClashes([]);
    setModalSlot({ day, period, existingId: existing?._id });
  };

  const saveSlot = async (e, override = false) => {
    e.preventDefault();
    setClashes([]);
    try {
      if (modalSlot.existingId) {
        await api.put(`/timetable/${modalSlot.existingId}`, { ...form, override });
      } else {
        await api.post('/timetable', { ...form, teacherId: selectedTeacherId, day: modalSlot.day, period: modalSlot.period, override });
      }
      setModalSlot(null);
      load();
    } catch (err) {
      if (err.response?.status === 409 && err.response.data?.clashes) {
        setClashes(err.response.data.clashes);
      } else {
        alert(err.response?.data?.message || 'Unable to save this slot.');
      }
    }
  };

  const clearSlot = async () => {
    if (modalSlot.existingId) {
      await api.delete(`/timetable/${modalSlot.existingId}`);
      setModalSlot(null);
      load();
    }
  };

  const findSubstitutes = async (e) => {
    e.preventDefault();
    setSubLoading(true);
    try {
      const res = await api.get('/timetable/lookup/substitutes', { params: subForm });
      setSubstitutes(res.data);
    } finally {
      setSubLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Weekly Timetable</h1>
        <p>{user.role === 'admin' ? 'Build out each teacher\'s weekly class schedule. Room and class clashes are checked automatically.' : 'Your class schedule for the week.'}</p>
      </div>

      {user.role === 'admin' && (
        <GlassCard style={{ marginBottom: 20 }}>
          <label>Select Teacher</label>
          <select value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(e.target.value)}>
            {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </GlassCard>
      )}

      <GlassCard style={{ marginBottom: 20 }}>
        <div className="timetable-scroll">
          <table className="timetable-grid">
            <thead>
              <tr>
                <th>Period</th>
                {DAYS.map((d) => <th key={d}>{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((p) => (
                <tr key={p}>
                  <td className="timetable-period-label">P{p}</td>
                  {DAYS.map((day) => {
                    const entry = findEntry(day, p);
                    return (
                      <td key={day}>
                        {user.role === 'admin' ? (
                          <button
                            className={`timetable-cell ${entry ? 'filled' : 'empty'}`}
                            onClick={() => openSlot(day, p)}
                          >
                            {entry ? (
                              <>
                                <strong>{entry.subject}</strong>
                                {entry.className && <span>{entry.className}</span>}
                                {entry.room && <span className="muted small">{entry.room}</span>}
                              </>
                            ) : (
                              <i className="fa-solid fa-plus"></i>
                            )}
                          </button>
                        ) : (
                          <div className={`timetable-cell ${entry ? 'filled' : 'empty'} static`}>
                            {entry ? (
                              <>
                                <strong>{entry.subject}</strong>
                                {entry.className && <span>{entry.className}</span>}
                                {entry.room && <span className="muted small">{entry.room}</span>}
                              </>
                            ) : (
                              <span className="muted small">Free</span>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {user.role === 'admin' && (
        <GlassCard>
          <h3>Find a Substitute</h3>
          <p className="muted small">Ranks active teachers by availability, subject match, feedback rating, and attendance reliability.</p>
          <form onSubmit={findSubstitutes} className="form-grid" style={{ marginTop: 10 }}>
            <div>
              <label>Day</label>
              <select value={subForm.day} onChange={(e) => setSubForm({ ...subForm, day: e.target.value })}>
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label>Period</label>
              <select value={subForm.period} onChange={(e) => setSubForm({ ...subForm, period: Number(e.target.value) })}>
                {PERIODS.map((p) => <option key={p} value={p}>Period {p}</option>)}
              </select>
            </div>
            <div>
              <label>Subject (optional)</label>
              <input value={subForm.subject} onChange={(e) => setSubForm({ ...subForm, subject: e.target.value })} placeholder="Mathematics" />
            </div>
            <button className="btn-primary full-span" type="submit" disabled={subLoading}>
              {subLoading ? 'Searching…' : 'Find Substitutes'}
            </button>
          </form>

          {substitutes && (
            <table className="data-table" style={{ marginTop: 16 }}>
              <thead><tr><th>#</th><th>Name</th><th>Subject</th><th>Status</th><th>Rating</th><th>Attendance</th></tr></thead>
              <tbody>
                {substitutes.map((s, i) => (
                  <tr key={s.teacherId}>
                    <td>{i + 1}</td>
                    <td>{s.name}</td>
                    <td>{s.subject || '—'}{s.subjectMatch && <span className="badge" style={{ marginLeft: 6 }}>match</span>}</td>
                    <td><span className={`status-pill ${s.isFree ? 'active' : 'inactive'}`}>{s.isFree ? 'Free' : 'Busy'}</span></td>
                    <td>{s.avgRating || '—'}</td>
                    <td>{s.attendanceRate}%</td>
                  </tr>
                ))}
                {substitutes.length === 0 && (
                  <tr><td colSpan={6} className="muted">No other active teachers found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </GlassCard>
      )}

      {modalSlot && (
        <div className="modal-overlay" onClick={() => setModalSlot(null)}>
          <div className="modal glass-card" onClick={(e) => e.stopPropagation()}>
            <h3>{modalSlot.day} — Period {modalSlot.period}</h3>

            {clashes.length > 0 && (
              <div className="alert-error" style={{ marginTop: 10 }}>
                {clashes.map((c, i) => <p key={i} style={{ margin: 0 }}>{c.message}</p>)}
              </div>
            )}

            <form onSubmit={(e) => saveSlot(e, false)}>
              <label>Subject</label>
              <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Mathematics" />
              <label>Class / Grade</label>
              <input value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} placeholder="Grade 9-A" />
              <label>Room</label>
              <input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="Room 204" />
              <div className="modal-actions">
                {modalSlot.existingId && (
                  <button type="button" className="btn-ghost" onClick={clearSlot}>
                    <i className="fa-solid fa-trash"></i> Clear
                  </button>
                )}
                <button type="button" className="btn-ghost" onClick={() => setModalSlot(null)}>Cancel</button>
                {clashes.length > 0 && (
                  <button type="button" className="btn-secondary" onClick={(e) => saveSlot(e, true)}>Save Anyway</button>
                )}
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
