import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import MainLayout from './components/layout/MainLayout';
import AuthPage from './components/auth/AuthPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { EncryptionProvider } from './context/EncryptionContext';
import { BoardView } from './pages/BoardView';




function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <EncryptionProvider>
          <AuthProvider>
            <AppProvider>
              <ToastProvider>
                <AppRoutes />
              </ToastProvider>
            </AppProvider>
          </AuthProvider>
        </EncryptionProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

// Componente separado para las rutas
function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Routes>
      <Route 
        path="/login" 
        element={!isAuthenticated() ? <AuthPage /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/dashboard" 
        element={isAuthenticated() ? <MainLayout /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/boards/:boardId" 
        element={isAuthenticated() ? <BoardView /> : <Navigate to="/login" replace />} 
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;