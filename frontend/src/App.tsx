import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import MainLayout from './components/layout/MainLayout';
import AuthPage from './components/auth/AuthPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';




function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <ToastProvider>
            <Routes>
              <Route path="/login" element={<AuthPage />} />
              <Route path="/dashboard/*" element={<MainLayout />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            </ToastProvider>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;