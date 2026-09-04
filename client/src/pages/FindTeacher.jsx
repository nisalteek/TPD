import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

export default function FindTeacher() {
  const { user, setUser } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState('');

  useEffect(() => {
    api.get('/teachers/directory').then((res) => setTeachers(res.data));
  }, []);

  const chooseTeacher = async (teacherId) => {
    setSaving(teacherId);
    const res = await api.put(`/teachers/${teacherId}/choose`);
    setUser(res.data);
    localStorage.setItem('tpd_user', JSON.stringify(res.data));
    setSaving('');
  };

  const filtered = teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.subject || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Find a Teacher</h1>
        <p>Browse teachers and choose the one you'd like to follow.</p>
      </div>

      <GlassCard style={{ marginBottom: 20 }}>
        <label>Search by name or subject</label>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Mathematics, Sarah…" />
      </GlassCard>

      <div className="card-grid">
        {filtered.map((t) => {
          const isChosen = user.chosenTeacher === t._id;
          return (
            <GlassCard key={t._id} className="lesson-card">
              <div className="lesson-card-header">
                <h4>{t.name}</h4>
                {isChosen && <span className="badge">Your Teacher</span>}
              </div>
              <p className="muted small">{t.subject}{t.department ? ` · ${t.department}` : ''}</p>
              {t.avgRating && <p className="muted small">★ {t.avgRating}</p>}
              {t.bio && <p>{t.bio}</p>}
              <div className="row-actions">
                <button
                  className={isChosen ? 'btn-ghost' : 'btn-primary'}
                  onClick={() => chooseTeacher(t._id)}
                  disabled={saving === t._id || isChosen}
                >
                  {isChosen ? 'Chosen' : saving === t._id ? 'Saving…' : 'Choose This Teacher'}
                </button>
                <Link to={`/portfolio/${t._id}`} className="btn-secondary" target="_blank" rel="noopener noreferrer">
                  <i className="fa-solid fa-arrow-up-right-from-square"></i> Portfolio
                </Link>
              </div>
            </GlassCard>
          );
        })}
      </div>
      {filtered.length === 0 && <p className="muted">No teachers match your search.</p>}
    </div>
  );
}
