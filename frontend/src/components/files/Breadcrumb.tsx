import React, { useEffect, useState, useRef } from 'react';
import { ChevronRight, Home, MoreHorizontal } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Breadcrumb: React.FC = () => {
  const { 
    currentView, 
    currentFileFolder, 
    currentPasswordFolder, 
    navigateToFolder,
    breadcrumbPath,
    loadBreadcrumbPath
  } = useAppContext();

  const [showFullPath, setShowFullPath] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  const currentFolder = currentView === 'files' ? currentFileFolder : currentPasswordFolder;
  const MAX_VISIBLE_CRUMBS = 4;

  // Load breadcrumb path when current folder changes
  useEffect(() => {
    loadBreadcrumbPath(currentFolder);
  }, [currentFolder, loadBreadcrumbPath]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showFullPath && 
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(event.target as Node)
      ) {
        setShowFullPath(false);
        setMenuPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFullPath]);

  const handleNavigateToFolder = (folderId: string | null) => {
    navigateToFolder(folderId);
    setShowFullPath(false);
    setMenuPosition(null);
  };

  const handleMoreClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (showFullPath) {
      setShowFullPath(false);
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
    setShowFullPath(true);
  };

  // Determine which breadcrumbs to show
  const shouldShowMore = breadcrumbPath.length > MAX_VISIBLE_CRUMBS;
  const visibleCrumbs = shouldShowMore 
    ? breadcrumbPath.slice(-MAX_VISIBLE_CRUMBS) 
    : breadcrumbPath;

  return (
    <>
      <div className="flex items-center text-sm">
        <button
          onClick={() => handleNavigateToFolder(null)}
          className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          title="Ir a la raíz"
        >
          <Home className="h-4 w-4 text-gray-500" />
        </button>
        
        {breadcrumbPath.length > 0 && (
          <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
        )}

        {/* Show more button if there are hidden crumbs */}
        {shouldShowMore && (
          <>
            <button
              ref={moreButtonRef}
              onClick={handleMoreClick}
              className="flex items-center p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
              title="Mostrar ruta completa"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
          </>
        )}
        
        {/* Show visible breadcrumbs */}
        {visibleCrumbs.map((crumb, index) => (
          <React.Fragment key={crumb._id}>
            <button
              onClick={() => handleNavigateToFolder(crumb._id)}
              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
                index === visibleCrumbs.length - 1
                  ? 'font-medium text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
              title={`Ir a ${crumb.name}`}
            >
              {crumb.name}
            </button>
            {index < visibleCrumbs.length - 1 && (
              <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Full path modal */}
      {showFullPath && menuPosition && (
        <div 
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            zIndex: 1000,
          }}
          className="bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-[200px] max-w-[400px]"
        >
          <div className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 mb-1">
            Ruta completa
          </div>
          
          {/* Home button in modal */}
          <button
            onClick={() => handleNavigateToFolder(null)}
            className="w-full flex items-center px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            <Home className="h-4 w-4 mr-2" />
            <span>Inicio</span>
          </button>
          
          {/* All breadcrumbs in modal */}
          {breadcrumbPath.map((crumb, index) => (
            <button
              key={crumb._id}
              onClick={() => handleNavigateToFolder(crumb._id)}
              className={`w-full flex items-center px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                index === breadcrumbPath.length - 1
                  ? 'font-medium text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
              style={{ paddingLeft: `${12 + (index + 1) * 8}px` }}
            >
              <span className="truncate">{crumb.name}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default Breadcrumb;