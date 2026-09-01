import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

export default function Attendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [today, setToday] = useState(null);
  const [message, setMessage] = useState('');

  const load = () => {
    api.get('/attendance').then((res) => {
      setRecords(res.data);
      const todayStr = new Date().toISOString().slice(0, 10);
      setToday(res.data.find((r) => r.date === todayStr) || null);
    });
  };

  useEffect(() => { load(); }, []);

  const checkIn = async () => {
    try {
      await api.post('/attendance/check-in');
      setMessage('Checked in successfully.');
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to check in.');
    }
  };

  const checkOut = async () => {
    try {
      await api.post('/attendance/check-out');
      setMessage('Checked out successfully.');
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to check out.');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Digital Attendance</h1>
        <p>Mark your attendance for today and review your history.</p>
      </div>

      {user.role === 'teacher' && (
        <GlassCard className="attendance-actions">
          <div>
            <p className="muted">Today, {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            {today ? (
              <p>
                Status: <span className={`status-pill ${today.status}`}>{today.status}</span>
                {today.checkIn && <span className="muted small"> — in at {new Date(today.checkIn).toLocaleTimeString()}</span>}
                {today.checkOut && <span className="muted small"> · out at {new Date(today.checkOut).toLocaleTimeString()}</span>}
              </p>
            ) : (
              <p className="muted">You have not checked in yet today.</p>
            )}
          </div>
          <div className="attendance-buttons">
            <button className="btn-primary" onClick={checkIn} disabled={!!today}>
              <i className="fa-solid fa-right-to-bracket"></i> Check In
            </button>
            <button className="btn-secondary" onClick={checkOut} disabled={!today || !!today?.checkOut}>
              <i className="fa-solid fa-right-from-bracket"></i> Check Out
            </button>
          </div>
        </GlassCard>
      )}
      {message && <div className="alert-info">{message}</div>}

      <GlassCard>
        <h3>Attendance History</h3>
        <table className="data-table">
          <thead><tr><th>Date</th><th>Status</th><th>Check In</th><th>Check Out</th></tr></thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id}>
                <td>{r.date}</td>
                <td><span className={`status-pill ${r.status}`}>{r.status}</span></td>
                <td>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '—'}</td>
                <td>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 && <p className="muted">No attendance records yet.</p>}
      </GlassCard>
    </div>
  );
}
