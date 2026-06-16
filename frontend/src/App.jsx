// App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

// Route Components
import AdminRoutes from './routes/AdminRoutes';
import CustomerRoutes from './routes/CustomerRoutes';

// Pages
import CustomerLoginPage from './pages/customer/CustomerLoginPage';
import LoginForm from './pages/LoginForm';

function App() {
  return (
    <Routes>
      {/* Customer Routes */}
      <Route path="/*" element={<CustomerRoutes />} />
      
      {/* Customer Login - Public */}
      <Route path="/customer/login" element={<CustomerLoginPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/admin/login" element={<LoginForm />} />

      {/* Legacy redirects */}
      <Route path="/login" element={<Navigate to="/admin/login" replace />} />
      <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/dashboard/*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}

export default App;
