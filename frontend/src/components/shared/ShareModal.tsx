import React, { useState, useEffect, useRef } from 'react';
import { Item, User } from '../../types';
import { useToast } from '../../context/ToastContext';
import { X, Users, Link2, Copy, Check, Search, Trash2 } from 'lucide-react';
import { mockUsers } from '../../data/mockData';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  onShare?: (users: { userId: string; permissions: { read: boolean; write: boolean } }[]) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, items, onShare }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<{
    userId: string;
    permissions: { read: boolean; write: boolean };
  }[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [publicLink, setPublicLink] = useState<string | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize selected users from items' shared users
  useEffect(() => {
    if (items.length === 1 && items[0].sharedWith) {
      setSelectedUsers(
        items[0].sharedWith.map(share => ({
          userId: share.userId,
          permissions: share.permissions
        }))
      );
    }
  }, [items]);

  // Handle click outside search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search users
  useEffect(() => {
    if (searchQuery.length > 0) {
      const results = mockUsers.filter(
        user =>
          (user.name.toLowerCase() + ' ' + user.surname.toLowerCase()).includes(
            searchQuery.toLowerCase()
          ) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  const handleUserSelect = (user: User) => {
    if (!selectedUsers.some(u => u.userId === user._id)) {
      setSelectedUsers([
        ...selectedUsers,
        { userId: user._id, permissions: { read: true, write: false } }
      ]);
    }
    setSearchQuery('');
    setShowSearchResults(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handlePermissionChange = (userId: string, type: 'read' | 'write', value: boolean) => {
    setSelectedUsers(prev =>
      prev.map(user =>
        user.userId === userId
          ? {
              ...user,
              permissions: {
                ...user.permissions,
                [type]: value,
                // Ensure read permission is enabled if write permission is enabled
                read: type === 'write' ? (value ? true : user.permissions.read) : value
              }
            }
          : user
      )
    );
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user.userId !== userId));
    showToast('User removed from sharing');
  };

  const generatePublicLink = () => {
    // In a real app, this would make an API call to generate a unique link
    const link = `https://CloudMesa.example.com/share/${items[0]._id}`;
    setPublicLink(link);
    showToast('Public link generated');
  };

  const copyPublicLink = async () => {
    if (!publicLink) return;
    
    try {
      await navigator.clipboard.writeText(publicLink);
      showToast('Link copied to clipboard');
    } catch (error) {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(selectedUsers);
    }
    showToast('Sharing settings updated');
    onClose();
  };

  if (!isOpen) return null;

  const getUserById = (id: string) => mockUsers.find(user => user._id === id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-elevation-3 w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-semibold">
              Share {items.length > 1 ? `${items.length} items` : items[0].name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* User search */}
          <div ref={searchContainerRef} className="relative">
            <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-lg px-3 py-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Add people by name or email"
                className="ml-2 bg-transparent border-none outline-none w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Search results dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                {searchResults.map(user => (
                  <button
                    key={user._id}
                    className="w-full flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-medium text-primary-700 dark:text-primary-300">
                          {user.name.charAt(0)}
                          {user.surname.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium">{user.name} {user.surname}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected users list */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              {selectedUsers.map(({ userId, permissions }) => {
                const user = getUserById(userId);
                if (!user) return null;

                return (
                  <div
                    key={userId}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-lg p-3"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-medium text-primary-700 dark:text-primary-300">
                            {user.name.charAt(0)}
                            {user.surname.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">{user.name} {user.surname}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center space-x-1 text-sm">
                          <input
                            type="checkbox"
                            checked={permissions.read}
                            onChange={(e) => handlePermissionChange(userId, 'read', e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span>Read</span>
                        </label>
                        <label className="flex items-center space-x-1 text-sm">
                          <input
                            type="checkbox"
                            checked={permissions.write}
                            onChange={(e) => handlePermissionChange(userId, 'write', e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span>Write</span>
                        </label>
                      </div>
                      <button
                        onClick={() => removeUser(userId)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Public link section (only for single file/folder) */}
          {items.length === 1 && items[0].type === 'file' && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Link2 className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Public Link</span>
                </div>
                {!publicLink && (
                  <button
                    onClick={generatePublicLink}
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Generate Link
                  </button>
                )}
              </div>

              {publicLink && (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={publicLink}
                    readOnly
                    className="flex-1 bg-gray-100 dark:bg-gray-900 rounded px-3 py-2 text-sm"
                  />
                  <button
                    onClick={copyPublicLink}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleShare} className="btn btn-primary">
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;