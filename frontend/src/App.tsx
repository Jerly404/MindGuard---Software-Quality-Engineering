import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Assessment from './pages/Assessment';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import FloatingChatbot from './components/FloatingChatbot';
import { authApi } from './services/api';
import './index.css';

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const user = authApi.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const HomeRedirect = () => {
    const user = authApi.getCurrentUser();
    if (!user) return <Navigate to="/login" replace />;
    
    if (user.rol === 'admin' || user.rol === 'administrador') return <AdminDashboard />;
    if (user.rol === 'profesional') return <ProfessionalDashboard />;
    return <Dashboard />; 
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!authApi.getCurrentUser());
  const user = authApi.getCurrentUser();
  const showChatbot = isAuthenticated && user && (user.rol === 'usuario' || user.rol === 'paciente');

  const handleAuthChange = () => {
    setIsAuthenticated(!!authApi.getCurrentUser());
  };

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Navbar onLogout={handleAuthChange} />}
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login onLogin={handleAuthChange} />} />
            <Route path="/signup" element={<Signup onSignup={handleAuthChange} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <HomeRedirect />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute roles={['admin', 'administrador']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/professional-dashboard" 
              element={
                <ProtectedRoute roles={['profesional']}>
                  <ProfessionalDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/assessment" 
              element={
                <ProtectedRoute roles={['usuario', 'paciente', 'admin']}>
                  <Assessment />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        {showChatbot && <FloatingChatbot />}
      </div>
    </Router>
  );
}

export default App;
