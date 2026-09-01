import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const teacherLinks = [
  { to: '/', icon: 'fa-gauge-high', label: 'Dashboard' },
  { to: '/profile', icon: 'fa-id-badge', label: 'Profile' },
  { to: '/attendance', icon: 'fa-calendar-check', label: 'Attendance' },
  { to: '/training', icon: 'fa-certificate', label: 'Training & Certificates' },
  { to: '/lesson-plans', icon: 'fa-book-open', label: 'Lesson Plans' },
  { to: '/feedback', icon: 'fa-comments', label: 'Feedback' },
  { to: '/analytics', icon: 'fa-chart-line', label: 'Analytics' },
];

const adminLinks = [
  { to: '/', icon: 'fa-gauge-high', label: 'Admin Dashboard' },
  { to: '/teachers', icon: 'fa-users', label: 'Teachers' },
  { to: '/training', icon: 'fa-certificate', label: 'Training & Certificates' },
  { to: '/lesson-plans', icon: 'fa-book-open', label: 'Lesson Plans' },
  { to: '/attendance', icon: 'fa-calendar-check', label: 'Attendance' },
  { to: '/feedback', icon: 'fa-comments', label: 'Feedback' },
  { to: '/analytics', icon: 'fa-chart-line', label: 'School Analytics' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === 'admin' ? adminLinks : teacherLinks;

  return (
    <aside className="sidebar glass-card">
      <nav>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <i className={`fa-solid ${link.icon}`}></i>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}