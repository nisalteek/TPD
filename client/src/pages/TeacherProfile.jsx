import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import GlassCard from '../components/GlassCard';

export default function TeacherProfile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: '', subject: '', department: '', phone: '', bio: '', employeeId: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '', subject: user.subject || '', department: user.department || '',
        phone: user.phone || '', bio: user.bio || '', employeeId: user.employeeId || '',
      });
    }
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    const res = await api.put(`/teachers/${user.id}`, form);
    setUser(res.data);
    localStorage.setItem('tpd_user', JSON.stringify(res.data));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Keep your professional details up to date.</p>
      </div>

      <div className="two-col">
        <GlassCard className="profile-summary">
          <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <h3>{user.name}</h3>
          <p className="muted">{user.subject || 'Subject not set'}</p>
          <div className="profile-points">
            <i className="fa-solid fa-trophy"></i> {user.points || 0} points
          </div>
        </GlassCard>

        <GlassCard>
          <form onSubmit={submit} className="form-grid">
            <div><label>Full Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label>Employee ID</label><input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} /></div>
            <div><label>Subject</label><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
            <div><label>Department</label><input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
            <div><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="full-span"><label>Bio</label><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
            <button className="btn-primary full-span" type="submit">Save Changes</button>
            {saved && <p className="alert-success full-span">Profile updated.</p>}
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
