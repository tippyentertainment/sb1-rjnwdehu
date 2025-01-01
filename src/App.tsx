import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SprintList } from './components/SprintList';
import { TaskBoard } from './components/TaskBoard';
import { ConfigError } from './components/ConfigError';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

function App() {
  const { session, error } = useAuth();

  if (error) {
    return <ConfigError message={error} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/signup" element={!session ? <SignupPage /> : <Navigate to="/" />} />
        <Route
          path="/"
          element={
            session ? (
              <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow">
                  <div className="max-w-7xl mx-auto py-6 px-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                      TaskTide Sprint Helper
                    </h1>
                  </div>
                </header>
                <main className="max-w-7xl mx-auto py-6 px-4">
                  <div className="grid gap-6">
                    <SprintList />
                  </div>
                </main>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/sprint/:sprintId"
          element={
            session ? (
              <TaskBoard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;