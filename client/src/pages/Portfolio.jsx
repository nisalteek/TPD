import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import GlassCard from '../components/GlassCard';

// Public page — no login required. Shareable career portfolio link.
export default function Portfolio() {
  const { teacherId } = useParams();
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/portfolio/${teacherId}`)
      .then((res) => setData(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [teacherId]);

  if (loading) {
    return <div className="auth-page"><p className="muted">Loading portfolio…</p></div>;
  }

  if (notFound || !data) {
    return (
      <div className="auth-page">
        <div className="auth-card glass-card" style={{ textAlign: 'center' }}>
          <i className="fa-solid fa-circle-xmark" style={{ fontSize: '2.5rem', color: 'var(--error)' }}></i>
          <h3 style={{ marginTop: 12 }}>Portfolio Not Found</h3>
          <p className="auth-switch"><Link to="/login">Back to TPD System</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card wide glass-card">
        <div className="profile-summary" style={{ marginBottom: 20 }}>
          <div className="profile-avatar">{data.name.charAt(0).toUpperCase()}</div>
          <h1 style={{ fontSize: '1.6rem' }}>{data.name}</h1>
          <p className="muted">{data.subject}{data.department ? ` · ${data.department}` : ''}</p>
          {data.avgRating && <p className="muted small">★ {data.avgRating} average ({data.reviewCount} reviews)</p>}
          <div className="profile-points"><i className="fa-solid fa-trophy"></i> {data.points} recognition points</div>
        </div>

        {data.bio && <p style={{ marginBottom: 20 }}>{data.bio}</p>}

        <div className="two-col" style={{ marginBottom: 0 }}>
          <GlassCard>
            <h3>Certificates</h3>
            {data.certificates.length === 0 && <p className="muted small">None yet.</p>}
            <ul className="milestone-list">
              {data.certificates.map((c, i) => (
                <li key={i}>
                  <i className="fa-solid fa-certificate"></i>
                  <div><strong>{c.title}</strong><p>{c.completionDate ? new Date(c.completionDate).toLocaleDateString() : ''}</p></div>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard>
            <h3>Milestones &amp; Achieved Goals</h3>
            {data.milestones.length === 0 && data.achievedGoals.length === 0 && <p className="muted small">None yet.</p>}
            <ul className="milestone-list">
              {data.milestones.map((m) => (
                <li key={m._id}>
                  <i className="fa-solid fa-award"></i>
                  <div><strong>{m.title}</strong><p>{m.description}</p></div>
                </li>
              ))}
              {data.achievedGoals.map((g) => (
                <li key={g._id}>
                  <i className="fa-solid fa-bullseye"></i>
                  <div><strong>{g.title}</strong><p>Goal achieved</p></div>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>

        <p className="auth-switch" style={{ marginTop: 20 }}>
          <i className="fa-solid fa-graduation-cap"></i> Teacher Performance &amp; Development Tracking System
        </p>
      </div>
    </div>
  );
}
