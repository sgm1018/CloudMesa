import React from 'react';
import { Item } from '../../types';
import { X, Download, Copy, Search } from 'lucide-react';
import { itemService } from '../../services/ItemService';
import { useEncryption } from '../../context/EncryptionContext';
import { useToast } from '../../context/ToastContext';

interface TextViewerProps {
    item: Item;
    isOpen: boolean;
    onClose: () => void;
}

const TextViewer: React.FC<TextViewerProps> = ({ item, isOpen, onClose }) => {
    const { privateKey } = useEncryption();
    const { showToast } = useToast();
    const [content, setContent] = React.useState<string>('');
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string>('');
    const [searchTerm, setSearchTerm] = React.useState<string>('');
    const [lineWrap, setLineWrap] = React.useState<boolean>(true);

    React.useEffect(() => {
        if (isOpen && item && privateKey) {
            loadContent();
        }
    }, [isOpen, item, privateKey]);

    const loadContent = async () => {
        try {
            setIsLoading(true);
            setError('');
            
            if (!privateKey) {
                throw new Error('Private key not available');
            }
            
            // Download and decrypt the text file
            const blob = await itemService.getItemAsBlob(item, privateKey);
            const text = await blob.text();
            setContent(text);
        } catch (error) {
            console.error('Error loading text file:', error);
            setError('Failed to load text file');
            showToast('Failed to load text file', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            if (!privateKey) {
                showToast('Private key not available', 'error');
                return;
            }
            await itemService.downloadItem(item, privateKey);
            showToast('Download started', 'success');
        } catch (error) {
            showToast('Download failed', 'error');
        }
    };

    const handleCopyContent = () => {
        navigator.clipboard.writeText(content);
        showToast('Content copied to clipboard', 'success');
    };

    const getLanguage = (extension: string) => {
        const languageMap: Record<string, string> = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'cs': 'csharp',
            'php': 'php',
            'rb': 'ruby',
            'go': 'go',
            'rs': 'rust',
            'swift': 'swift',
            'kt': 'kotlin',
            'dart': 'dart',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'xml': 'xml',
            'yaml': 'yaml',
            'yml': 'yaml',
            'sql': 'sql',
            'sh': 'bash',
            'bash': 'bash',
            'bat': 'batch',
            'ps1': 'powershell',
            'md': 'markdown',
        };
        return languageMap[extension.toLowerCase()] || 'text';
    };

    const highlightSearchTerm = (text: string, searchTerm: string) => {
        if (!searchTerm) return text;
        
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600">$1</mark>');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isOpen) return;
        
        if (e.key === 'Escape') {
            onClose();
        } else if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'f':
                    e.preventDefault();
                    // Focus search input
                    const searchInput = document.getElementById('text-viewer-search');
                    searchInput?.focus();
                    break;
                case 'c':
                    if (window.getSelection()?.toString()) {
                        // Let default copy behavior handle selected text
                        return;
                    }
                    e.preventDefault();
                    handleCopyContent();
                    break;
            }
        }
    };

    React.useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, content]);

    if (!isOpen) return null;

    const extension = item.encryptedMetadata?.extension || '';
    const language = getLanguage(extension);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
            {/* Header */}
            <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-medium truncate">{item.itemName}</h2>
                    <span className="text-sm text-gray-300">({language})</span>
                </div>
                
                <div className="flex items-center space-x-2">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            id="text-viewer-search"
                            type="text"
                            placeholder="Search in file..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-gray-700 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    {/* Line wrap toggle */}
                    <button
                        onClick={() => setLineWrap(!lineWrap)}
                        className={`px-3 py-2 text-sm rounded ${
                            lineWrap 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                        title="Toggle line wrap"
                    >
                        Wrap
                    </button>
                    
                    <button
                        onClick={handleCopyContent}
                        className="p-2 hover:bg-gray-700 rounded"
                        title="Copy content (Ctrl+C)"
                    >
                        <Copy className="h-5 w-5" />
                    </button>
                    
                    <button
                        onClick={handleDownload}
                        className="p-2 hover:bg-gray-700 rounded"
                        title="Download"
                    >
                        <Download className="h-5 w-5" />
                    </button>
                    
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-700 rounded"
                        title="Close (Esc)"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-white">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
                            <p>Loading file...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-full text-white">
                        <div className="text-center">
                            <p className="text-red-400 mb-4">{error}</p>
                            <button
                                onClick={loadContent}
                                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full overflow-auto bg-gray-900">
                        <pre 
                            className={`p-4 text-sm text-gray-100 font-mono h-full ${
                                lineWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'
                            }`}
                            dangerouslySetInnerHTML={{
                                __html: highlightSearchTerm(content, searchTerm)
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export { TextViewer };
