import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import axios from 'axios';

// Ensure credentials are sent with every request
axios.defaults.withCredentials = true;

// Add request interceptor to attach Bearer token
axios.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('staffly_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Payroll from './pages/Payroll';
import RecruitmentBoard from './pages/RecruitmentBoard';
import Assets from './pages/Assets';
import Documents from './pages/Documents';
import OrgChart from './pages/OrgChart';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" />;

  return <>{children}</>;
};

// Route wrapper for Layout
const AppLayout = () => {
  return (
    <DashboardLayout />
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ThemeProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route element={<AppLayout />}>
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employees"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Employees />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruitment"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <RecruitmentBoard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assets"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Assets />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/documents"
                  element={
                    <ProtectedRoute>
                      <Documents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/org-chart"
                  element={
                    <ProtectedRoute>
                      <OrgChart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/attendance"
                  element={
                    <ProtectedRoute>
                      <Attendance />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leaves"
                  element={
                    <ProtectedRoute>
                      <Leaves />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payroll"
                  element={
                    <ProtectedRoute>
                      <Payroll />
                    </ProtectedRoute>
                  }
                />
              </Route>

              <Route
                path="/"
                element={<Navigate to="/dashboard" />}
              />
            </Routes>
          </Router>
        </ThemeProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
