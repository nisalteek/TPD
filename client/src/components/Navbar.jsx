import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const load = () => api.get('/notifications').then((res) => setNotifications(res.data)).catch(() => {});
    load();
    const interval = setInterval(load, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="navbar glass-card">
      <div className="navbar-brand">
        <i className="fa-solid fa-graduation-cap"></i>
        <span>Teacher Performance &amp; Development</span>
      </div>
      <div className="navbar-user">
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode">
          <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
        </button>

        <div className="notif-wrap" ref={panelRef}>
          <button className="btn-icon notif-bell" onClick={() => setOpen((o) => !o)}>
            <i className="fa-solid fa-bell"></i>
            {notifications.length > 0 && <span className="notif-dot">{notifications.length}</span>}
          </button>
          {open && (
            <div className="notif-panel glass-card">
              <h4>Recent Activity</h4>
              {notifications.length === 0 && <p className="muted small">Nothing new right now.</p>}
              <ul className="notif-list">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <i className={`fa-solid ${n.icon}`}></i>
                    <div>
                      <p>{n.text}</p>
                      <span className="muted small">{timeAgo(n.date)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="navbar-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
        <div className="navbar-user-info">
          <span className="navbar-user-name">{user?.name}</span>
          <span className="navbar-user-role">{user?.role}</span>
        </div>
        <button
          className="btn-ghost"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          <i className="fa-solid fa-right-from-bracket"></i>
          Sign out
        </button>
      </div>
    </header>
  );
}
