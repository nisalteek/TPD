import { useEffect, useState } from 'react';
import api from '../api/axios';
import GlassCard from '../components/GlassCard';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/analytics/school').then((res) => setStats(res.data));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Admin Overview</h1>
        <p>School-wide performance and engagement at a glance.</p>
      </div>

      <div className="stat-grid">
        <GlassCard className="stat-card">
          <i className="fa-solid fa-users stat-icon"></i>
          <div>
            <span className="stat-value">{stats?.teacherCount ?? '—'}</span>
            <span className="stat-label">Total Teachers</span>
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
          <i className="fa-solid fa-calendar-check stat-icon"></i>
          <div>
            <span className="stat-value">{stats?.presentToday ?? '—'}</span>
            <span className="stat-label">Present Today</span>
          </div>
        </GlassCard>
        <GlassCard className="stat-card">
          <i className="fa-solid fa-certificate stat-icon"></i>
          <div>
            <span className="stat-value">{stats?.completedTrainings ?? '—'}</span>
            <span className="stat-label">Certificates Issued</span>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <h3>Top Performing Teachers</h3>
        {stats?.topTeachers?.length ? (
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Name</th><th>Subject</th><th>Points</th></tr>
            </thead>
            <tbody>
              {stats.topTeachers.map((t, i) => (
                <tr key={t._id}>
                  <td>{i + 1}</td>
                  <td>{t.name}</td>
                  <td>{t.subject || '—'}</td>
                  <td><span className="badge">{t.points} pts</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">No teacher data yet.</p>
        )}
      </GlassCard>
    </div>
  );
}
