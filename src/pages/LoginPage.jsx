import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ChevronRight, Shield, BarChart3, Workflow, Search, Eye, EyeOff, User, Lock, Building2 } from 'lucide-react';

const slides = [
  {
    title: "Enterprise Asset Intelligence",
    description: "Comprehensive visibility across your entire asset portfolio with real-time monitoring, predictive analytics, and automated compliance reporting.",
    icon: Search,
    stats: "99.9% Uptime • 500K+ Assets Tracked"
  },
  {
    title: "Automated Workflow Engine", 
    description: "Streamline complex asset lifecycle processes with intelligent automation, approval workflows, and seamless integration with existing enterprise systems.",
    icon: Workflow,
    stats: "75% Faster Processing • 40+ Integrations"
  },
  {
    title: "Advanced Business Intelligence",
    description: "Transform asset data into actionable insights with executive dashboards, predictive maintenance alerts, and comprehensive ROI analytics.",
    icon: BarChart3,
    stats: "Real-time Analytics • Custom KPIs"
  },
  {
    title: "Enterprise-Grade Security",
    description: "Bank-level encryption, multi-factor authentication, role-based access control, and comprehensive audit trails for regulatory compliance.",
    icon: Shield,
    stats: "SOC 2 Certified • ISO 27001 Compliant"
  }
];

const LoginPage = () => {
  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    general: ''
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
        general: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = { username: '', password: '', general: '' };
    let isValid = true;

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      await signIn(formData.username, formData.password);
      navigate('/dashboard');
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        general: error || 'Invalid credentials'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const IconComponent = slides[currentSlide].icon;

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(71, 85, 105, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(71, 85, 105, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      />
      
      <div className="flex min-h-screen relative z-10">
        <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-slate-600/5 rounded-full blur-2xl" />
          
          <div className="flex flex-col justify-between p-12 relative z-10 w-full">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AssetFlow Enterprise</h1>
                <p className="text-slate-400 text-sm">Asset Management Platform</p>
              </div>
            </div>
            <div className="max-w-2xl">
              <div className="flex space-x-2 mb-8">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'bg-blue-500 w-8' 
                        : 'bg-slate-600 w-6 hover:bg-slate-500'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center justify-center w-14 h-14 bg-slate-800 border border-slate-700 rounded-xl">
                    <IconComponent className="w-7 h-7 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                      {slides[currentSlide].title}
                    </h2>
                    <div className="text-sm text-blue-400 font-medium">
                      {slides[currentSlide].stats}
                    </div>
                  </div>
                </div>
                <p className="text-lg text-slate-300 leading-relaxed">
                  {slides[currentSlide].description}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-400">
              <div className="flex items-center space-x-6">
                <span>Trusted by 500+ enterprises</span>
                <span>•</span>
                <span>99.9% uptime SLA</span>
                <span>•</span>
                <span>24/7 support</span>
              </div>
              <div className="text-slate-500">
                © 2024 AssetFlow Enterprise
              </div>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-2/5 flex items-center justify-center p-8 lg:p-12 bg-white">
          <div className="w-full max-w-md">
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">AssetFlow Enterprise</h1>
                </div>
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Sign in to your account
              </h2>
              <p className="text-slate-600">
                Access your enterprise asset management dashboard
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2">
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-blue-600 transition-colors duration-200 ${
                      errors.username ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                    placeholder="Enter your username or email"
                    autoComplete="username"
                  />
                </div>
                {errors.username && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.username}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-blue-600 transition-colors duration-200 ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>
              {errors.general && (
                <p className="text-sm text-red-600 text-center">
                  {errors.general}
                </p>
              )}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-slate-700">Keep me signed in</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
            <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">
                    Secure Enterprise Access
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Your connection is encrypted and monitored for security. All access attempts are logged for compliance and audit purposes.
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:hidden mt-8 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-slate-800 border border-slate-700 rounded-xl mb-4">
                <IconComponent className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {slides[currentSlide].title}
              </h3>
              <p className="text-slate-600 text-sm mb-2">
                {slides[currentSlide].description}
              </p>
              <div className="text-xs text-blue-600 font-medium">
                {slides[currentSlide].stats}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;