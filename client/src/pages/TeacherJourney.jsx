import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

// Merges attendance, training, feedback, lesson plans, and milestones for
// one teacher into a single chronological "Teacher 360" timeline.
export default function TeacherJourney() {
  const { id } = useParams();
  const { user } = useAuth();
  const teacherId = id || user.id;

  const [teacher, setTeacher] = useState(null);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = { teacherId };

    Promise.all([
      api.get(`/teachers/${teacherId}`),
      api.get(`/analytics/teacher/${teacherId}`),
      api.get('/attendance', { params }),
      api.get('/training', { params }),
      api.get('/feedback', { params }),
      api.get('/lessonplans', { params }),
      api.get('/milestones', { params }),
    ]).then(([teacherRes, statsRes, attendanceRes, trainingRes, feedbackRes, lessonRes, milestoneRes]) => {
      setTeacher(teacherRes.data);
      setStats(statsRes.data);

      const combined = [
        ...trainingRes.data
          .filter((t) => t.status === 'completed')
          .map((t) => ({
            type: 'training',
            icon: 'fa-certificate',
            date: t.completionDate || t.createdAt,
            title: `Completed: ${t.title}`,
            detail: `${t.hours || 0} training hours${t.certificateIssued ? ' · Certificate issued' : ''}`,
          })),
        ...feedbackRes.data.map((f) => ({
          type: 'feedback',
          icon: 'fa-star',
          date: f.createdAt,
          title: `${f.rating}★ feedback received`,
          detail: f.comment || `${f.category.replace('-', ' ')} feedback`,
        })),
        ...lessonRes.data
          .filter((p) => p.status === 'approved')
          .map((p) => ({
            type: 'lesson',
            icon: 'fa-book-open',
            date: p.date,
            title: `Lesson plan approved: ${p.title}`,
            detail: `${p.subject || ''} ${p.gradeLevel || ''}`.trim(),
          })),
        ...milestoneRes.data.map((m) => ({
          type: 'milestone',
          icon: 'fa-award',
          date: m.date,
          title: m.title,
          detail: m.description || m.type,
        })),
      ]
        .filter((e) => e.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 20);

      setEvents(combined);
      setLoading(false);
    });
  }, [teacherId]);

  if (loading || !teacher) {
    return (
      <div className="page">
        <div className="page-header"><h1>Teacher Journey</h1><p className="muted">Loading full profile…</p></div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="journey-header">
        <div className="journey-avatar">{teacher.name.charAt(0).toUpperCase()}</div>
        <div>
          <h1>{teacher.name}'s Journey</h1>
          <p className="muted">{teacher.subject || 'Subject not set'} · {teacher.department || 'Department not set'}</p>
        </div>
      </div>

      <div className="stat-grid">
        <GlassCard className="stat-card">
          <i className="fa-solid fa-calendar-check stat-icon"></i>
          <div><span className="stat-value">{stats?.attendanceRate ?? '—'}%</span><span className="stat-label">Attendance Rate</span></div>
        </GlassCard>
        <GlassCard className="stat-card">
          <i className="fa-solid fa-star stat-icon"></i>
          <div><span className="stat-value">{stats?.avgRating ?? '—'}</span><span className="stat-label">Average Rating</span></div>
        </GlassCard>
        <GlassCard className="stat-card">
          <i className="fa-solid fa-certificate stat-icon"></i>
          <div><span className="stat-value">{stats?.completedTrainings ?? '—'}</span><span className="stat-label">Certificates Earned</span></div>
        </GlassCard>
        <GlassCard className="stat-card">
          <i className="fa-solid fa-trophy stat-icon"></i>
          <div><span className="stat-value">{teacher.points || 0}</span><span className="stat-label">Recognition Points</span></div>
        </GlassCard>
      </div>

      <GlassCard>
        <h3>Evidence Timeline</h3>
        <p className="muted small">Every training completion, feedback, approved lesson plan, and milestone — combined and ordered by date.</p>
        <div className="journey-timeline">
          {events.map((e, i) => (
            <div key={i} className={`journey-item type-${e.type}`}>
              <div className="journey-dot"></div>
              <strong><i className={`fa-solid ${e.icon}`} style={{ marginRight: 8 }}></i>{e.title}</strong>
              <p className="muted small" style={{ margin: '2px 0' }}>{e.detail}</p>
              <span className="muted small">{new Date(e.date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
        {events.length === 0 && <p className="muted">No evidence recorded yet for this teacher.</p>}
      </GlassCard>
    </div>
  );
}
