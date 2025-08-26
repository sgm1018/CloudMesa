import React, { useState, useRef } from 'react';
import { Item } from '../../types';
import { itemService } from '../../services/ItemService';
import { DownloadProgress } from '../../services/StreamingDownloadService';

interface StreamingDownloadComponentProps {
    item: Item;
    privateKey: string;
    onDownloadComplete?: () => void;
    onError?: (error: Error) => void;
}

export const StreamingDownloadComponent: React.FC<StreamingDownloadComponentProps> = ({
    item,
    privateKey,
    onDownloadComplete,
    onError
}) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
    const [decryptionStage, setDecryptionStage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Obtener capacidades del navegador
    const capabilities = itemService.getDownloadCapabilities();

    const handleSimpleDownload = async () => {
        setIsDownloading(true);
        setError(null);
        setDownloadProgress(null);

        try {
            await itemService.downloadItem(item, privateKey, (progress) => {
                setDownloadProgress(progress);
            });
            
            onDownloadComplete?.();
        } catch (err) {
            const error = err as Error;
            setError(error.message);
            onError?.(error);
        } finally {
            setIsDownloading(false);
            setDownloadProgress(null);
        }
    };

    const handleAdvancedDownload = async () => {
        setIsDownloading(true);
        setError(null);
        setDownloadProgress(null);
        setDecryptionStage('');

        // Crear AbortController para cancelación
        abortControllerRef.current = new AbortController();

        try {
            await itemService.downloadItemAdvanced(item, privateKey, {
                onProgress: (progress) => {
                    setDownloadProgress(progress);
                },
                onDecryptProgress: (stage) => {
                    setDecryptionStage(stage);
                },
                signal: abortControllerRef.current.signal
            });
            
            onDownloadComplete?.();
        } catch (err) {
            const error = err as Error;
            if (error.message.includes('cancelled')) {
                setError('Download was cancelled');
            } else {
                setError(error.message);
                onError?.(error);
            }
        } finally {
            setIsDownloading(false);
            setDownloadProgress(null);
            setDecryptionStage('');
            abortControllerRef.current = null;
        }
    };

    const handleCancelDownload = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="streaming-download-component p-4 border rounded-lg bg-white shadow-sm">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                    Download File: {item.encryptedMetadata?.name || 'Unknown'}
                </h3>
                {item.size && (
                    <p className="text-sm text-gray-600">
                        Size: {formatFileSize(item.size)}
                    </p>
                )}
            </div>

            {/* Browser Capabilities */}
            <div className="mb-4 p-3 bg-gray-50 rounded">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Browser Capabilities:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center ${capabilities.supportsStreaming ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="mr-1">{capabilities.supportsStreaming ? '✅' : '❌'}</span>
                        Streaming Support
                    </div>
                    <div className={`flex items-center ${capabilities.supportsRangeRequests ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="mr-1">{capabilities.supportsRangeRequests ? '✅' : '❌'}</span>
                        Range Requests
                    </div>
                    <div className={`flex items-center ${capabilities.supportsCancellation ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="mr-1">{capabilities.supportsCancellation ? '✅' : '❌'}</span>
                        Cancellation
                    </div>
                </div>
            </div>

            {/* Download Progress */}
            {isDownloading && downloadProgress && (
                <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Download Progress</span>
                        <span>{downloadProgress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${downloadProgress.percentage}%` }}
                        />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {formatFileSize(downloadProgress.loaded)} / {formatFileSize(downloadProgress.total)}
                    </div>
                </div>
            )}

            {/* Decryption Stage */}
            {isDownloading && decryptionStage && (
                <div className="mb-4 p-2 bg-blue-50 rounded border border-blue-200">
                    <div className="text-sm text-blue-800">
                        <span className="inline-block animate-spin mr-2">⏳</span>
                        {decryptionStage}
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-800 text-sm">{error}</p>
                </div>
            )}

            {/* Download Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={handleSimpleDownload}
                    disabled={isDownloading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isDownloading ? 'Downloading...' : 'Simple Download'}
                </button>

                <button
                    onClick={handleAdvancedDownload}
                    disabled={isDownloading}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isDownloading ? 'Downloading...' : 'Advanced Download'}
                </button>

                {isDownloading && capabilities.supportsCancellation && (
                    <button
                        onClick={handleCancelDownload}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* Info */}
            <div className="mt-4 text-xs text-gray-500">
                <p><strong>Simple Download:</strong> Basic streaming download with progress tracking</p>
                <p><strong>Advanced Download:</strong> Enhanced download with cancellation support and detailed progress stages</p>
            </div>
        </div>
    );
};
