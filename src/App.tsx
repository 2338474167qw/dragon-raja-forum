import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Forum from './pages/Forum';
import PostDetail from './pages/PostDetail';
import Courses from './pages/Courses';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import { useUserStore } from './store/userStore';

function AppContent() {
  const { fetchUser, isAuthenticated } = useUserStore();

  useEffect(() => {
    // 应用启动时检查登录状态
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      fetchUser();
    }
  }, []);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/:id" element={<PostDetail />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<Courses />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
