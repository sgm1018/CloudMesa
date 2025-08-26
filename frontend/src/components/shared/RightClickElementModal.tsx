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
import { useAppContext } from '../../context/AppContext';

interface MenuAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: (item: Item | Item[]) => void;
  className?: string;
  condition?: (item: Item | Item[]) => boolean;
  dividerAfter?: boolean;
}

interface RightClickElementModalProps {
  isOpen: boolean;
  position: { top: number; left: number } | null;
  item: Item | null;
  onClose: () => void;
  contextType: 'file' | 'password' | 'folder';
  actions?: MenuAction[];
  // All available items to match with selected IDs
  allItems?: Item[];
  // Default actions handlers - now support both single item and multiple items
  onShare?: (item: Item | Item[]) => void;
  onDownload?: (item: Item | Item[]) => void;
  onEdit?: (item: Item | Item[]) => void;
  onDelete?: (item: Item | Item[]) => void;
  onCopyUsername?: (item: Item | Item[]) => void;
  onCopyPassword?: (item: Item | Item[]) => void;
  onVisitWebsite?: (item: Item | Item[]) => void;
  onTogglePasswordVisibility?: (item: Item | Item[]) => void;
  onRename?: (item: Item | Item[]) => void;
  onViewDetails?: (item: Item | Item[]) => void;
}

const RightClickElementModal: React.FC<RightClickElementModalProps> = ({
  isOpen,
  position,
  item,
  onClose,
  contextType,
  actions = [],
  allItems = [],
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
  const { selectedItems: contextSelectedItemIds } = useAppContext();
  
  // Convert selected item IDs to actual Item objects
  const selectedItems = allItems.filter(itm => contextSelectedItemIds.includes(itm._id));
  
  // Determine if we're in multiple selection mode
  const isMultipleSelection = selectedItems.length > 1;
  const targetItems = isMultipleSelection ? selectedItems : (item ? [item] : []);

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

  if (!isOpen || !position || (!item && !isMultipleSelection)) return null;

  // Define default actions based on context type and selection mode
  const getDefaultActions = (): MenuAction[] => {
    const defaultActions: MenuAction[] = [];
    
    if (targetItems.length === 0) return defaultActions;

    // Helper function to check if all items meet a condition
    const allItemsMatch = (condition: (item: Item) => boolean) => 
      targetItems.every(condition);

    // Helper function to get appropriate label
    const getLabel = (singular: string, plural: string) => 
      isMultipleSelection ? `${plural} (${targetItems.length})` : singular;

    // Helper function to create action handler
    const createHandler = (handler: ((item: Item | Item[]) => void) | undefined) => {
      if (!handler) return undefined;
      return () => handler(isMultipleSelection ? targetItems : targetItems[0]);
    };

    switch (contextType) {
      case 'password':
        if (allItemsMatch(item => item.type === ItemType.PASSWORD)) {
          // Password-specific actions
          if (onCopyUsername && allItemsMatch(item => !!item.encryptedMetadata.username)) {
            defaultActions.push({
              id: 'copy-username',
              label: getLabel('Copy Username', 'Copy All Usernames'),
              icon: <Copy className="h-4 w-4 mr-2" />,
              onClick: createHandler(onCopyUsername)!
            });
          }

          if (onCopyPassword && allItemsMatch(item => !!item.encryptedMetadata.password)) {
            defaultActions.push({
              id: 'copy-password',
              label: getLabel('Copy Password', 'Copy All Passwords'),
              icon: <Copy className="h-4 w-4 mr-2" />,
              onClick: createHandler(onCopyPassword)!
            });
          }

          if (onVisitWebsite && allItemsMatch(item => !!item.encryptedMetadata.url)) {
            defaultActions.push({
              id: 'visit-website',
              label: getLabel('Visit Website', 'Open All Websites'),
              icon: <ExternalLink className="h-4 w-4 mr-2" />,
              onClick: createHandler(onVisitWebsite)!
            });
          }

          if (onTogglePasswordVisibility) {
            defaultActions.push({
              id: 'toggle-visibility',
              label: getLabel('Toggle Visibility', 'Toggle All Visibility'),
              icon: <Eye className="h-4 w-4 mr-2" />,
              onClick: createHandler(onTogglePasswordVisibility)!
            });
          }

          // Add divider after password-specific actions
          if (defaultActions.length > 0) {
            defaultActions[defaultActions.length - 1].dividerAfter = true;
          }
        }
        break;

      case 'file':
        if (allItemsMatch(item => item.type !== ItemType.GROUP)) {
          if (onDownload) {
            defaultActions.push({
              id: 'download',
              label: getLabel('Download', 'Download All'),
              icon: <Download className="h-4 w-4 mr-2" />,
              onClick: createHandler(onDownload)!
            });
          }

          if (onViewDetails && !isMultipleSelection) {
            defaultActions.push({
              id: 'view-details',
              label: 'View Details',
              icon: <FileText className="h-4 w-4 mr-2" />,
              onClick: createHandler(onViewDetails)!
            });
          }
        }
        break;

      case 'folder':
        if (onViewDetails && !isMultipleSelection) {
          defaultActions.push({
            id: 'view-details',
            label: 'Properties',
            icon: <Folder className="h-4 w-4 mr-2" />,
            onClick: createHandler(onViewDetails)!
          });
        }
        break;
    }

    // Common actions for all types
    if (onShare) {
      defaultActions.push({
        id: 'share',
        label: getLabel('Share', 'Share All'),
        icon: <Share className="h-4 w-4 mr-2" />,
        onClick: createHandler(onShare)!
      });
    }

    if (onEdit || onRename) {
      const handler = onEdit || onRename;
      if (!isMultipleSelection && handler) {
        defaultActions.push({
          id: 'edit',
          label: contextType === 'password' ? 'Edit' : 'Rename',
          icon: <Edit className="h-4 w-4 mr-2" />,
          onClick: createHandler(handler)!
        });
      }
    }

    if (onDelete) {
      defaultActions.push({
        id: 'delete',
        label: getLabel('Delete', 'Delete All'),
        icon: <Trash className="h-4 w-4 mr-2" />,
        onClick: createHandler(onDelete)!,
        className: 'text-red-600 dark:text-red-400'
      });
    }

    return defaultActions;
  };

  // Merge default actions with custom actions
  const allActions = actions.length > 0 ? actions : getDefaultActions();

  // Filter actions based on conditions
  const visibleActions = allActions.filter(action => 
    !action.condition || action.condition(isMultipleSelection ? targetItems : (item || targetItems[0]))
  );

  const handleActionClick = (action: MenuAction, event: React.MouseEvent) => {
    event.stopPropagation();
    action.onClick(isMultipleSelection ? targetItems : (item || targetItems[0]));
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
