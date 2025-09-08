import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginForm from './components/LoginForm';
import { AuthGuard } from './guards/AuthGuard';

function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1>Welcome {user?.email}</h1>
      <button onClick={logout}>Logout</button>
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
