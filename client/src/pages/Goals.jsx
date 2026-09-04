import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { fireConfetti } from '../utils/confetti';

const CATEGORY_LABELS = {
  'teaching-craft': 'Teaching Craft',
  certification: 'Certification',
  leadership: 'Leadership',
  'student-outcomes': 'Student Outcomes',
  other: 'Other',
};

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'teaching-craft', targetDate: '' });

  useEffect(() => {
    if (user.role === 'admin') {
      api.get('/teachers').then((res) => setTeachers(res.data));
    }
  }, [user.role]);

  const load = () => {
    const params = {};
    if (user.role === 'admin' && selectedTeacherId) params.teacherId = selectedTeacherId;
    api.get('/goals', { params }).then((res) => setGoals(res.data));
  };

  useEffect(() => {
    if (user.role === 'teacher' || (user.role === 'admin' && selectedTeacherId)) {
      load();
    } else {
      setGoals([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeacherId, user.role]);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/goals', form);
    setForm({ title: '', description: '', category: 'teaching-craft', targetDate: '' });
    setShowForm(false);
    load();
  };

  const updateProgress = async (goal, progress) => {
    await api.put(`/goals/${goal._id}`, { progress, status: progress >= 100 ? 'achieved' : 'in-progress' });
    if (progress >= 100 && goal.progress < 100) fireConfetti();
    load();
  };

  const removeGoal = async (id) => {
    await api.delete(`/goals/${id}`);
    load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Growth Goals</h1>
        <p>Set your own professional development targets and track progress toward them.</p>
        {user.role === 'teacher' && (
          <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
            <i className="fa-solid fa-plus"></i> New Goal
          </button>
        )}
      </div>

      {user.role === 'admin' && (
        <GlassCard style={{ marginBottom: 20 }}>
          <label>Select Teacher</label>
          <select value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(e.target.value)}>
            <option value="">Choose a teacher to view their goals</option>
            {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </GlassCard>
      )}

      {showForm && (
        <GlassCard style={{ marginBottom: 20 }}>
          <form onSubmit={submit} className="form-grid">
            <div className="full-span"><label>Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Lead a peer mentoring circle" /></div>
            <div><label>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            </div>
            <div><label>Target Date</label><input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} /></div>
            <div className="full-span"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does success look like for this goal?" /></div>
            <button className="btn-primary full-span" type="submit">Save Goal</button>
          </form>
        </GlassCard>
      )}

      <div className="card-grid">
        {goals.map((g) => (
          <GlassCard key={g._id} className="goal-card">
            <div className="goal-card-header">
              <h4>{g.title}</h4>
              <span className={`status-pill ${g.status}`}>{g.status.replace('-', ' ')}</span>
            </div>
            <p className="muted small">{CATEGORY_LABELS[g.category]}{g.targetDate ? ` · Target: ${new Date(g.targetDate).toLocaleDateString()}` : ''}</p>
            {g.description && <p>{g.description}</p>}

            <div className="goal-progress-track">
              <div className="goal-progress-fill" style={{ width: `${g.progress}%` }}></div>
            </div>
            <div className="goal-progress-label">
              <span>{g.progress}% complete</span>
              {user.role === 'teacher' && g.status !== 'achieved' && (
                <input
                  type="range" min="0" max="100" step="5" value={g.progress}
                  onChange={(e) => updateProgress(g, Number(e.target.value))}
                />
              )}
            </div>

            {g.adminNote && <p className="muted small"><i className="fa-solid fa-comment-dots"></i> Admin note: {g.adminNote}</p>}

            {user.role === 'teacher' && (
              <button className="btn-ghost" onClick={() => removeGoal(g._id)}>
                <i className="fa-solid fa-trash"></i> Remove
              </button>
            )}
          </GlassCard>
        ))}
      </div>

      {goals.length === 0 && (
        <p className="muted">
          {user.role === 'admin' && !selectedTeacherId
            ? 'Select a teacher above to view their goals.'
            : 'No goals set yet.'}
        </p>
      )}
    </div>
  );
}
