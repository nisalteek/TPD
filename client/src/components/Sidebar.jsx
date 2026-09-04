import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Sidebar() {
  const { user } = useAuth();
  const [pendingPlans, setPendingPlans] = useState(0);
  const [readyCertificates, setReadyCertificates] = useState(0);

  // Notification badges: admin sees how many lesson plans are awaiting
  // review; teachers see how many certificates are ready to download.
  useEffect(() => {
    if (user?.role === 'admin') {
      api.get('/lessonplans').then((res) => {
        setPendingPlans(res.data.filter((p) => p.status === 'submitted').length);
      });
    } else if (user?.role === 'teacher') {
      api.get('/training').then((res) => {
        setReadyCertificates(res.data.filter((t) => t.certificateIssued).length);
      });
    }
  }, [user?.role]);

  const teacherLinks = [
    { to: '/', icon: 'fa-gauge-high', label: 'Dashboard' },
    { to: '/profile', icon: 'fa-id-badge', label: 'Profile' },
    { to: `/teacher-journey/${user?.id}`, icon: 'fa-route', label: 'My Journey' },
    { to: '/goals', icon: 'fa-bullseye', label: 'Growth Goals' },
    { to: '/timetable', icon: 'fa-table-cells', label: 'Timetable' },
    { to: '/attendance', icon: 'fa-calendar-check', label: 'Attendance' },
    { to: '/training', icon: 'fa-certificate', label: 'Training & Certificates', badge: readyCertificates },
    { to: '/lesson-plans', icon: 'fa-book-open', label: 'Lesson Plans' },
    { to: '/feedback', icon: 'fa-comments', label: 'Feedback' },
    { to: '/analytics', icon: 'fa-chart-line', label: 'Analytics' },
    { to: '/achievements', icon: 'fa-trophy', label: 'Achievement Wall' },
  ];

  const adminLinks = [
    { to: '/', icon: 'fa-gauge-high', label: 'Admin Dashboard' },
    { to: '/teachers', icon: 'fa-users', label: 'Teachers' },
    { to: '/goals', icon: 'fa-bullseye', label: 'Growth Goals' },
    { to: '/timetable', icon: 'fa-table-cells', label: 'Timetable' },
    { to: '/training', icon: 'fa-certificate', label: 'Training & Certificates' },
    { to: '/lesson-plans', icon: 'fa-book-open', label: 'Lesson Plans', badge: pendingPlans },
    { to: '/attendance', icon: 'fa-calendar-check', label: 'Attendance' },
    { to: '/feedback', icon: 'fa-comments', label: 'Feedback' },
    { to: '/analytics', icon: 'fa-chart-line', label: 'School Analytics' },
    { to: '/achievements', icon: 'fa-trophy', label: 'Achievement Wall' },
  ];

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
            {!!link.badge && <span className="sidebar-badge">{link.badge}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
