import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { getItemById } from '../../data/mockData';

const Breadcrumb: React.FC = () => {
  const { currentView, currentFileFolder, currentPasswordFolder, setCurrentFolder } = useAppContext();
  
  // Build breadcrumb path
  const buildPath = () => {
    const currentFolder = currentView === 'files' ? currentFileFolder : currentPasswordFolder;
    if (!currentFolder) return [];
    
    const path = [];
    let folder = getItemById(currentFolder);
    
    if (!folder) return [];
    
    path.unshift({
      id: folder._id,
      name: folder.name,
    });
    
    while (folder && folder.parentId) {
      const parent = getItemById(folder.parentId);
      if (parent) {
        path.unshift({
          id: parent._id,
          name: parent.name,
        });
        folder = parent;
      } else {
        break;
      }
    }
    
    return path;
  };
  
  const breadcrumbs = buildPath();
  
  return (
    <div className="flex items-center text-sm">
      <button
        onClick={() => setCurrentFolder('')}
        className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
      >
        <Home className="h-4 w-4 text-gray-500" />
      </button>
      
      {breadcrumbs.length > 0 && (
        <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
      )}
      
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.id}>
          <button
            onClick={() => setCurrentFolder(crumb.id)}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
              index === breadcrumbs.length - 1
                ? 'font-medium text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            {crumb.name}
          </button>
          {index < breadcrumbs.length - 1 && (
            <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb;