import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    subject: '',
    department: '',
    employeeId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please review your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card wide">
        <div className="auth-brand">
          <i className="fa-solid fa-graduation-cap"></i>
          <h1>Create Teacher Account</h1>
          <p>Join the professional development platform</p>
        </div>
        {error && <div className="alert-error">{error}</div>}
        <form onSubmit={submit} className="form-grid">
          <div>
            <label>Full name</label>
            <input required value={form.name} onChange={update('name')} placeholder="Jane Doe" />
          </div>
          <div>
            <label>Email address</label>
            <input type="email" required value={form.email} onChange={update('email')} placeholder="you@school.edu" />
          </div>
          <div>
            <label>Password</label>
            <input type="password" required minLength={6} value={form.password} onChange={update('password')} placeholder="At least 6 characters" />
          </div>
          <div>
            <label>Employee ID</label>
            <input value={form.employeeId} onChange={update('employeeId')} placeholder="EMP-0042" />
          </div>
          <div>
            <label>Subject</label>
            <input value={form.subject} onChange={update('subject')} placeholder="Mathematics" />
          </div>
          <div>
            <label>Department</label>
            <input value={form.department} onChange={update('department')} placeholder="Secondary School" />
          </div>
          <button className="btn-primary full-span" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
