import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import { Link } from 'react-router-dom';
import { Film, LogOut, User, Sparkles, Star } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl shadow-lg">
                <Film className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  CineReviews
                </h1>
                <p className="text-sm text-gray-400">Share your movie experiences</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <User className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300 text-sm">{user?.email}</span>
              </div>
              <button
                onClick={logout}
                className="group flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 hover:scale-105"
              >
                <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-purple-500/10 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-500/20 mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">Your Movie Journey</span>
          </div>
          <h2 className="text-5xl font-bold text-white mb-4">
            Discover & Review
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Share your thoughts on the latest films and explore reviews from fellow movie enthusiasts
          </p>
        </div>

        {/* Add Review Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="group relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center space-x-3">
              <Star className="w-6 h-6" />
              <span>{showForm ? 'Hide Review Form' : 'Write a Review'}</span>
            </div>
          </button>
        </div>

        {/* Review Form */}
        {showForm && (
          <div className="mb-12 transform transition-all duration-500 animate-in fade-in slide-in-from-top-4">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <ReviewForm />
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
              <Film className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">Latest Reviews</h3>
          </div>
          <ReviewList />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;