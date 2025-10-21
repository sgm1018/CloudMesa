import React from 'react';
import { Item } from '../../types';
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { itemService } from '../../services/ItemService';
import { useEncryption } from '../../context/EncryptionContext';
import { useToast } from '../../context/ToastContext';

interface ImageViewerProps {
    item: Item;
    isOpen: boolean;
    onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ item, isOpen, onClose }) => {
    const { privateKey } = useEncryption();
    const { showToast } = useToast();
    const [imageUrl, setImageUrl] = React.useState<string>('');
    const [isLoading, setIsLoading] = React.useState(true);
    const [zoom, setZoom] = React.useState(100);
    const [rotation, setRotation] = React.useState(0);
    const [error, setError] = React.useState<string>('');

    React.useEffect(() => {
        if (isOpen && item && privateKey) {
            loadImage();
        }
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [isOpen, item, privateKey]);

    const loadImage = async () => {
        try {
            setIsLoading(true);
            setError('');
            
            if (!privateKey) {
                throw new Error('Private key not available');
            }
            
            const blob = await itemService.getItemAsBlob(item, privateKey);
            const url = URL.createObjectURL(blob);
            setImageUrl(url);
        } catch (error) {
            console.error('Error loading image:', error);
            setError('Failed to load image');
            showToast('Failed to load image', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 25, 500));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 25, 25));
    };

    const handleRotate = () => {
        setRotation(prev => (prev + 90) % 360);
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

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isOpen) return;
        
        switch (e.key) {
            case 'Escape':
                onClose();
                break;
            case '=':
            case '+':
                e.preventDefault();
                handleZoomIn();
                break;
            case '-':
                e.preventDefault();
                handleZoomOut();
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                handleRotate();
                break;
        }
    };

    React.useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4 z-10">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium truncate">{item.itemName}</h2>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleZoomOut}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                            title="Zoom Out (-)"
                        >
                            <ZoomOut className="h-5 w-5" />
                        </button>
                        <span className="text-sm px-2">{zoom}%</span>
                        <button
                            onClick={handleZoomIn}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                            title="Zoom In (+)"
                        >
                            <ZoomIn className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleRotate}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                            title="Rotate (R)"
                        >
                            <RotateCw className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleDownload}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                            title="Download"
                        >
                            <Download className="h-5 w-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                            title="Close (Esc)"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center p-4 pt-20">
                {isLoading ? (
                    <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
                        <p>Loading image...</p>
                    </div>
                ) : error ? (
                    <div className="text-white text-center">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            onClick={loadImage}
                            className="px-4 py-2 bg-white bg-opacity-20 rounded hover:bg-opacity-30"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <img
                        src={imageUrl}
                        alt={item.itemName}
                        className="max-w-full max-h-full object-contain transition-transform duration-200"
                        style={{
                            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        }}
                        onError={() => setError('Failed to display image')}
                    />
                )}
            </div>

            {/* Click outside to close */}
            <div
                className="absolute inset-0 -z-10"
                onClick={onClose}
            />
        </div>
    );
};

export { ImageViewer };
