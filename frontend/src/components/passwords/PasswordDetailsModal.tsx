import React, { useState, useEffect } from 'react';
import { X, Copy, Eye, EyeOff, ExternalLink, Share, Edit3, Save, RotateCcw, RefreshCw, Check } from 'lucide-react';
import { Item } from '../../types';
import { useToast } from '../../context/ToastContext';
// import ShareModal from '../shared/ShareModal';

interface PasswordDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  password: Item;
  onSave: (data: {
    name: string;
    username: string;
    password: string;
    url?: string;
    notes?: string;
  }) => void;
}

const PasswordDetailsModal: React.FC<PasswordDetailsModalProps> = ({
  isOpen,
  onClose,
  password,
  onSave,
}) => {
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(password.encryptedMetadata.name);
  const [username, setUsername] = useState(password.encryptedMetadata.username || '');
  const [passwordValue, setPasswordValue] = useState(password.encryptedMetadata.password || '');
  const [url, setUrl] = useState(password.encryptedMetadata.url || '');
  const [notes, setNotes] = useState(password.encryptedMetadata.notes || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Password generator settings
  const [showGenerator, setShowGenerator] = useState(false);
  const [length, setLength] = useState(16);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setName(password.encryptedMetadata.name || '');
    setUsername(password.encryptedMetadata.username || '');
    setPasswordValue(password.encryptedMetadata.password || '');
    setUrl(password.encryptedMetadata.url || '');
    setNotes(password.encryptedMetadata.notes || '');
    setIsEditing(false);
    setShowPassword(false);
    setShowGenerator(false);
  }, [password]);

  const generatePassword = () => {
    let charset = '';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) {
      showToast('Please select at least one character type', 'error');
      return;
    }

    let newPassword = '';
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPasswordValue(newPassword);
    setCopied(false);
  };

  const copyToClipboard = async (text: string, type: 'username' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${type === 'username' ? 'Username' : 'Password'} copied to clipboard`);
    } catch (error) {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const copyGeneratedPassword = async () => {
    try {
      await navigator.clipboard.writeText(passwordValue);
      setCopied(true);
      showToast('Password copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast('Failed to copy password', 'error');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !passwordValue.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    onSave({ name: name.trim(), username: username.trim(), password: passwordValue, url: url.trim(), notes: notes.trim() });
    setIsEditing(false);
    setShowGenerator(false);
    showToast('Password updated successfully', 'success');
  };

  const handleCancel = () => {
    setName(password.encryptedMetadata.name || '');
    setUsername(password.encryptedMetadata.username || '');
    setPasswordValue(password.encryptedMetadata.password || '');
    setUrl(password.encryptedMetadata.url || '');
    setNotes(password.encryptedMetadata.notes || '');
    setIsEditing(false);
    setShowGenerator(false);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isEditing ? 'Edit Password' : 'Password Details'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {!isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
                    title="Edit password"
                  >
                    <Edit3 className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
                    title="Share password"
                  >
                    <Share className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
                title="Close"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-sm"
                      placeholder="Enter password name"
                      required
                    />
                  ) : (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <span className="text-gray-900 dark:text-white font-medium">{name}</span>
                    </div>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="username">
                    Username <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-sm"
                      placeholder="Enter username"
                      required
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-900 dark:text-white text-sm">{username}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(username, 'username')}
                        className="p-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl transition-all duration-200 group"
                        title="Copy username"
                      >
                        <Copy className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
                    Password <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          id="password"
                          type="text"
                          value={passwordValue}
                          onChange={(e) => setPasswordValue(e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white font-mono transition-all duration-200 text-sm"
                          placeholder="Enter password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowGenerator(!showGenerator)}
                          className="px-4 py-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl transition-all duration-200 font-medium text-sm"
                        >
                          Generate
                        </button>
                      </div>

                      {/* Password Generator */}
                      {showGenerator && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-6">
                          <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Password Length: <span className="text-blue-600 dark:text-blue-400 font-mono">{length}</span>
                            </label>
                            <input
                              type="range"
                              min="8"
                              max="64"
                              value={length}
                              onChange={(e) => setLength(parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>8</span>
                              <span>64</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center space-x-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={includeLowercase}
                                onChange={(e) => setIncludeLowercase(e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                Lowercase (a-z)
                              </span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={includeUppercase}
                                onChange={(e) => setIncludeUppercase(e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                Uppercase (A-Z)
                              </span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={includeNumbers}
                                onChange={(e) => setIncludeNumbers(e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                Numbers (0-9)
                              </span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={includeSymbols}
                                onChange={(e) => setIncludeSymbols(e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                Symbols (!@#$%^&*)
                              </span>
                            </label>
                          </div>

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={generatePassword}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 rounded-xl transition-all duration-200 font-medium text-sm group"
                            >
                              <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                              Generate Password
                            </button>
                            {passwordValue && (
                              <button
                                type="button"
                                onClick={copyGeneratedPassword}
                                className="p-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl transition-all duration-200 group"
                                title="Copy password"
                              >
                                {copied ? (
                                  <Check className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                ) : (
                                  <Copy className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-900 dark:text-white font-mono text-sm tracking-wider">
                          {showPassword ? passwordValue : '••••••••••••'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? 
                          <EyeOff className="h-4 w-4 group-hover:scale-110 transition-transform" /> : 
                          <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        }
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(passwordValue, 'password')}
                        className="p-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl transition-all duration-200 group"
                        title="Copy password"
                      >
                        <Copy className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>

                {/* URL */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="url">
                    Website URL
                  </label>
                  {isEditing ? (
                    <input
                      id="url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-sm"
                      placeholder="https://example.com"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-900 dark:text-white break-all text-sm">
                          {url || <span className="text-gray-500 dark:text-gray-400 italic">No URL provided</span>}
                        </span>
                      </div>
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 rounded-xl transition-all duration-200 group"
                          title="Open website"
                        >
                          <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="notes">
                    Notes
                  </label>
                  {isEditing ? (
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white min-h-[120px] resize-none transition-all duration-200 text-sm"
                      placeholder="Add any additional notes..."
                    />
                  ) : (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 min-h-[120px]">
                      <span className="text-gray-900 dark:text-white whitespace-pre-wrap text-sm">
                        {notes || <span className="text-gray-500 dark:text-gray-400 italic">No notes provided</span>}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end gap-3">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-all duration-200 font-medium"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        items={[password]}
        onShare={(users) => {
          setShowShareModal(false);
          showToast('Password shared successfully');
        }}
      /> */}
    </>
  );
};

export default PasswordDetailsModal;