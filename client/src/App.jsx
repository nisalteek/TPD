import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';
import Loader from './components/Loader';

import Login from './pages/Login';
import Register from './pages/Register';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TeachersList from './pages/TeachersList';
import TeacherProfile from './pages/TeacherProfile';
import Attendance from './pages/Attendance';
import Training from './pages/Training';
import LessonPlans from './pages/LessonPlans';
import Feedback from './pages/Feedback';
import Analytics from './pages/Analytics';
import TeacherJourney from './pages/TeacherJourney';
import AchievementWall from './pages/AchievementWall';
import Goals from './pages/Goals';

function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <main className="app-content">{children}</main>
      </div>
      <Chatbot />
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  // Plays the boot animation once per visit, on any first load of the
  // site — independent of whether the user turns out to be logged in
  // or not, so the loading screen is always seen before Login/Register
  // or a dashboard appears.
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (booting) return <Loader />;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>{user?.role === 'admin' ? <AdminDashboard /> : <TeacherDashboard />}</AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute role="teacher">
            <AppLayout><TeacherProfile /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers"
        element={
          <ProtectedRoute role="admin">
            <AppLayout><TeachersList /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <AppLayout><Attendance /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/training"
        element={
          <ProtectedRoute>
            <AppLayout><Training /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lesson-plans"
        element={
          <ProtectedRoute>
            <AppLayout><LessonPlans /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback"
        element={
          <ProtectedRoute>
            <AppLayout><Feedback /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AppLayout><Analytics /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher-journey/:id"
        element={
          <ProtectedRoute>
            <AppLayout><TeacherJourney /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/achievements"
        element={
          <ProtectedRoute>
            <AppLayout><AchievementWall /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/goals"
        element={
          <ProtectedRoute>
            <AppLayout><Goals /></AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
