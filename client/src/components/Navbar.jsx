import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar glass-card">
      <div className="navbar-brand">
        <i className="fa-solid fa-graduation-cap"></i>
        <span>Teacher Performance &amp; Development</span>
      </div>
      <div className="navbar-user">
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
