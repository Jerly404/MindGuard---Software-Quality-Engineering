import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Assessment from './pages/Assessment';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { authApi } from './services/api';
import './index.css';

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const user = authApi.getCurrentUser();
  if (roles && user && !roles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const HomeRedirect = () => {
    const user = authApi.getCurrentUser();
    if (!user) return <Navigate to="/login" replace />;
    
    // Roles: 'usuario', 'paciente', 'profesional', 'administrador'
    if (user.rol === 'administrador') return <AdminDashboard />;
    if (user.rol === 'profesional') return <ProfessionalDashboard />;
    return <Dashboard />; 
};

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <div className="App">
        {token && <Navbar />}
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <HomeRedirect />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/assessment" 
              element={
                <ProtectedRoute roles={['usuario', 'paciente']}>
                  <Assessment />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
