import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RelatosPage from './pages/RelatosPage';
import DashboardPage from './pages/DashboardPage';
import InicioPage from './pages/InicioPage';

function getUser(): { role?: string } {
  try {
    return JSON.parse(localStorage.getItem('user') ?? '{}');
  } catch {
    return {};
  }
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

// Dashboard (visão admin) só é acessível para role === 'admin'.
// Usuário comum que tentar acessar "/" é redirecionado para "/inicio".
function AdminRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  const user = getUser();
  return user.role === 'admin' ? <>{children}</> : <Navigate to="/inicio" replace />;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <AdminRoute>
              <DashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/inicio"
          element={
            <PrivateRoute>
              <InicioPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/relatos"
          element={
            <PrivateRoute>
              <RelatosPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
