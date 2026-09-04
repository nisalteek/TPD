import { useEffect, useState } from 'react';
import api from '../api/axios';
import GlassCard from '../components/GlassCard';

const TYPE_ICONS = {
  award: 'fa-trophy',
  promotion: 'fa-arrow-up-right-dots',
  certification: 'fa-certificate',
  anniversary: 'fa-cake-candles',
  achievement: 'fa-star',
};

export default function AchievementWall() {
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    api.get('/milestones', { params: { scope: 'school' } }).then((res) => setMilestones(res.data));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Achievement Wall</h1>
        <p>Celebrating professional growth and teaching excellence across the school.</p>
      </div>

      <div className="achievement-grid">
        {milestones.map((m) => (
          <GlassCard key={m._id} className="achievement-card">
            <div className="achievement-icon">
              <i className={`fa-solid ${TYPE_ICONS[m.type] || 'fa-award'}`}></i>
            </div>
            <h4>{m.title}</h4>
            <p className="muted small">{m.description}</p>
            <div className="achievement-teacher">{m.teacher?.name}{m.teacher?.subject ? ` · ${m.teacher.subject}` : ''}</div>
            <span className="muted small">{new Date(m.date).toLocaleDateString()}</span>
          </GlassCard>
        ))}
      </div>
      {milestones.length === 0 && <p className="muted">No achievements recorded yet — check back soon.</p>}
    </div>
  );
}
