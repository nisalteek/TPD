import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    api.get(`/analytics/teacher/${user.id}`).then((res) => setStats(res.data));
    api.get('/milestones').then((res) => setMilestones(res.data.slice(0, 4)));
  }, [user.id]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome back, {user.name.split(' ')[0]}</h1>
        <p>Here is a snapshot of your professional progress.</p>
      </div>

      <div className="stat-grid">
        <GlassCard className="stat-card">
          <i className="fa-solid fa-calendar-check stat-icon"></i>
          <div>
            <span className="stat-value">{stats?.attendanceRate ?? '—'}%</span>
            <span className="stat-label">Attendance Rate</span>
          </div>
        </GlassCard>
        <GlassCard className="stat-card">
          <i className="fa-solid fa-star stat-icon"></i>
          <div>
            <span className="stat-value">{stats?.avgRating ?? '—'}</span>
            <span className="stat-label">Average Rating ({stats?.feedbackCount ?? 0} reviews)</span>
          </div>
        </GlassCard>
        <GlassCard className="stat-card">
          <i className="fa-solid fa-certificate stat-icon"></i>
          <div>
            <span className="stat-value">{stats?.completedTrainings ?? '—'}</span>
            <span className="stat-label">Certificates Earned</span>
          </div>
        </GlassCard>
        <GlassCard className="stat-card">
          <i className="fa-solid fa-trophy stat-icon"></i>
          <div>
            <span className="stat-value">{user.points ?? 0}</span>
            <span className="stat-label">Recognition Points</span>
          </div>
        </GlassCard>
      </div>

      <div className="two-col">
        <GlassCard>
          <h3>Recent Milestones</h3>
          {milestones.length === 0 && <p className="muted">No milestones recorded yet.</p>}
          <ul className="milestone-list">
            {milestones.map((m) => (
              <li key={m._id}>
                <i className="fa-solid fa-award"></i>
                <div>
                  <strong>{m.title}</strong>
                  <p>{m.description}</p>
                  <span className="muted small">{new Date(m.date).toLocaleDateString()}</span>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <Link to="/attendance" className="btn-secondary"><i className="fa-solid fa-calendar-check"></i> Mark Attendance</Link>
            <Link to="/lesson-plans" className="btn-secondary"><i className="fa-solid fa-book-open"></i> New Lesson Plan</Link>
            <Link to="/training" className="btn-secondary"><i className="fa-solid fa-certificate"></i> View Certificates</Link>
            <Link to={`/teacher-journey/${user.id}`} className="btn-secondary"><i className="fa-solid fa-route"></i> My Journey</Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
