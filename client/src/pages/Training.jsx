import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { fireConfetti } from '../utils/confetti';

export default function Training() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', provider: '', category: '', hours: 0, status: 'planned' });

  // Admins must pick which teacher's training list they're viewing —
  // without this, an admin only ever saw their own (empty) record list
  // and had no way to reach a teacher's training to mark it completed.
  useEffect(() => {
    if (user.role === 'admin') {
      api.get('/teachers').then((res) => setTeachers(res.data));
    }
  }, [user.role]);

  const load = () => {
    const params = {};
    if (user.role === 'admin' && selectedTeacherId) params.teacherId = selectedTeacherId;
    api.get('/training', { params }).then((res) => setRecords(res.data));
  };

  useEffect(() => {
    if (user.role === 'teacher' || (user.role === 'admin' && selectedTeacherId)) {
      load();
    } else {
      setRecords([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeacherId, user.role]);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/training', form);
    setForm({ title: '', provider: '', category: '', hours: 0, status: 'planned' });
    setShowForm(false);
    load();
  };

  const markCompleted = async (id) => {
    await api.put(`/training/${id}`, { status: 'completed', completionDate: new Date() });
    load();
  };

  const downloadCertificate = async (record) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/certificates/${record._id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('tpd_token')}` },
    });
    if (!res.ok) return alert('Certificate not available yet.');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificate-${record.certificateId}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
    fireConfetti();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Training &amp; Certifications</h1>
        <p>Track professional development courses and download earned certificates.</p>
        {user.role === 'teacher' && (
          <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
            <i className="fa-solid fa-plus"></i> Log New Training
          </button>
        )}
      </div>

      {user.role === 'admin' && (
        <GlassCard>
          <label>Select Teacher</label>
          <select value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(e.target.value)}>
            <option value="">Choose a teacher to view their training records</option>
            {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </GlassCard>
      )}

      {showForm && (
        <GlassCard>
          <form onSubmit={submit} className="form-grid">
            <div><label>Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Classroom Management Workshop" /></div>
            <div><label>Provider</label><input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder="District Training Office" /></div>
            <div><label>Category</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Pedagogy" /></div>
            <div><label>Hours</label><input type="number" min="0" value={form.hours} onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })} /></div>
            <button className="btn-primary full-span" type="submit">Save Training Record</button>
          </form>
        </GlassCard>
      )}

      <GlassCard>
        <table className="data-table">
          <thead><tr><th>Title</th><th>Provider</th><th>Hours</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id}>
                <td>{r.title}</td>
                <td>{r.provider || '—'}</td>
                <td>{r.hours}</td>
                <td><span className={`status-pill ${r.status}`}>{r.status}</span></td>
                <td className="row-actions">
                  {user.role === 'admin' && r.status !== 'completed' && (
                    <button className="btn-ghost" onClick={() => markCompleted(r._id)}>Mark Completed</button>
                  )}
                  {r.certificateIssued && (
                    <button className="btn-ghost" onClick={() => downloadCertificate(r)}>
                      <i className="fa-solid fa-download"></i> Certificate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 && (
          <p className="muted">
            {user.role === 'admin' && !selectedTeacherId
              ? 'Select a teacher above to view their training records.'
              : 'No training records yet.'}
          </p>
        )}
      </GlassCard>
    </div>
  );
}
