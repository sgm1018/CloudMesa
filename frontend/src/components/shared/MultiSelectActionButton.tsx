import React, { useState, useRef, useEffect } from 'react';
import { 
  Share, 
  Download, 
  Trash, 
  Copy,
  ExternalLink,
  Eye,
  MoreVertical,
  CheckSquare
} from 'lucide-react';
import { Item, ItemType } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface MultiSelectActionButtonProps {
  selectedItems: Item[];
  contextType: 'file' | 'password';
  // Action handlers that work with multiple items
  onShare?: (items: Item[]) => void;
  onDownload?: (items: Item[]) => void;
  onDelete?: (items: Item[]) => void;
  onCopyUsername?: (items: Item[]) => void;
  onCopyPassword?: (items: Item[]) => void;
  onVisitWebsite?: (items: Item[]) => void;
  onTogglePasswordVisibility?: (items: Item[]) => void;
}

interface MultiSelectAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: (items: Item[]) => void;
  className?: string;
  condition?: (items: Item[]) => boolean;
  dividerAfter?: boolean;
}

const MultiSelectActionButton: React.FC<MultiSelectActionButtonProps> = ({
  selectedItems,
  contextType,
  onShare,
  onDownload,
  onDelete,
  onCopyUsername,
  onCopyPassword,
  onVisitWebsite,
  onTogglePasswordVisibility
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { setSelectedItems } = useAppContext();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen && 
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
        setMenuPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (isMenuOpen) {
      setIsMenuOpen(false);
      setMenuPosition(null);
      return;
    }

    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    setMenuPosition({
      top: rect.bottom + scrollTop + 4,
      left: rect.left
    });
    setIsMenuOpen(true);
  };

  const handleActionClick = (action: MultiSelectAction) => {
    action.onClick(selectedItems);
    setIsMenuOpen(false);
    setMenuPosition(null);
  };

  const clearSelection = () => {
    setSelectedItems([]);
    setIsMenuOpen(false);
    setMenuPosition(null);
  };

  // Build actions based on context type and selected items
  const getActions = (): MultiSelectAction[] => {
    const actions: MultiSelectAction[] = [];

    // Helper function to get appropriate label
    const getLabel = (singular: string, plural: string) => 
      selectedItems.length > 1 ? `${plural} (${selectedItems.length})` : singular;

    // Common actions for all contexts
    if (onShare) {
      actions.push({
        id: 'share',
        label: getLabel('Share', 'Share All'),
        icon: <Share className="h-4 w-4" />,
        onClick: onShare
      });
    }

    if (onDelete) {
      actions.push({
        id: 'delete',
        label: `Delete ${selectedItems.length} items`,
        icon: <Trash className="h-4 w-4" />,
        onClick: onDelete,
        className: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
        dividerAfter: true
      });
    }

    switch (contextType) {
      case 'password':
        // Password-specific bulk actions
        if (onCopyUsername && selectedItems.every(item => item.encryptedMetadata.username)) {
          actions.unshift({
            id: 'copy-usernames',
            label: 'Copy All Usernames',
            icon: <Copy className="h-4 w-4" />,
            onClick: onCopyUsername
          });
        }

        if (onCopyPassword && selectedItems.every(item => item.encryptedMetadata.password)) {
          actions.unshift({
            id: 'copy-passwords',
            label: 'Copy All Passwords',
            icon: <Copy className="h-4 w-4" />,
            onClick: onCopyPassword
          });
        }

        if (onVisitWebsite && selectedItems.every(item => item.encryptedMetadata.url)) {
          actions.unshift({
            id: 'visit-websites',
            label: 'Open All Websites',
            icon: <ExternalLink className="h-4 w-4" />,
            onClick: onVisitWebsite
          });
        }

        if (onTogglePasswordVisibility) {
          actions.unshift({
            id: 'toggle-visibility',
            label: 'Toggle Visibility',
            icon: <Eye className="h-4 w-4" />,
            onClick: onTogglePasswordVisibility,
            dividerAfter: true
          });
        }
        break;

      case 'file':
        // File-specific bulk actions
        if (onDownload && selectedItems.every(item => item.type !== ItemType.GROUP)) {
          actions.unshift({
            id: 'download',
            label: `Download ${selectedItems.length} files`,
            icon: <Download className="h-4 w-4" />,
            onClick: onDownload,
            dividerAfter: true
          });
        }
        break;
    }

    return actions;
  };

  const actions = getActions();

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2 mr-4">
        <div className="flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 rounded-md text-sm">
          <CheckSquare className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          <span className="text-primary-700 dark:text-primary-300 font-medium">
            {selectedItems.length} selected
          </span>
        </div>
        
        <button
          ref={buttonRef}
          onClick={handleButtonClick}
          className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm transition-colors"
          title="Bulk actions"
        >
          <MoreVertical className="h-4 w-4" />
          <span>Actions</span>
        </button>

        <button
          onClick={clearSelection}
          className="px-2 py-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm transition-colors"
          title="Clear selection"
        >
          Clear
        </button>
      </div>

      {/* Actions menu */}
      {isMenuOpen && menuPosition && (
        <div 
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            zIndex: 1000,
          }}
          className="bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[200px]"
        >
          {actions.map((action, index) => (
            <React.Fragment key={action.id}>
              <button
                onClick={() => handleActionClick(action)}
                className={`w-full flex items-center px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  action.className || 'text-gray-700 dark:text-gray-300'
                }`}
                disabled={action.condition && !action.condition(selectedItems)}
              >
                <span className="mr-2">{action.icon}</span>
                {action.label}
              </button>
              {action.dividerAfter && index < actions.length - 1 && (
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </>
  );
};

export default MultiSelectActionButton;
