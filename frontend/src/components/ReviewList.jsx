import React, { useState } from 'react';
import { useReviews } from '../contexts/ReviewsContext';
import { Star, Filter, Calendar, TrendingUp, User, MessageSquare, Sparkles, ArrowUpDown, Film, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';

const ReviewList = () => {
  const { reviews, loading, fetchReviews } = useReviews();
  const [filters, setFilters] = useState({ rating: 'all' });
  const [sort, setSort] = useState({ by: 'createdAt', order: 'DESC' });

  React.useEffect(() => {
    fetchReviews({ ...filters, sortBy: sort.by, sortOrder: sort.order });
  }, [filters, sort]);

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="w-4 h-4" />;
      case 'negative': return <ThumbsDown className="w-4 h-4" />;
      case 'neutral': return <Meh className="w-4 h-4" />;
      default: return null;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100/80 border-green-400/30';
      case 'negative': return 'text-red-600 bg-red-100/80 border-red-400/30';
      case 'neutral': return 'text-gray-600 bg-gray-100/80 border-gray-400/30';
      default: return 'text-gray-600 bg-gray-100/80 border-gray-400/30';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <Film className="w-8 h-8 text-purple-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-gray-400 font-medium">Loading amazing reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-purple-400" />
          <h4 className="text-white font-semibold">Filter & Sort</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rating Filter */}
          <div className="space-y-2">
            <label className="text-gray-400 text-sm flex items-center space-x-2">
              <Star className="w-4 h-4 text-purple-400" />
              <span>Rating</span>
            </label>
            <select
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 cursor-pointer"
            >
              <option value="all" className="bg-slate-800">All Ratings</option>
              {[5, 4, 3, 2, 1].map(r => (
                <option key={r} value={r} className="bg-slate-800">
                  {r} Star{r !== 1 ? 's' : ''} {r === 5 ? '⭐' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <label className="text-gray-400 text-sm flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>Sort By</span>
            </label>
            <select
              value={sort.by}
              onChange={(e) => setSort({ ...sort, by: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 cursor-pointer"
            >
              <option value="createdAt" className="bg-slate-800">Date</option>
              <option value="rating" className="bg-slate-800">Rating</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <label className="text-gray-400 text-sm flex items-center space-x-2">
              <ArrowUpDown className="w-4 h-4 text-purple-400" />
              <span>Order</span>
            </label>
            <select
              value={sort.order}
              onChange={(e) => setSort({ ...sort, order: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 cursor-pointer"
            >
              <option value="DESC" className="bg-slate-800">Newest First</option>
              <option value="ASC" className="bg-slate-800">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Count */}
      {reviews.length > 0 && (
        <div className="flex items-center space-x-2 text-gray-400 text-sm">
          <MessageSquare className="w-4 h-4 text-purple-400" />
          <span>Showing <span className="text-white font-semibold">{reviews.length}</span> review{reviews.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6 rounded-full">
                <MessageSquare className="w-12 h-12 text-purple-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Reviews Yet</h3>
            <p className="text-gray-400">Be the first to share your thoughts about a movie!</p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <div
              key={review.id}
              className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                      {review.movieName}
                    </h4>
                  </div>
                </div>
                
                {/* Rating and Sentiment */}
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 group-hover:border-yellow-400/30 transition-colors">
                    {renderStars(review.rating)}
                    <span className="text-white font-semibold ml-2">{review.rating}/5</span>
                  </div>
                  {review.sentiment && (
                    <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium border ${getSentimentColor(review.sentiment)}`}>
                      {getSentimentIcon(review.sentiment)}
                      <span className="capitalize">{review.sentiment}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Text */}
              <div className="mb-4 bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-gray-300 leading-relaxed">
                  {review.reviewText}
                </p>
              </div>

              {/* Footer */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm">
                <div className="flex items-center space-x-2 text-gray-400">
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-1.5 rounded-full">
                    <User className="w-4 h-4 text-purple-400" />
                  </div>
                  <span>
                    By <span className="text-purple-300 font-medium">{review.User.email}</span>
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-400">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>{new Date(review.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewList;