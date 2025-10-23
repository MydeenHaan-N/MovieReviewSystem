import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Film, Mail, Lock, ArrowRight, UserPlus, Eye, EyeOff, Check } from 'lucide-react';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email required'),
  password: yup.string().min(6, 'Password must be at least 6 chars').required('Password required'),
});

const Register = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(schema),
  });

  const password = watch('password', '');

  const passwordStrength = {
    hasLength: password.length >= 6,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    const result = await authRegister(data.email, data.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Content */}
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl shadow-2xl shadow-purple-500/50 transform hover:scale-110 transition-transform duration-300">
              <Film className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Join CineReviews
          </h2>
          <p className="text-gray-400 text-sm">Create your account and start sharing reviews</p>
        </div>

        {/* Register Form */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
                <p className="text-red-400 text-sm text-center font-medium">{error}</p>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm font-medium flex items-center space-x-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <span>Email Address</span>
              </label>
              <div className="relative">
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="your.email@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1 ml-1 flex items-center space-x-1">
                  <span>⚠</span>
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm font-medium flex items-center space-x-2">
                <Lock className="w-4 h-4 text-purple-400" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1 ml-1 flex items-center space-x-1">
                  <span>⚠</span>
                  <span>{errors.password.message}</span>
                </p>
              )}

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3 space-y-2 bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-gray-400 text-xs font-medium mb-2">Password Requirements:</p>
                  <div className="space-y-1">
                    <div className={`flex items-center space-x-2 text-xs transition-colors ${passwordStrength.hasLength ? 'text-green-400' : 'text-gray-500'}`}>
                      <Check className={`w-3 h-3 ${passwordStrength.hasLength ? 'opacity-100' : 'opacity-30'}`} />
                      <span>At least 6 characters</span>
                    </div>
                    <div className={`flex items-center space-x-2 text-xs transition-colors ${passwordStrength.hasLetter ? 'text-green-400' : 'text-gray-500'}`}>
                      <Check className={`w-3 h-3 ${passwordStrength.hasLetter ? 'opacity-100' : 'opacity-30'}`} />
                      <span>Contains letters</span>
                    </div>
                    <div className={`flex items-center space-x-2 text-xs transition-colors ${passwordStrength.hasNumber ? 'text-green-400' : 'text-gray-500'}`}>
                      <Check className={`w-3 h-3 ${passwordStrength.hasNumber ? 'opacity-100' : 'opacity-30'}`} />
                      <span>Contains numbers</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold shadow-xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center space-x-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>

            {/* Benefits */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-purple-300 text-sm font-medium mb-2">What you'll get:</p>
              <ul className="space-y-1 text-gray-400 text-xs">
                <li className="flex items-center space-x-2">
                  <Check className="w-3 h-3 text-purple-400" />
                  <span>Write and share movie reviews</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3 h-3 text-purple-400" />
                  <span>Connect with movie enthusiasts</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3 h-3 text-purple-400" />
                  <span>Discover new films and perspectives</span>
                </li>
              </ul>
            </div>

            {/* Login Link */}
            <div className="text-center pt-2">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-purple-400 hover:text-purple-300 font-semibold transition-colors inline-flex items-center space-x-1 group"
                >
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;