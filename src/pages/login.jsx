import React, { useState } from "react";
import { auth, provider, db } from "../firebase";
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function Login({ setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [activeTab, setActiveTab] = useState('google');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userData = {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      // Navigate to the intended page after successful login
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      setError('Google login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        createdAt: new Date(),
      });

      const userData = {
        displayName: formData.name,
        email: formData.email,
        mobile: formData.mobile,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      // Switch to login tab after successful registration
      setActiveTab('login');
      setSuccess('Registration successful! Please log in with your credentials.');
      setFormData({ name: '', email: '', mobile: '', password: '' });
      setError('');
    } catch (error) {
      console.error("Registration error:", error);
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const fullUserData = {
          displayName: userData.name,
          email: userData.email,
          mobile: userData.mobile,
        };

        localStorage.setItem("user", JSON.stringify(fullUserData));
        setUser(fullUserData);
      } else {
        setError('User data not found.');
        setLoading(false);
        return;
      }

      // Navigate to the intended page after successful login
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else {
        setError('Login failed. Please try again.');
      }
      setLoading(false);
    }
  };

  // Tab buttons
  const tabs = [
    { id: 'google', label: 'Google Login' },
    { id: 'login', label: 'Login' },
    { id: 'register', label: 'Register' },
    { id: 'developer', label: 'Developer' }
  ];

  // Developer login handler
  const handleDeveloperLogin = (e) => {
    e.preventDefault();
    const { username, password } = formData;
    
    if (username === 'Dakshin' && password === 'salian') {
      const devUser = {
        uid: 'dev-user',
        displayName: 'Dakshin',
        email: 'dakshin@local.dev',
        photoURL: null,
        isDevUser: true
      };
      
      localStorage.setItem('user', JSON.stringify(devUser));
      setUser(devUser);
      navigate(from, { replace: true });
    } else {
      setError('Invalid developer credentials');
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-white dark:bg-[#0B0F19]">
      {/* Back Button */}
      <div className="p-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 dark:text-[#9CA3AF] hover:text-gray-900 dark:hover:text-[#E5E7EB] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>
      </div>
      <div className="flex items-center justify-center flex-1">
        <div className="bg-white dark:bg-[#1A2235] border border-gray-200 dark:border-[#2A3550] rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <img src="/favicon.png" alt="Logo" className="w-16 h-16 mx-auto mb-4 rounded-2xl shadow-lg" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome to Maths Solver
          </h1>
            <p className="text-gray-600 dark:text-[#9CA3AF]">Master math with confidence</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-6 bg-gray-100 dark:bg-[#121826] rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-[#1A2235] text-indigo-500 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-[#9CA3AF] hover:text-gray-900 dark:hover:text-[#E5E7EB]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 rounded-lg">
              {success}
            </div>
          )}

          {/* Google Login Tab */}
          {activeTab === 'google' && (
            <div>
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Signing in...' : 'Sign in with Google'}
              </button>
            </div>
          )}

          {/* Manual Login Tab */}
          {activeTab === 'login' && (
            <form onSubmit={handleManualLogin}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>
          )}

          {/* Registration Tab */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mobile Number
                  </label>
                  <div className="flex">
                    <select
                      name="countryCode"
                      value={formData.countryCode || '+91'}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="+91">+91 (India)</option>
                      <option value="+1">+1 (USA)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+61">+61 (Australia)</option>
                      <option value="+81">+81 (Japan)</option>
                    </select>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      required
                      pattern="[0-9]{10}"
                      title="Please enter a valid 10-digit mobile number"
                      className="flex-1 px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter 10-digit mobile number"
                    />
                  </div>
                  {formData.mobile && formData.mobile.length !== 10 && (
                    <p className="text-red-500 text-xs mt-1">Mobile number must be exactly 10 digits</p>
                  )}
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Register'}
                </button>
              </div>
            </form>
          )}

          {/* Developer Login Tab */}
          {activeTab === 'developer' && (
            <form onSubmit={handleDeveloperLogin}>
              <div className="space-y-4">
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg mb-4">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    🔧 Development only. Use credentials: <strong>Dakshin / salian</strong>
                  </p>
                </div>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label htmlFor="devPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="devPassword"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter password"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  Developer Login
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <a href="/privacypolicy" className="underline hover:text-purple-600">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
}
