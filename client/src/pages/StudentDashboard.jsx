import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    if (user.chosenTeacher) {
      api.get('/teachers/directory').then((res) => {
        const found = res.data.find((t) => t._id === user.chosenTeacher);
        setTeacher(found || null);
      });
    }
  }, [user.chosenTeacher]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome, {user.name.split(' ')[0]}</h1>
        <p>Your student home on the Teacher Performance &amp; Development Tracking System.</p>
      </div>

      {!user.chosenTeacher ? (
        <GlassCard style={{ textAlign: 'center', padding: 40 }}>
          <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
          <h3 style={{ marginTop: 12 }}>You haven't chosen a teacher yet</h3>
          <p className="muted">Browse the directory and follow the teacher you'd like to keep up with.</p>
          <Link to="/find-teacher" className="btn-primary" style={{ display: 'inline-flex', width: 'auto', marginTop: 10 }}>
            Find a Teacher
          </Link>
        </GlassCard>
      ) : (
        <div className="two-col">
          <GlassCard className="profile-summary">
            <div className="profile-avatar">{teacher?.name?.charAt(0)?.toUpperCase() || '?'}</div>
            <h3>{teacher?.name || 'Loading…'}</h3>
            <p className="muted">{teacher?.subject}</p>
            {teacher?.avgRating && <p className="muted small">★ {teacher.avgRating}</p>}
          </GlassCard>
          <GlassCard>
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              {teacher && (
                <Link to={`/portfolio/${teacher._id}`} className="btn-secondary" target="_blank" rel="noopener noreferrer">
                  <i className="fa-solid fa-arrow-up-right-from-square"></i> View Portfolio
                </Link>
              )}
              <Link to="/find-teacher" className="btn-secondary"><i className="fa-solid fa-magnifying-glass"></i> Change Teacher</Link>
              <Link to="/achievements" className="btn-secondary"><i className="fa-solid fa-trophy"></i> Achievement Wall</Link>
              <Link to="/resources" className="btn-secondary"><i className="fa-solid fa-file-pdf"></i> Resource Library</Link>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
