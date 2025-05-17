import React, { useState } from 'react';
import { LockIcon, Shield, Key, Server } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import logoImagen from '../../assets/images/logos/logo.png';

const AuthPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleForm = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsRegister(!isRegister);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="flex h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 text-white relative overflow-hidden">
        <div className="relative z-10 px-12 py-24 h-full flex flex-col">
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-200">
              Start Your Journey<br />with Us
            </h1>
            <p className="text-xl text-primary-200 mb-16">
              Secure your data with our advanced<br />
              protection features
            </p>

            {/* Security Features */}
            <div className="space-y-12">
              <div className="transform hover:translate-x-2 transition-transform duration-300">
                <div className="flex items-start group">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mr-6 group-hover:bg-white/20">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-3">End-to-End Encryption</h3>
                    <p className="text-primary-200 leading-relaxed">
                      Your data is encrypted before leaving your device and can only be decrypted by you. 
                      Not even we can access your files.
                    </p>
                  </div>
                </div>
              </div>

              <div className="transform hover:translate-x-2 transition-transform duration-300">
                <div className="flex items-start group">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mr-6 group-hover:bg-white/20 transition-colors duration-300">
                    <Key className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-3">Zero Knowledge</h3>
                    <p className="text-primary-200 leading-relaxed">
                      We never store or have access to your encryption keys or passwords. 
                      Your privacy is guaranteed by design.
                    </p>
                  </div>
                </div>
              </div>

              <div className="transform hover:translate-x-2 transition-transform duration-300">
                <div className="flex items-start group">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mr-6 group-hover:bg-white/20 transition-colors duration-300">
                    <Server className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-3">Zero Trust Architecture</h3>
                    <p className="text-primary-200 leading-relaxed">
                      Every request is verified and authenticated. No implicit trust, 
                      ensuring maximum security at all times.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-transparent to-primary-900/40" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-500 rounded-full transform translate-x-1/2 translate-y-1/2 opacity-20 blur-3xl" />
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-700 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-20 blur-3xl" />
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex bg-background items-center justify-center mb-2">
            <img src={logoImagen} alt="CloudMesa Logo" className="h-16 w-auto" />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white ">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2> 
            <p className="text-gray-600 mt-2">
              {isRegister 
                ? 'Start your journey with CloudVault'
                : 'Sign in to your account'}
            </p>
          </div>

          <div className="relative">
            <div 
              className={`transition-all duration-300 ${
                isAnimating ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {!isRegister && <LoginForm onToggleForm={toggleForm} />}
              {isRegister && <RegisterForm onToggleForm={toggleForm} />}
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            By using CloudMesa, you agree to our{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;