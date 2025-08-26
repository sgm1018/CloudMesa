import { useState, useRef, useCallback } from 'react';
import { Item } from '../types';
import { itemService } from '../services/ItemService';
import { DownloadProgress } from '../services/StreamingDownloadService';

export interface UseStreamingDownloadOptions {
    onComplete?: () => void;
    onError?: (error: Error) => void;
    autoRetry?: boolean;
    maxRetries?: number;
}

export interface UseStreamingDownloadReturn {
    // State
    isDownloading: boolean;
    downloadProgress: DownloadProgress | null;
    decryptionStage: string;
    error: string | null;
    capabilities: ReturnType<typeof itemService.getDownloadCapabilities>;
    
    // Actions
    downloadSimple: (item: Item, privateKey: string) => Promise<void>;
    downloadAdvanced: (item: Item, privateKey: string, customName?: string) => Promise<void>;
    cancelDownload: () => void;
    clearError: () => void;
    
    // Utils
    formatFileSize: (bytes: number) => string;
}

export const useStreamingDownload = (options: UseStreamingDownloadOptions = {}): UseStreamingDownloadReturn => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
    const [decryptionStage, setDecryptionStage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    
    const abortControllerRef = useRef<AbortController | null>(null);
    
    const { onComplete, onError, autoRetry = false, maxRetries = 3 } = options;

    // Obtener capacidades del navegador (solo una vez)
    const capabilities = itemService.getDownloadCapabilities();

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const resetState = useCallback(() => {
        setDownloadProgress(null);
        setDecryptionStage('');
        setError(null);
    }, []);

    const handleError = useCallback((err: Error, retryFn?: () => Promise<void>) => {
        const errorMessage = err.message;
        
        if (errorMessage.includes('cancelled')) {
            setError('Download was cancelled');
            return;
        }

        if (autoRetry && retryCount < maxRetries && retryFn) {
            setRetryCount(prev => prev + 1);
            setError(`Error occurred, retrying... (${retryCount + 1}/${maxRetries})`);
            
            // Retry after 2 seconds
            setTimeout(() => {
                retryFn();
            }, 2000);
            return;
        }

        setError(errorMessage);
        onError?.(err);
    }, [autoRetry, maxRetries, retryCount, onError]);

    const downloadSimple = useCallback(async (item: Item, privateKey: string) => {
        if (isDownloading) return;
        
        setIsDownloading(true);
        resetState();
        setRetryCount(0);

        const executeDownload = async () => {
            try {
                await itemService.downloadItem(item, privateKey, (progress) => {
                    setDownloadProgress(progress);
                });
                
                onComplete?.();
            } catch (err) {
                handleError(err as Error, executeDownload);
            } finally {
                setIsDownloading(false);
                resetState();
            }
        };

        await executeDownload();
    }, [isDownloading, resetState, onComplete, handleError]);

    const downloadAdvanced = useCallback(async (item: Item, privateKey: string, customName?: string) => {
        if (isDownloading) return;
        
        setIsDownloading(true);
        resetState();
        setRetryCount(0);

        // Crear AbortController para cancelación
        abortControllerRef.current = new AbortController();

        const executeDownload = async () => {
            try {
                await itemService.downloadItemAdvanced(item, privateKey, {
                    onProgress: (progress) => {
                        setDownloadProgress(progress);
                    },
                    onDecryptProgress: (stage) => {
                        setDecryptionStage(stage);
                    },
                    signal: abortControllerRef.current?.signal,
                    suggestedName: customName
                });
                
                onComplete?.();
            } catch (err) {
                handleError(err as Error, executeDownload);
            } finally {
                setIsDownloading(false);
                resetState();
                abortControllerRef.current = null;
            }
        };

        await executeDownload();
    }, [isDownloading, resetState, onComplete, handleError]);

    const cancelDownload = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setError('Download cancelled by user');
        }
    }, []);

    const formatFileSize = useCallback((bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    return {
        // State
        isDownloading,
        downloadProgress,
        decryptionStage,
        error,
        capabilities,
        
        // Actions
        downloadSimple,
        downloadAdvanced,
        cancelDownload,
        clearError,
        
        // Utils
        formatFileSize
    };
};
