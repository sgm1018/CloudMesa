import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Camera, Key, Shield, Bell, Moon, Sun, Trash2, Save } from 'lucide-react';
import TwoFactorSetup from './TwoFactorSetup';
import { useTheme } from '../../context/ThemeContext';

const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const {isDarkMode, toggleTheme, setDarkMode} =  useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.user.name || '',
    surname: user?.user.surname || '',
    email: user?.user.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    darkMode: false,
    notifications: true,
    twoFactorEnabled: false
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      showToast('Profile picture updated successfully');
    }
  };

  const handleSave = () => {
    if (formData.darkMode){
      setDarkMode(true);
    }else{
      setDarkMode(false);
    }
    
    showToast('Settings saved successfully');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      showToast('Account deleted successfully', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-2 rounded-lg mb-2 ${
                activeTab === 'profile'
                  ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-4 py-2 rounded-lg mb-2 ${
                activeTab === 'security'
                  ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full text-left px-4 py-2 rounded-lg ${
                activeTab === 'preferences'
                  ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Preferences
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
                
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center overflow-hidden">
                      {user?.user.avatar ? (
                        <img src={user.user.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl font-medium text-primary-700 dark:text-primary-300">
                          {user?.user.name.charAt(0)}
                          {user?.user.surname.charAt(0)}
                        </span>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700">
                      <Camera className="h-4 w-4" />
                      <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                  </div>
                  <div>
                    <h3 className="font-medium">Profile Picture</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Upload a new profile picture
                    </p>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input
                      type="text"
                      value={formData.surname}
                      onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-6">Security Settings</h2>

                {/* Change Password */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center">
                    <Key className="h-5 w-5 mr-2" />
                    Change Password
                  </h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">Current Password</label>
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">New Password</label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div>
                        <h3 className="font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowTwoFactorSetup(true)}
                      className={`btn ${formData.twoFactorEnabled ? 'btn-secondary' : 'btn-primary'}`}
                    >
                      {formData.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
                    </button>
                  </div>
                </div>

                {/* Delete Account */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium flex items-center mb-4">
                    <Trash2 className="h-5 w-5 mr-2 text-error-500" />
                    Delete Account
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button 
                    className="btn bg-error-600 hover:bg-error-700 text-white"
                    onClick={handleDeleteAccount}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-6">Preferences</h2>

                {/* Theme */}
                <div>
                  <h3 className="font-medium flex items-center mb-4">
                    {formData.darkMode ? (
                      <Moon className="h-5 w-5 mr-2" />
                    ) : (
                      <Sun className="h-5 w-5 mr-2" />
                    )}
                    Theme
                  </h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.darkMode}
                      onChange={(e) => setFormData({ ...formData, darkMode: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`relative w-14 h-7 rounded-full ${
                      formData.darkMode ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      <div className={`absolute left-1 top-1 w-5 h-5 rounded-full bg-white transform ${
                        formData.darkMode ? 'translate-x-7' : ''
                      }`} />
                    </div>
                    <span className="ml-3">Dark Mode</span>
                  </label>
                </div>

                {/* Notifications */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium flex items-center mb-4">
                    <Bell className="h-5 w-5 mr-2" />
                    Notifications
                  </h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.notifications}
                      onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`relative w-14 h-7 rounded-full ${
                      formData.notifications ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      <div className={`absolute left-1 top-1 w-5 h-5 rounded-full bg-white transform ${
                        formData.notifications ? 'translate-x-7' : ''
                      }`} />
                    </div>
                    <span className="ml-3">Enable Notifications</span>
                  </label>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                className="btn btn-primary"
                onClick={handleSave}
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <TwoFactorSetup
        isOpen={showTwoFactorSetup}
        onClose={() => setShowTwoFactorSetup(false)}
      />
    </div>
  );
};

export default SettingsView;