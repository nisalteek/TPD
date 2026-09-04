import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import GlassCard from '../components/GlassCard';
import { fireConfetti } from '../utils/confetti';

export default function TeachersList() {
  const [teachers, setTeachers] = useState([]);
  const [milestoneModal, setMilestoneModal] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', type: 'achievement', points: 10 });

  const load = () => api.get('/teachers').then((res) => setTeachers(res.data));

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (t) => {
    await api.put(`/teachers/${t._id}`, { isActive: !t.isActive });
    load();
  };

  const awardMilestone = async (e) => {
    e.preventDefault();
    await api.post('/milestones', { ...form, teacher: milestoneModal._id });
    setMilestoneModal(null);
    setForm({ title: '', description: '', type: 'achievement', points: 10 });
    fireConfetti();
    load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Teacher Directory</h1>
        <p>Manage accounts and recognize achievements.</p>
      </div>

      <GlassCard>
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Subject</th><th>Department</th><th>Points</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t._id}>
                <td>{t.name}<div className="muted small">{t.email}</div></td>
                <td>{t.subject || '—'}</td>
                <td>{t.department || '—'}</td>
                <td><span className="badge">{t.points} pts</span></td>
                <td>
                  <span className={`status-pill ${t.isActive ? 'active' : 'inactive'}`}>
                    {t.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="row-actions">
                  <Link to={`/teacher-journey/${t._id}`} className="btn-ghost">
                    <i className="fa-solid fa-chart-line"></i> 360°
                  </Link>
                  <button className="btn-ghost" onClick={() => setMilestoneModal(t)}>
                    <i className="fa-solid fa-award"></i> Award
                  </button>
                  <button className="btn-ghost" onClick={() => toggleActive(t)}>
                    {t.isActive ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {teachers.length === 0 && <p className="muted">No teachers registered yet.</p>}
      </GlassCard>

      {milestoneModal && (
        <div className="modal-overlay" onClick={() => setMilestoneModal(null)}>
          <div className="modal glass-card" onClick={(e) => e.stopPropagation()}>
            <h3>Award Milestone — {milestoneModal.name}</h3>
            <form onSubmit={awardMilestone}>
              <label>Title</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Teacher of the Month" />
              <label>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Recognized for outstanding classroom engagement." />
              <label>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="award">Award</option>
                <option value="promotion">Promotion</option>
                <option value="certification">Certification</option>
                <option value="anniversary">Anniversary</option>
                <option value="achievement">Achievement</option>
              </select>
              <label>Points</label>
              <input type="number" min="0" value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} />
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setMilestoneModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Award</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
