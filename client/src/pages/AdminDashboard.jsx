import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';
import GlassCard from '../components/GlassCard';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [board, setBoard] = useState([]);

  useEffect(() => {
    api.get('/analytics/school').then((res) => setStats(res.data));
    const loadBoard = () => api.get('/attendance/today').then((res) => setBoard(res.data)).catch(() => {});
    loadBoard();
    const interval = setInterval(loadBoard, 60000);
    return () => clearInterval(interval);
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

      <GlassCard style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3>Who's In Today</h3>
          <span className="muted small">Live · refreshes every minute</span>
        </div>
        {board.length === 0 ? (
          <p className="muted">No active teachers on record yet.</p>
        ) : (
          <div className="today-board">
            {board.map((t) => (
              <div key={t.teacherId} className="today-board-item" title={`${t.name} — ${t.status.replace('-', ' ')}`}>
                <div className={`today-avatar-ring status-${t.status}`}>
                  <div className="today-avatar">{t.name.charAt(0).toUpperCase()}</div>
                </div>
                <span className="today-name">{t.name.split(' ')[0]}</span>
                <span className={`today-status-label status-${t.status}`}>
                  {t.status === 'not-marked' ? 'Not yet' : t.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {stats && (
        <div className="two-col">
          <GlassCard>
            <h3>Attendance — Last 7 Days</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(29,78,216,0.1)" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="present" stroke="#0d9488" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard>
            <h3>School-wide Rating Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(29,78,216,0.1)" />
                <XAxis dataKey="star" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      )}

      <GlassCard>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3>Top Performing Teachers</h3>
          <Link to="/achievements" className="btn-secondary"><i className="fa-solid fa-trophy"></i> Achievement Wall</Link>
        </div>
        {stats?.topTeachers?.length ? (
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Name</th><th>Subject</th><th>Points</th><th></th></tr>
            </thead>
            <tbody>
              {stats.topTeachers.map((t, i) => (
                <tr key={t._id}>
                  <td>{i + 1}</td>
                  <td>{t.name}</td>
                  <td>{t.subject || '—'}</td>
                  <td><span className="badge">{t.points} pts</span></td>
                  <td><Link to={`/teacher-journey/${t._id}`} className="btn-ghost">View 360°</Link></td>
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
