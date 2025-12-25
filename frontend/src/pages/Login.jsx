import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, ChevronDown, ChevronUp, Shield, AlertCircle } from 'lucide-react';
import Loading from '../components/common/Loading';

// Bluesky butterfly logo SVG
const BlueskyLogo = () => (
  <svg viewBox="0 0 600 530" className="w-16 h-16" fill="currentColor">
    <path d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z" />
  </svg>
);

// Hosting providers list
const HOSTING_PROVIDERS = [
  { id: 'bsky', label: 'Bluesky (default)', service: 'https://bsky.social' },
  { id: 'custom', label: 'Custom', service: '' },
];

function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('bsky');
  const [customService, setCustomService] = useState('');

  // 2FA state
  const [needs2FA, setNeeds2FA] = useState(false);
  const [authFactorToken, setAuthFactorToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const { login } = useAuth();

  // Reset 2FA state when identifier changes
  useEffect(() => {
    setNeeds2FA(false);
    setAuthFactorToken('');
    setTwoFactorCode('');
  }, [identifier]);

  const getServiceUrl = () => {
    if (selectedProvider === 'custom') {
      return customService.trim() || 'https://bsky.social';
    }
    return HOSTING_PROVIDERS.find(p => p.id === selectedProvider)?.service || 'https://bsky.social';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const serviceUrl = getServiceUrl();
      const result = await login(identifier, password, {
        service: serviceUrl,
        authFactorToken: needs2FA ? authFactorToken : undefined,
        twoFactorCode: needs2FA ? twoFactorCode : undefined,
      });

      if (!result.success) {
        // Check if 2FA is required
        if (result.requires2FA || result.authFactorToken) {
          setNeeds2FA(true);
          setAuthFactorToken(result.authFactorToken || '');
          setError('Please enter the verification code sent to your email.');
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }

    setIsLoading(false);
  };

  const handleCancel2FA = () => {
    setNeeds2FA(false);
    setAuthFactorToken('');
    setTwoFactorCode('');
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f14] p-4">
      <div className="w-full max-w-sm">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center text-[#1185fe] mb-6">
            <BlueskyLogo />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Sign in to SkyDeck
          </h1>
          <p className="text-[#7b8994] text-sm">
            Enter your Bluesky credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 2FA View */}
          {needs2FA ? (
            <>
              <div className="bg-[#1a2633] rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#1185fe] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-medium mb-1">
                      Two-factor authentication
                    </p>
                    <p className="text-[#7b8994] text-xs">
                      A verification code has been sent to your email address. Enter it below to continue.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="twoFactorCode"
                  className="block text-sm font-medium text-[#aebbc9] mb-2"
                >
                  Verification Code
                </label>
                <input
                  id="twoFactorCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 bg-[#1a2633] border border-[#2a3f50] rounded-lg text-white placeholder-[#5c6e7e] focus:outline-none focus:border-[#1185fe] focus:ring-1 focus:ring-[#1185fe] transition-colors text-center text-lg tracking-widest"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel2FA}
                  className="flex-1 py-3 px-4 rounded-full font-semibold text-white bg-[#2a3f50] hover:bg-[#3a4f60] transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-full font-semibold text-white bg-[#1185fe] hover:bg-[#0070e0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={isLoading || twoFactorCode.length < 6}
                >
                  {isLoading ? <Loading size="sm" /> : 'Verify'}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Username/Email Input */}
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-sm font-medium text-[#aebbc9] mb-2"
                >
                  Username or email address
                </label>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your username or email"
                  className="w-full px-4 py-3 bg-[#1a2633] border border-[#2a3f50] rounded-lg text-white placeholder-[#5c6e7e] focus:outline-none focus:border-[#1185fe] focus:ring-1 focus:ring-[#1185fe] transition-colors"
                  required
                  autoComplete="username"
                  autoFocus
                />
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#aebbc9] mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your app password"
                    className="w-full px-4 py-3 pr-12 bg-[#1a2633] border border-[#2a3f50] rounded-lg text-white placeholder-[#5c6e7e] focus:outline-none focus:border-[#1185fe] focus:ring-1 focus:ring-[#1185fe] transition-colors"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#5c6e7e] hover:text-[#aebbc9] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-[#5c6e7e] mt-2">
                  Use an{' '}
                  <a
                    href="https://bsky.app/settings/app-passwords"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1185fe] hover:underline"
                  >
                    App Password
                  </a>
                  {' '}for security.
                </p>
              </div>

              {/* Advanced Options Toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-[#7b8994] hover:text-[#aebbc9] transition-colors"
              >
                {showAdvanced ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                Advanced options
              </button>

              {/* Advanced Options Panel */}
              {showAdvanced && (
                <div className="p-4 bg-[#0f1820] rounded-lg border border-[#2a3f50] space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#aebbc9] mb-2">
                      Hosting provider
                    </label>
                    <div className="space-y-2">
                      {HOSTING_PROVIDERS.map((provider) => (
                        <label
                          key={provider.id}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="provider"
                            value={provider.id}
                            checked={selectedProvider === provider.id}
                            onChange={(e) => setSelectedProvider(e.target.value)}
                            className="w-4 h-4 text-[#1185fe] bg-[#1a2633] border-[#2a3f50] focus:ring-[#1185fe] focus:ring-offset-0"
                          />
                          <span className="text-sm text-white">{provider.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {selectedProvider === 'custom' && (
                    <div>
                      <label
                        htmlFor="customService"
                        className="block text-sm font-medium text-[#aebbc9] mb-2"
                      >
                        PDS URL
                      </label>
                      <input
                        id="customService"
                        type="url"
                        value={customService}
                        onChange={(e) => setCustomService(e.target.value)}
                        placeholder="https://your-pds.example.com"
                        className="w-full px-4 py-3 bg-[#1a2633] border border-[#2a3f50] rounded-lg text-white placeholder-[#5c6e7e] focus:outline-none focus:border-[#1185fe] focus:ring-1 focus:ring-[#1185fe] transition-colors text-sm"
                      />
                      <p className="text-xs text-[#5c6e7e] mt-2">
                        Enter your Personal Data Server URL if you're self-hosting.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-full font-semibold text-white bg-[#1185fe] hover:bg-[#0070e0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
                disabled={isLoading || !identifier || !password}
              >
                {isLoading ? <Loading size="sm" /> : 'Sign In'}
              </button>
            </>
          )}
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-[#5c6e7e] text-sm">
            Don't have an account?{' '}
            <a
              href="https://bsky.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1185fe] hover:underline font-medium"
            >
              Create one at bsky.app
            </a>
          </p>
          <p className="text-[#5c6e7e] text-xs">
            <a
              href="https://blueskyweb.xyz/support/account"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#7b8994] hover:underline"
            >
              Forgot password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
