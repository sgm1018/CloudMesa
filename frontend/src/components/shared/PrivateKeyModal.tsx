import React, { useState } from 'react';
import { X, Download, Shield, AlertTriangle, CheckCircle, Copy, RefreshCw } from 'lucide-react';
import { encryptService } from '../../services/EncryptService';
import { useEncryption } from '../../context/EncryptionContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

interface PrivateKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    privateKey?: string; // Optional prop to pass the private
}

const PrivateKeyModal: React.FC<PrivateKeyModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const [hasDownloaded, setHasDownloaded] = useState(false);
    const { showToast } = useToast();
    const { privateKey } = useEncryption();
    const { setShowPrivateKey } = useAuth();
    
    const downloadPrivateKey = (privateKey: string) => {
        const pem = encryptService.base64ToPem(privateKey, "PRIVATE KEY");
        const privateKeyBlob = new Blob([pem], { type: "text/plain" });
        const privateKeyUrl = URL.createObjectURL(privateKeyBlob);
        const link = document.createElement("a");
        link.href = privateKeyUrl;
        link.download = "privateKey.pem";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setHasDownloaded(true);
        showToast('Private key downloaded successfully');
    };

    // Auto-download on first render if privateKey exists
    React.useEffect(() => {
        if (privateKey && !hasDownloaded) {
            downloadPrivateKey(privateKey);
        }
    }, [privateKey, hasDownloaded]);

    const handleDownloadAgain = () => {
        if (privateKey) {
            downloadPrivateKey(privateKey);
        }
    };

    const handleContinue = () => {
        setShowPrivateKey(false);
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
                                Private Key Downloaded
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                Your encryption key has been secured
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
                        title="Close"
                    >
                        <X className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="p-6 space-y-6">
                        {/* Success Alert */}
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                            <div className="flex items-start space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                    <p className="font-semibold text-green-800 dark:text-green-200 mb-1">
                                        Success!
                                    </p>
                                    <p className="text-green-700 dark:text-green-300">
                                        Your private key has been automatically downloaded and is ready to use.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Warning Alert */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                            <div className="flex items-start space-x-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                    <p className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                                        Important Security Notice
                                    </p>
                                    <p className="text-amber-700 dark:text-amber-300">
                                        <strong>Store this key in a safe place.</strong> You'll need it to decrypt your files. 
                                        If you lose this key, your encrypted data will be permanently inaccessible.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Download Info */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center text-lg">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                Downloaded File
                            </h3>
                            
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <Download className="w-6 h-6 text-blue-500" />
                                        <div>
                                            <span className="font-medium text-gray-900 dark:text-gray-100 text-lg">
                                                privateKey.pem
                                            </span>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                Check your downloads folder to find the file
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleDownloadAgain}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl transition-all duration-200 font-medium text-sm group"
                                        title="Download again"
                                    >
                                        <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                                        Download Again
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Security Tips */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-4 text-lg flex items-center">
                                <Shield className="w-5 h-5 mr-2" />
                                Security Best Practices
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-start space-x-3">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        <strong>Create multiple backups</strong> and store them in different secure locations
                                    </p>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        <strong>Never share your private key</strong> with anyone - CloudMesa will never ask for it
                                    </p>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        <strong>Store securely</strong> - Consider using a password manager or encrypted storage
                                    </p>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        <strong>Remember:</strong> If you lose this key, your encrypted files cannot be recovered
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
                            onClick={handleContinue}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                        >
                            I understand, continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivateKeyModal;