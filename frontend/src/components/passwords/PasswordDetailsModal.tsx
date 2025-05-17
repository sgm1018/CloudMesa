import React, { useState, useEffect } from 'react';
import { X, Copy, Eye, EyeOff, ExternalLink, Share } from 'lucide-react';
import { Item } from '../../types';
import { useToast } from '../../context/ToastContext';
import ShareModal from '../shared/ShareModal';

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
  const [name, setName] = useState(password.name);
  const [username, setUsername] = useState(password.encryptedMetadata.username || '');
  const [passwordValue, setPasswordValue] = useState(password.encryptedMetadata.password || '');
  const [url, setUrl] = useState(password.encryptedMetadata.url || '');
  const [notes, setNotes] = useState(password.encryptedMetadata.notes || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    setName(password.name);
    setUsername(password.encryptedMetadata.username || '');
    setPasswordValue(password.encryptedMetadata.password || '');
    setUrl(password.encryptedMetadata.url || '');
    setNotes(password.encryptedMetadata.notes || '');
    setIsEditing(false);
    setShowPassword(false);
  }, [password]);

  const copyToClipboard = async (text: string, type: 'username' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${type === 'username' ? 'Username' : 'Password'} copied to clipboard`);
    } catch (error) {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !passwordValue) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    onSave({ name, username, password: passwordValue, url, notes });
    setIsEditing(false);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-elevation-3 w-full max-w-lg">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold">Password Details</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <Share className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">
                  Name
                </label>
                {isEditing ? (
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                    required
                  />
                ) : (
                  <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded">{name}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="username">
                  Username
                </label>
                {isEditing ? (
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input"
                    required
                  />
                ) : (
                  <div className="flex items-center">
                    <div className="flex-1 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      {username}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(username, 'username')}
                      className="ml-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="password">
                  Password
                </label>
                {isEditing ? (
                  <input
                    id="password"
                    type="text"
                    value={passwordValue}
                    onChange={(e) => setPasswordValue(e.target.value)}
                    className="input"
                    required
                  />
                ) : (
                  <div className="flex items-center">
                    <div className="flex-1 p-2 bg-gray-50 dark:bg-gray-900 rounded font-mono">
                      {showPassword ? passwordValue : '••••••••••••'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="ml-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(passwordValue, 'password')}
                      className="ml-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="url">
                  Website URL
                </label>
                {isEditing ? (
                  <input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="input"
                  />
                ) : (
                  <div className="flex items-center">
                    <div className="flex-1 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      {url}
                    </div>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="notes">
                  Notes
                </label>
                {isEditing ? (
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input min-h-[100px]"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded min-h-[100px] whitespace-pre-wrap">
                    {notes}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-secondary"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="btn btn-primary"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        items={[password]}
        onShare={(users) => {
          setShowShareModal(false);
          showToast('Password shared successfully');
        }}
      />
    </>
  );
};

export default PasswordDetailsModal;