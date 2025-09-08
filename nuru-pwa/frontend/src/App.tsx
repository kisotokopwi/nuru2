import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginForm from './components/LoginForm';
import { AuthGuard } from './guards/AuthGuard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import DailyReportForm from './components/DailyReportForm';
import AdminConfiguration from './pages/AdminConfiguration';
import InvoiceGeneration from './pages/InvoiceGeneration';
import InvoiceSearch from './pages/InvoiceSearch';

function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1>Welcome {user?.email}</h1>
      <button onClick={logout}>Logout</button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 16 }}>
        <div>
          <h3>Supervisor</h3>
          <SupervisorDashboard />
          <DailyReportForm />
        </div>
        <div>
          <h3>Admin</h3>
          <AdminConfiguration />
          <InvoiceGeneration />
          <InvoiceSearch />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthGuard fallback={<LoginForm />}>
        <Dashboard />
      </AuthGuard>
    </AuthProvider>
  );
}

export default App;
