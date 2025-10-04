import React, { useState } from 'react';
import { useAuthContext } from './AuthProvider';

// Example usage of the auth system
export function LoginExample() {
  const { isAuthenticated, isLoading, login, logout } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return (
      <div>
        <p>You are logged in!</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin}>
      <div>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={isLoading}>
        Login
      </button>
    </form>
  );
}