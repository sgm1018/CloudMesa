import React from 'react';
import { Item } from '../../types';
import { useStreamingDownload } from '../../hooks/useStreamingDownload';

interface SimpleDownloadButtonProps {
    item: Item;
    privateKey: string;
    className?: string;
    onSuccess?: () => void;
    children?: React.ReactNode;
}

export const SimpleDownloadButton: React.FC<SimpleDownloadButtonProps> = ({
    item,
    privateKey,
    className = '',
    onSuccess,
    children
}) => {
    const {
        isDownloading,
        downloadProgress,
        decryptionStage,
        error,
        downloadAdvanced,
        cancelDownload,
        clearError,
        formatFileSize,
        capabilities
    } = useStreamingDownload({
        onComplete: onSuccess,
        onError: (error) => console.error('Download failed:', error),
        autoRetry: true,
        maxRetries: 2
    });

    const handleDownload = () => {
        if (error) clearError();
        downloadAdvanced(item, privateKey);
    };

    const defaultClassName = `
        relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isDownloading 
            ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
        }
    `.trim();

    return (
        <div className="space-y-2">
            <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={`${defaultClassName} ${className}`}
                title={capabilities.supportsStreaming ? 'Streaming download supported' : 'Basic download'}
            >
                {/* Icon */}
                <svg 
                    className={`w-4 h-4 mr-2 ${isDownloading ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    {isDownloading ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    )}
                </svg>

                {/* Text */}
                {children || (isDownloading ? 'Downloading...' : 'Download')}

                {/* Cancel button */}
                {isDownloading && capabilities.supportsCancellation && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            cancelDownload();
                        }}
                        className="ml-2 text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
                        title="Cancel download"
                    >
                        ✕
                    </button>
                )}
            </button>

            {/* Progress Bar */}
            {isDownloading && downloadProgress && (
                <div className="w-full">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{decryptionStage || 'Downloading...'}</span>
                        <span>{downloadProgress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                            style={{ width: `${downloadProgress.percentage}%` }}
                        />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {formatFileSize(downloadProgress.loaded)} / {formatFileSize(downloadProgress.total)}
                    </div>
                </div>
            )}

            {/* Status Messages */}
            {isDownloading && decryptionStage && !downloadProgress && (
                <div className="text-xs text-blue-600 flex items-center">
                    <span className="inline-block animate-spin mr-1">⚡</span>
                    {decryptionStage}
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                    {error}
                </div>
            )}
        </div>
    );
};
