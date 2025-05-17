import React, { useState } from 'react';
import { Shield, QrCode, Copy, Check, Download, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface TwoFactorSetupProps {
  isOpen: boolean;
  onClose: () => void;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentPassword, setCurrentPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [secretKey] = useState('JBSWY3DPEHPK3PXP'); // In a real app, this would be generated server-side
  const [recoveryCodes] = useState([
    'a1b2c3d4e5f6',
    'g7h8i9j0k1l2',
    'm3n4o5p6q7r8',
    's9t0u1v2w3x4',
    'y5z6a7b8c9d0'
  ]);
  const [copied, setCopied] = useState(false);

  const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=otpauth://totp/CloudMesa:user@example.com?secret=${secretKey}&issuer=CloudMesa`;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Please enter your current password', 'error');
      return;
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentStep(2);
    } catch (error) {
      showToast('Invalid password', 'error');
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      showToast('Please enter the verification code', 'error');
      return;
    }

    setIsVerifying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, verify the code matches the expected TOTP value
      if (verificationCode === '123456') {
        setCurrentStep(3);
      } else {
        showToast('Invalid verification code', 'error');
      }
    } catch (error) {
      showToast('Failed to verify code', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyRecoveryCodes = async () => {
    try {
      await navigator.clipboard.writeText(recoveryCodes.join('\n'));
      setCopied(true);
      showToast('Recovery codes copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showToast('Failed to copy recovery codes', 'error');
    }
  };

  const downloadRecoveryCodes = () => {
    const element = document.createElement('a');
    const file = new Blob([recoveryCodes.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'cloudmesa-recovery-codes.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('Recovery codes downloaded');
  };

  const handleComplete = () => {
    showToast('Two-factor authentication enabled successfully');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-lg transform">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <h2 className="text-xl font-semibold ml-2">Set Up Two-Factor Authentication</h2>
            </div>
          </div>

          <div className="p-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-20 h-1 ${
                      currentStep > step
                        ? 'bg-primary-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Step 1: Password Verification */}
            {currentStep === 1 && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  For your security, please verify your current password before proceeding.
                </p>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="current-password">
                    Current Password
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input"
                    placeholder="Enter your current password"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={onClose} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Continue
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: QR Code & Verification */}
            {currentStep === 2 && (
              <form onSubmit={handleVerification} className="space-y-6">
                <div className="text-center">
                  <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg inline-block">
                    <img src={qrCodeUrl} alt="2FA QR Code" className="mx-auto" width="200" height="200" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-primary-50 dark:bg-primary-900 text-primary-800 dark:text-primary-200 p-4 rounded-lg flex items-start">
                    <AlertCircle className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">Important:</p>
                      <p>If you lose access to your authenticator app, you'll need recovery codes to regain access to your account. We'll provide these in the next step.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Secret Key</label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 font-mono text-sm bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded">
                        {secretKey}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(secretKey);
                          showToast('Secret key copied to clipboard');
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Verification Code</label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="input font-mono text-lg tracking-wide"
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={onClose} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isVerifying}>
                    {isVerifying ? 'Verifying...' : 'Verify Code'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Recovery Codes */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-warning-50 dark:bg-warning-900/50 text-warning-800 dark:text-warning-200 p-4 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Save these recovery codes!</p>
                    <p>Keep these codes in a safe place. If you lose your authenticator device, you can use these codes to regain access to your account.</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm mb-4">
                    {recoveryCodes.map((code) => (
                      <div key={code} className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                        {code}
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={copyRecoveryCodes}
                      className="btn btn-secondary flex-1"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span>{copied ? 'Copied!' : 'Copy Codes'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={downloadRecoveryCodes}
                      className="btn btn-secondary flex-1"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={onClose} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleComplete}
                    className="btn btn-primary"
                  >
                    Complete Setup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorSetup;