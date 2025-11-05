import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import { Link } from 'react-router-dom';
import { Film, LogOut, User, Sparkles, Star, PenSquare } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Header */}
      <header className="bg-white border-b border-amber-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 rounded-xl shadow-md">
                <Film className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Movie Reviews
                </h1>
                <p className="text-xs text-gray-600">Share your cinematic journey</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
                <User className="w-4 h-4 text-amber-600" />
                <span className="text-gray-700 text-sm font-medium">{user?.email}</span>
              </div>
              <button
                onClick={logout}
                className="group flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span className="font-medium text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-8 mb-8 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full mb-3">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Welcome Back</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Ready to Share Your Thoughts?
              </h2>
              <p className="text-amber-50 text-sm md:text-base max-w-2xl">
                Discover amazing films and share your reviews with the community
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <Star className="w-16 h-16 text-amber-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Add Review Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="group bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex items-center space-x-2.5">
              {showForm ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Hide Review Form</span>
                </>
              ) : (
                <>
                  <PenSquare className="w-5 h-5" />
                  <span>Write a Review</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Review Form */}
        {showForm && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-amber-200 shadow-lg">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-lg">
                  <PenSquare className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Create New Review</h3>
              </div>
              <ReviewForm />
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-amber-200 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-lg">
                <Film className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">All Reviews</h3>
                <p className="text-sm text-gray-600">Community ratings and reviews</p>
              </div>
            </div>
            
            {/* Stats Badge */}
            <div className="hidden sm:flex items-center space-x-2 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
              <Star className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-gray-700">Latest</span>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <ReviewList />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;