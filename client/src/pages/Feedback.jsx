import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

export default function Feedback() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({ teacherId: '', rating: 5, category: 'general', comment: '', submittedBy: '' });

  const load = () => api.get('/feedback').then((res) => setFeedback(res.data));

  useEffect(() => {
    load();
    if (user.role === 'admin') api.get('/teachers').then((res) => setTeachers(res.data));
  }, [user.role]);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/feedback', form);
    setForm({ teacherId: '', rating: 5, category: 'general', comment: '', submittedBy: '' });
    load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Feedback</h1>
        <p>{user.role === 'admin' ? 'Submit feedback for a teacher and review submissions.' : 'Review the feedback you have received.'}</p>
      </div>

      {user.role === 'admin' && (
        <GlassCard>
          <h3>Submit Feedback</h3>
          <form onSubmit={submit} className="form-grid">
            <div>
              <label>Teacher</label>
              <select required value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })}>
                <option value="">Select a teacher</option>
                {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label>Rating (1–5)</label>
              <input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
            </div>
            <div>
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="teaching-quality">Teaching Quality</option>
                <option value="communication">Communication</option>
                <option value="punctuality">Punctuality</option>
                <option value="classroom-management">Classroom Management</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label>Submitted By (optional)</label>
              <input value={form.submittedBy} onChange={(e) => setForm({ ...form, submittedBy: e.target.value })} placeholder="Parent / Student name" />
            </div>
            <div className="full-span">
              <label>Comment</label>
              <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
            </div>
            <button className="btn-primary full-span" type="submit">Submit Feedback</button>
          </form>
        </GlassCard>
      )}

      <GlassCard>
        <h3>Feedback Received</h3>
        <div className="card-grid">
          {feedback.map((f) => (
            <div key={f._id} className="feedback-item">
              <div className="feedback-rating">
                {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}
              </div>
              <p>{f.comment || <span className="muted">No comment provided.</span>}</p>
              <span className="muted small">{f.category.replace('-', ' ')} · {f.submittedBy} · {new Date(f.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
        {feedback.length === 0 && <p className="muted">No feedback yet.</p>}
      </GlassCard>
    </div>
  );
}
