import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

export default function LessonPlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', subject: '', gradeLevel: '', date: '', objectives: '', materials: '', procedure: '', assessment: '',
  });

  const load = () => api.get('/lessonplans').then((res) => setPlans(res.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/lessonplans', form);
    setForm({ title: '', subject: '', gradeLevel: '', date: '', objectives: '', materials: '', procedure: '', assessment: '' });
    setShowForm(false);
    load();
  };

  const submitForReview = async (id) => {
    await api.put(`/lessonplans/${id}`, { status: 'submitted' });
    load();
  };

  const reviewPlan = async (id, status) => {
    await api.put(`/lessonplans/${id}`, { status });
    load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Lesson Plans</h1>
        <p>Draft, submit, and track approval of your lesson plans.</p>
        {user.role === 'teacher' && (
          <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
            <i className="fa-solid fa-plus"></i> New Lesson Plan
          </button>
        )}
      </div>

      {showForm && (
        <GlassCard>
          <form onSubmit={submit} className="form-grid">
            <div><label>Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><label>Subject</label><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
            <div><label>Grade Level</label><input value={form.gradeLevel} onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })} /></div>
            <div><label>Date</label><input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div className="full-span"><label>Objectives</label><textarea value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} /></div>
            <div className="full-span"><label>Materials</label><textarea value={form.materials} onChange={(e) => setForm({ ...form, materials: e.target.value })} /></div>
            <div className="full-span"><label>Procedure</label><textarea value={form.procedure} onChange={(e) => setForm({ ...form, procedure: e.target.value })} /></div>
            <div className="full-span"><label>Assessment</label><textarea value={form.assessment} onChange={(e) => setForm({ ...form, assessment: e.target.value })} /></div>
            <button className="btn-primary full-span" type="submit">Save Draft</button>
          </form>
        </GlassCard>
      )}

      <div className="card-grid">
        {plans.map((p) => (
          <GlassCard key={p._id} className="lesson-card">
            <div className="lesson-card-header">
              <h4>{p.title}</h4>
              <span className={`status-pill ${p.status}`}>{p.status.replace('-', ' ')}</span>
            </div>
            <p className="muted small">{p.subject} · {p.gradeLevel} · {new Date(p.date).toLocaleDateString()}</p>
            {user.role === 'admin' && <p className="muted small">By {p.teacher?.name}</p>}
            <p>{p.objectives}</p>
            {user.role === 'teacher' && p.status === 'draft' && (
              <button className="btn-secondary" onClick={() => submitForReview(p._id)}>Submit for Review</button>
            )}
            {user.role === 'admin' && p.status === 'submitted' && (
              <div className="row-actions">
                <button className="btn-secondary" onClick={() => reviewPlan(p._id, 'approved')}>Approve</button>
                <button className="btn-ghost" onClick={() => reviewPlan(p._id, 'needs-revision')}>Request Revision</button>
              </div>
            )}
          </GlassCard>
        ))}
      </div>
      {plans.length === 0 && <p className="muted">No lesson plans yet.</p>}
    </div>
  );
}
