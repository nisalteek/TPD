import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

const COLORS = ['#0f2540', '#b8892b', '#3d6b8f', '#8fa9c2', '#d9c39a'];

export default function Analytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [selectedId, setSelectedId] = useState(user.role === 'teacher' ? user.id : '');

  useEffect(() => {
    if (user.role === 'admin') {
      api.get('/teachers').then((res) => setTeachers(res.data));
    }
  }, [user.role]);

  useEffect(() => {
    if (!selectedId) return;
    api.get(`/analytics/teacher/${selectedId}`).then((res) => setStats(res.data));
  }, [selectedId]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Performance Analytics</h1>
        <p>Visual breakdown of attendance, feedback, and professional growth.</p>
      </div>

      {user.role === 'admin' && (
        <GlassCard>
          <label>Select Teacher</label>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            <option value="">Choose a teacher</option>
            {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </GlassCard>
      )}

      {stats && (
        <div className="two-col">
          <GlassCard>
            <h3>Feedback Rating Breakdown</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.ratingBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,37,64,0.1)" />
                <XAxis dataKey="star" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0f2540" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard>
            <h3>Lesson Plan Status</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={stats.lessonPlanStatus}
                  dataKey="count"
                  nameKey="status"
                  outerRadius={90}
                  label={(entry) => entry.status}
                >
                  {stats.lessonPlanStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard>
            <h3>Attendance Summary</h3>
            <ul className="summary-list">
              <li><span>Attendance Rate</span><strong>{stats.attendanceRate}%</strong></li>
              <li><span>Present Days</span><strong>{stats.presentDays}</strong></li>
              <li><span>Late Days</span><strong>{stats.lateDays}</strong></li>
              <li><span>Absent Days</span><strong>{stats.absentDays}</strong></li>
            </ul>
          </GlassCard>

          <GlassCard>
            <h3>Training Summary</h3>
            <ul className="summary-list">
              <li><span>Total Training Hours</span><strong>{stats.trainingHours}</strong></li>
              <li><span>Completed Courses</span><strong>{stats.completedTrainings}</strong></li>
              <li><span>Average Feedback Rating</span><strong>{stats.avgRating} / 5</strong></li>
            </ul>
          </GlassCard>
        </div>
      )}

      {!stats && user.role === 'admin' && <p className="muted">Select a teacher to view their analytics.</p>}
    </div>
  );
}
