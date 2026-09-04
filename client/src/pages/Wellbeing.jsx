import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

const SCORE_LABELS = { 1: 'Overwhelmed', 2: 'Struggling', 3: 'Okay', 4: 'Good', 5: 'Thriving' };

export default function Wellbeing() {
  const { user } = useAuth();
  const [score, setScore] = useState(3);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState([]);
  const [aggregate, setAggregate] = useState([]);

  useEffect(() => {
    if (user.role === 'teacher') {
      api.get('/wellbeing/mine').then((res) => setHistory(res.data));
    } else if (user.role === 'admin') {
      api.get('/wellbeing/aggregate').then((res) => setAggregate(res.data));
    }
  }, [user.role]);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/wellbeing', { score, note });
    setSubmitted(true);
    api.get('/wellbeing/mine').then((res) => setHistory(res.data));
  };

  if (user.role === 'admin') {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Wellbeing Pulse</h1>
          <p>School-wide weekly trend, shown only as an anonymous average — individual responses are never visible to admins.</p>
        </div>
        <GlassCard>
          <h3>Average Weekly Score</h3>
          {aggregate.length === 0 ? (
            <p className="muted">No check-ins submitted yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={aggregate}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(2,132,199,0.1)" />
                <XAxis dataKey="week" fontSize={12} />
                <YAxis domain={[1, 5]} allowDecimals={false} />
                <Tooltip formatter={(val, name) => [val, name === 'avgScore' ? 'Avg Score' : 'Responses']} />
                <Line type="monotone" dataKey="avgScore" stroke="var(--primary, #0284c7)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
          <p className="muted small" style={{ marginTop: 10 }}>
            Scored 1 (overwhelmed) to 5 (thriving). Response counts per week are aggregated, not individually attributed.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Wellbeing Check-in</h1>
        <p>A quick, private pulse — only you and the school's anonymous weekly average ever see this.</p>
      </div>

      <GlassCard style={{ marginBottom: 20 }}>
        <form onSubmit={submit}>
          <label>How are you feeling about your workload this week?</label>
          <div className="wellbeing-scale">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                className={`wellbeing-option ${score === n ? 'selected' : ''}`}
                onClick={() => setScore(n)}
              >
                <span className="wellbeing-number">{n}</span>
                <span className="wellbeing-label">{SCORE_LABELS[n]}</span>
              </button>
            ))}
          </div>
          <label>Anything you'd like to note? (optional, private)</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Only visible to you." />
          <button className="btn-primary full-span" type="submit">Submit Check-in</button>
          {submitted && <p className="alert-success" style={{ marginTop: 10 }}>Thanks — your check-in was recorded.</p>}
        </form>
      </GlassCard>

      <GlassCard>
        <h3>Your History</h3>
        {history.length === 0 ? (
          <p className="muted">No check-ins yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(2,132,199,0.1)" />
              <XAxis dataKey="week" fontSize={12} />
              <YAxis domain={[1, 5]} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="var(--accent, #0d9488)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </GlassCard>
    </div>
  );
}
