import React, { useRef, useEffect } from 'react';
import { 
  Share, 
  Download, 
  Edit, 
  Trash, 
  Copy, 
  ExternalLink,
  Eye,
  Folder,
  FileText
} from 'lucide-react';
import { Item, ItemType } from '../../types';

interface MenuAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: (item: Item) => void;
  className?: string;
  condition?: (item: Item) => boolean;
  dividerAfter?: boolean;
}

interface RightClickElementModalProps {
  isOpen: boolean;
  position: { top: number; left: number } | null;
  item: Item | null;
  onClose: () => void;
  contextType: 'file' | 'password' | 'folder';
  actions?: MenuAction[];
  // Default actions handlers
  onShare?: (item: Item) => void;
  onDownload?: (item: Item) => void;
  onEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
  onCopyUsername?: (item: Item) => void;
  onCopyPassword?: (item: Item) => void;
  onVisitWebsite?: (item: Item) => void;
  onTogglePasswordVisibility?: (item: Item) => void;
  onRename?: (item: Item) => void;
  onViewDetails?: (item: Item) => void;
}

const RightClickElementModal: React.FC<RightClickElementModalProps> = ({
  isOpen,
  position,
  item,
  onClose,
  contextType,
  actions = [],
  onShare,
  onDownload,
  onEdit,
  onDelete,
  onCopyUsername,
  onCopyPassword,
  onVisitWebsite,
  onTogglePasswordVisibility,
  onRename,
  onViewDetails
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !position || !item) return null;

  // Define default actions based on context type
  const getDefaultActions = (): MenuAction[] => {
    const defaultActions: MenuAction[] = [];

    switch (contextType) {
      case 'password':
        if (item.type === ItemType.PASSWORD) {
          // Password-specific actions
          if (onCopyUsername && item.encryptedMetadata.username) {
            defaultActions.push({
              id: 'copy-username',
              label: 'Copy Username',
              icon: <Copy className="h-4 w-4 mr-2" />,
              onClick: onCopyUsername
            });
          }

          if (onCopyPassword && item.encryptedMetadata.password) {
            defaultActions.push({
              id: 'copy-password',
              label: 'Copy Password',
              icon: <Copy className="h-4 w-4 mr-2" />,
              onClick: onCopyPassword
            });
          }

          if (onVisitWebsite && item.encryptedMetadata.url) {
            defaultActions.push({
              id: 'visit-website',
              label: 'Visit Website',
              icon: <ExternalLink className="h-4 w-4 mr-2" />,
              onClick: onVisitWebsite
            });
          }

          if (onTogglePasswordVisibility) {
            defaultActions.push({
              id: 'toggle-visibility',
              label: 'Toggle Visibility',
              icon: <Eye className="h-4 w-4 mr-2" />,
              onClick: onTogglePasswordVisibility
            });
          }

          // Add divider after password-specific actions
          if (defaultActions.length > 0) {
            defaultActions[defaultActions.length - 1].dividerAfter = true;
          }
        }
        break;

      case 'file':
        if (item.type !== ItemType.GROUP) {
          if (onDownload) {
            defaultActions.push({
              id: 'download',
              label: 'Download',
              icon: <Download className="h-4 w-4 mr-2" />,
              onClick: onDownload
            });
          }

          if (onViewDetails) {
            defaultActions.push({
              id: 'view-details',
              label: 'View Details',
              icon: <FileText className="h-4 w-4 mr-2" />,
              onClick: onViewDetails
            });
          }
        }
        break;

      case 'folder':
        if (onViewDetails) {
          defaultActions.push({
            id: 'view-details',
            label: 'Properties',
            icon: <Folder className="h-4 w-4 mr-2" />,
            onClick: onViewDetails
          });
        }
        break;
    }

    // Common actions for all types
    if (onShare) {
      defaultActions.push({
        id: 'share',
        label: 'Share',
        icon: <Share className="h-4 w-4 mr-2" />,
        onClick: onShare
      });
    }

    if (onEdit || onRename) {
      defaultActions.push({
        id: 'edit',
        label: contextType === 'password' ? 'Edit' : 'Rename',
        icon: <Edit className="h-4 w-4 mr-2" />,
        onClick: onEdit || onRename || (() => {})
      });
    }

    if (onDelete) {
      defaultActions.push({
        id: 'delete',
        label: 'Delete',
        icon: <Trash className="h-4 w-4 mr-2" />,
        onClick: onDelete,
        className: 'text-red-600 dark:text-red-400'
      });
    }

    return defaultActions;
  };

  // Merge default actions with custom actions
  const allActions = actions.length > 0 ? actions : getDefaultActions();

  // Filter actions based on conditions
  const visibleActions = allActions.filter(action => 
    !action.condition || action.condition(item)
  );

  const handleActionClick = (action: MenuAction, event: React.MouseEvent) => {
    event.stopPropagation();
    action.onClick(item);
    onClose();
  };

  return (
    <div 
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 50
      }}
      className="w-44 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 menu-dropdown"
    >
      {visibleActions.map((action, index) => (
        <React.Fragment key={action.id}>
          <button
            className={`w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
              action.className || ''
            }`}
            onClick={(e) => handleActionClick(action, e)}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
          {action.dividerAfter && index < visibleActions.length - 1 && (
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default RightClickElementModal;
