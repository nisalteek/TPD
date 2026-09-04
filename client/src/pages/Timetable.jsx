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
    setModalSlot({ day, period, existingId: existing?._id });
  };

  const saveSlot = async (e) => {
    e.preventDefault();
    if (modalSlot.existingId) {
      await api.put(`/timetable/${modalSlot.existingId}`, form);
    } else {
      await api.post('/timetable', { ...form, teacherId: selectedTeacherId, day: modalSlot.day, period: modalSlot.period });
    }
    setModalSlot(null);
    load();
  };

  const clearSlot = async () => {
    if (modalSlot.existingId) {
      await api.delete(`/timetable/${modalSlot.existingId}`);
      setModalSlot(null);
      load();
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Weekly Timetable</h1>
        <p>{user.role === 'admin' ? 'Build out each teacher\'s weekly class schedule.' : 'Your class schedule for the week.'}</p>
      </div>

      {user.role === 'admin' && (
        <GlassCard style={{ marginBottom: 20 }}>
          <label>Select Teacher</label>
          <select value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(e.target.value)}>
            {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </GlassCard>
      )}

      <GlassCard>
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

      {modalSlot && (
        <div className="modal-overlay" onClick={() => setModalSlot(null)}>
          <div className="modal glass-card" onClick={(e) => e.stopPropagation()}>
            <h3>{modalSlot.day} — Period {modalSlot.period}</h3>
            <form onSubmit={saveSlot}>
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
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
