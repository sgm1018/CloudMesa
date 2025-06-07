import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAppContext } from '../../context/AppContext';
import FilesView from '../files/FilesView';
import PasswordsView from '../passwords/PasswordsView';
import SettingsView from '../settings/SettingsView';
import { useAuth } from '../../context/AuthContext';
import AuthPage from '../auth/AuthPage';

const MainLayout: React.FC = () => {
  const { currentView, isSidebarCollapsed } = useAppContext();
  const { isAuthenticated } = useAuth();
  const auth : boolean = isAuthenticated();
  if (!auth) return <AuthPage/>
  return (
    <div className="min-h-screen flex bg-background-primary">
      <Sidebar />
      <div 
        className={`flex-1 ${
          isSidebarCollapsed ? 'ml-16' : 'ml-60'
        }`}
      >
        <Header />
        <main className="p-6">
          {currentView === 'files' && <FilesView />}
          {currentView === 'passwords' && <PasswordsView />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;