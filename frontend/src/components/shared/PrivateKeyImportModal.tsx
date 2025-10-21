import React, { useState, useRef } from 'react';
import { X, Upload, Shield, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { useEncryption } from '../../context/EncryptionContext';
import { useToast } from '../../context/ToastContext';
import { encryptService } from '../../services/EncryptService';

interface PrivateKeyImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PrivateKeyImportModal: React.FC<PrivateKeyImportModalProps> = ({ isOpen, onClose }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [privateKeyContent, setPrivateKeyContent] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const { setPrivateKey } = useEncryption();
    const { showToast } = useToast();

    if (!isOpen) return null;

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        setError('');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setPrivateKeyContent(content);
        };
        reader.readAsText(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const files = Array.from(e.dataTransfer.files);
        const file = files[0];
        
        if (file && (file.name.endsWith('.pem') || file.type === 'text/plain')) {
            handleFileSelect(file);
        } else {
            setError('Please select a valid PEM file (.pem)');
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleImport = async () => {
        if (!privateKeyContent.trim()) {
            setError('Please select a private key file');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            // Validate that it's a proper PEM file
            if (!privateKeyContent.includes('-----BEGIN') || !privateKeyContent.includes('-----END')) {
                throw new Error('Invalid PEM format. Please ensure the file contains a valid private key.');
            }

            // Convert PEM to base64
            const base64PrivateKey = encryptService.pemToBase64(privateKeyContent);
            
            if (!base64PrivateKey) {
                throw new Error('Failed to extract private key from PEM file');
            }

            // Set the private key in context
            setPrivateKey(base64PrivateKey);
            
            showToast('Private key imported successfully!', 'success');
            onClose();
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to import private key';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setPrivateKeyContent('');
        setError('');
        setIsProcessing(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Import Private Key
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                Upload your private key to decrypt your files
                            </p>
                        </div>
                    </div>
                    {/* <button
                        onClick={handleClose}
                        className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
                        title="Close"
                    >
                        <X className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
                    </button> */}
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="p-6 space-y-6">
                        {/* Warning Alert */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                            <div className="flex items-start space-x-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                    <p className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                                        Security Notice
                                    </p>
                                    <p className="text-amber-700 dark:text-amber-300">
                                        Only upload your private key on trusted devices. The key will be stored securely in your browser session.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* File Upload Area */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center text-lg">
                                <Upload className="w-5 h-5 text-blue-500 mr-2" />
                                Upload Private Key
                            </h3>
                            
                            <div
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                                    isDragOver
                                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                } ${selectedFile ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600' : ''}`}
                                onDrop={handleDrop}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragOver(true);
                                }}
                                onDragLeave={() => setIsDragOver(false)}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pem,text/plain"
                                    onChange={handleFileInput}
                                    className="hidden"
                                />
                                
                                {selectedFile ? (
                                    <div className="space-y-3">
                                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                                        <div>
                                            <p className="font-medium text-green-800 dark:text-green-200">
                                                File Selected
                                            </p>
                                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                                {selectedFile.name}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            Choose different file
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                Drop your private key here
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                or click to browse for .pem files
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg transition-all duration-200 font-medium text-sm"
                                        >
                                            <Upload className="h-4 w-4" />
                                            Choose File
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                                <div className="flex items-start space-x-3">
                                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm">
                                        <p className="font-semibold text-red-800 dark:text-red-200 mb-1">
                                            Error
                                        </p>
                                        <p className="text-red-700 dark:text-red-300">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Tips */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-4 text-lg flex items-center">
                                <Shield className="w-5 h-5 mr-2" />
                                Security Tips
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-start space-x-3">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        Make sure you're uploading the correct private key file
                                    </p>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        The key will only be stored in your browser session
                                    </p>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        Never share your private key with anyone
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={handleClose}
                            className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 font-medium"
                            disabled={isProcessing}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={!selectedFile || isProcessing}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Import Private Key
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivateKeyImportModal;
