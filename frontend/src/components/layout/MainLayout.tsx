import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAppContext } from '../../context/AppContext';
import FilesView from '../files/FilesView';
import PasswordsView from '../passwords/PasswordsView';
import SettingsView from '../settings/SettingsView';
import { useAuth } from '../../context/AuthContext';
import AuthPage from '../auth/AuthPage';
import PrivateKeyModal from '../shared/PrivateKeyModal';
import PrivateKeyImportModal from '../shared/PrivateKeyImportModal';
import { useEncryption } from '../../context/EncryptionContext';

const MainLayout: React.FC = () => {
  const { currentView, isSidebarCollapsed } = useAppContext();
  const { isAuthenticated, isShowPrivateKey , setShowPrivateKey } = useAuth();
  const { privateKey } = useEncryption(); 
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
            {/* Modal de Clave Privada */}
      <PrivateKeyModal
        isOpen={isShowPrivateKey}
        onClose={() => setShowPrivateKey(false)}
      />
      
      {/* Modal de Importar Clave Privada */}
      <PrivateKeyImportModal
        isOpen={!privateKey && auth}
        onClose={() => {}}
      />
    </div>
  );
};

export default MainLayout;