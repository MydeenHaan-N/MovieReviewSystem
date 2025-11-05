import React, { useState } from 'react';
import { useReviews } from '../contexts/ReviewsContext';
import { useAuth } from '../contexts/AuthContext';
import { Star, Filter, Calendar, TrendingUp, User, MessageSquare, Sparkles, ArrowUpDown, Film, ThumbsUp, ThumbsDown, Meh, Edit2, Trash2, Save, X, BarChart3, PieChart, Award } from 'lucide-react';
const ReviewList = () => {
  const { reviews, loading, fetchReviews, deleteReview, updateReview } = useReviews();
  const { user } = useAuth();
  const [filters, setFilters] = useState({ rating: 'all' });
  const [sort, setSort] = useState({ by: 'createdAt', order: 'DESC' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ movieName: '', rating: 0, reviewText: '' });
  const [editingHoverRating, setEditingHoverRating] = useState(0);
  React.useEffect(() => {
    fetchReviews({ ...filters, sortBy: sort.by, sortOrder: sort.order });
  }, [filters, sort]);
  // Analytics calculations
  const analytics = React.useMemo(() => {
    if (reviews.length === 0) return null;
    const totalReviews = reviews.length;
    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1);
    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length,
      percentage: ((reviews.filter(r => r.rating === rating).length / totalReviews) * 100).toFixed(0)
    }));
    const sentimentDistribution = {
      positive: reviews.filter(r => r.sentiment === 'positive').length,
      neutral: reviews.filter(r => r.sentiment === 'neutral').length,
      negative: reviews.filter(r => r.sentiment === 'negative').length,
    };
    const topRatedMovies = [...reviews]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
    return {
      totalReviews,
      avgRating,
      ratingDistribution,
      sentimentDistribution,
      topRatedMovies
    };
  }, [reviews]);
  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300'
              }`}
          />
        ))}
      </div>
    );
  };
  const renderEditableStars = (currentRating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setEditData({ ...editData, rating: star })}
            onMouseEnter={() => setEditingHoverRating(star)}
            onMouseLeave={() => setEditingHoverRating(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-5 h-5 transition-all duration-200 ${star <= (editingHoverRating || currentRating)
                  ? 'fill-amber-400 text-amber-400 drop-shadow-lg'
                  : 'text-gray-300 hover:text-gray-400'
                }`}
            />
          </button>
        ))}
        <span className="ml-2 text-gray-700 font-semibold">{currentRating}/5</span>
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
      case 'positive': return 'text-green-700 bg-green-50 border-green-200';
      case 'negative': return 'text-red-700 bg-red-50 border-red-200';
      case 'neutral': return 'text-gray-700 bg-gray-50 border-gray-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };
  const handleEdit = (review) => {
    setEditingId(review.id);
    setEditData({
      movieName: review.movieName,
      rating: review.rating,
      reviewText: review.reviewText,
    });
    setEditingHoverRating(0);
  };
  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview(reviewId);
      } catch (error) {
        console.error('Failed to delete review:', error);
        alert('Failed to delete review. Please try again.');
      }
    }
  };
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (editData.rating === 0 || !editData.reviewText.trim()) {
      alert('Please select a rating and fill in the review text.');
      return;
    }
    try {
      await updateReview(editingId, editData);
      setEditingId(null);
      setEditData({ movieName: '', rating: 0, reviewText: '' });
      setEditingHoverRating(0);
    } catch (error) {
      console.error('Failed to update review:', error);
      alert('Failed to update review. Please try again.');
    }
  };
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ movieName: '', rating: 0, reviewText: '' });
    setEditingHoverRating(0);
  };
  const isOwner = (review) => review.User?.email === user?.email;
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
          <Film className="w-8 h-8 text-amber-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-gray-600 font-medium">Loading amazing reviews...</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Analytics Dashboard */}
      {analytics && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <MessageSquare className="w-8 h-8 opacity-80" />
                <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold">
                  Total
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{analytics.totalReviews}</p>
              <p className="text-amber-100 text-sm">Reviews</p>
            </div>
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-8 h-8 opacity-80 fill-white" />
                <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold">
                  Average
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{analytics.avgRating}</p>
              <p className="text-amber-100 text-sm">Rating</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <ThumbsUp className="w-8 h-8 opacity-80" />
                <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold">
                  Positive
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{analytics.sentimentDistribution.positive}</p>
              <p className="text-green-100 text-sm">Reviews</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <ThumbsDown className="w-8 h-8 opacity-80" />
                <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold">
                  Negative
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{analytics.sentimentDistribution.negative}</p>
              <p className="text-orange-100 text-sm">Reviews</p>
            </div>
          </div>
          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rating Distribution - Bar Chart */}
            <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-lg">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Rating Distribution</h3>
              </div>
              <div className="space-y-2">
                {analytics.ratingDistribution.map(({ rating, count, percentage }) => {
                  const maxCount = Math.max(...analytics.ratingDistribution.map(r => r.count));
                  const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  return (
                    <div key={rating} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 min-w-[80px]">
                          <span className="text-gray-700 font-semibold">{rating}</span>
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        </div>
                        <div className="flex-1 mx-4">
                          <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden relative">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-orange-600 h-6 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                              style={{ width: `${barWidth}%` }}
                            >
                              {count > 0 && (
                                <span className="text-white text-xs font-bold">{count}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-gray-600 font-medium min-w-[60px] text-right">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Sentiment Analysis - Pie Chart */}
            <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-lg">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-lg">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Sentiment Analysis</h3>
              </div>
              <div className="flex flex-col items-center">
                {/* Pie Chart */}
                <div className="relative w-48 h-48 mb-6">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {(() => {
                      const total = analytics.sentimentDistribution.positive +
                        analytics.sentimentDistribution.neutral +
                        analytics.sentimentDistribution.negative;
                      if (total === 0) return null;
                      const positivePercent = (analytics.sentimentDistribution.positive / total) * 100;
                      const neutralPercent = (analytics.sentimentDistribution.neutral / total) * 100;
                      const negativePercent = (analytics.sentimentDistribution.negative / total) * 100;
                      let cumulativePercent = 0;
                      const createArc = (percent, color, offset) => {
                        if (percent === 0) return null;
                        const radius = 40;
                        const circumference = 2 * Math.PI * radius;
                        const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
                        const strokeDashoffset = -((offset / 100) * circumference);
                        return (
                          <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="transparent"
                            stroke={color}
                            strokeWidth="20"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-700"
                          />
                        );
                      };
                      return (
                        <>
                          {createArc(positivePercent, '#22c55e', cumulativePercent)}
                          {createArc(neutralPercent, '#6b7280', cumulativePercent += positivePercent)}
                          {createArc(negativePercent, '#ef4444', cumulativePercent += neutralPercent)}
                        </>
                      );
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{analytics.totalReviews}</p>
                      <p className="text-xs text-gray-600">Total</p>
                    </div>
                  </div>
                </div>
                {/* Legend */}
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <ThumbsUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">Positive</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {analytics.sentimentDistribution.positive}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <Meh className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Neutral</span>
                    </div>
                    <span className="text-lg font-bold text-gray-600">
                      {analytics.sentimentDistribution.neutral}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <ThumbsDown className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-gray-900">Negative</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">
                      {analytics.sentimentDistribution.negative}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Top Rated Movies - Full Horizontal */}
          <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Top Rated</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {analytics.topRatedMovies.map((movie, index) => (
                <div key={movie.id} className="flex flex-col items-center p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 text-center">
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold rounded-full text-sm mb-2">
                    {index + 1}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mb-2 truncate max-w-[100px]">
                    {movie.movieName}
                  </p>
                  <div className="flex items-center justify-center space-x-1 bg-white px-2 py-1 rounded-full border border-amber-300">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold text-gray-900">{movie.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {/* Filters Section */}
      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
        <div className="flex items-center space-x-2 mb-4">
          <div className="bg-amber-100 p-1.5 rounded-md">
            <Filter className="w-5 h-5 text-amber-600" />
          </div>
          <h4 className="text-gray-900 font-semibold">Filter & Sort</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rating Filter */}
          <div className="space-y-2">
            <label className="text-gray-700 text-sm font-medium flex items-center space-x-2">
              <Star className="w-4 h-4 text-amber-600" />
              <span>Rating</span>
            </label>
            <select
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-amber-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 cursor-pointer"
            >
              <option value="all">All Ratings</option>
              {[5, 4, 3, 2, 1].map(r => (
                <option key={r} value={r}>
                  {r} Star{r !== 1 ? 's' : ''} {r === 5 ? '⭐' : ''}
                </option>
              ))}
            </select>
          </div>
          {/* Sort By */}
          <div className="space-y-2">
            <label className="text-gray-700 text-sm font-medium flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>Sort By</span>
            </label>
            <select
              value={sort.by}
              onChange={(e) => setSort({ ...sort, by: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-amber-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 cursor-pointer"
            >
              <option value="createdAt">Date</option>
              <option value="rating">Rating</option>
            </select>
          </div>
          {/* Sort Order */}
          <div className="space-y-2">
            <label className="text-gray-700 text-sm font-medium flex items-center space-x-2">
              <ArrowUpDown className="w-4 h-4 text-amber-600" />
              <span>Order</span>
            </label>
            <select
              value={sort.order}
              onChange={(e) => setSort({ ...sort, order: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-amber-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 cursor-pointer"
            >
              <option value="DESC">Newest First</option>
              <option value="ASC">Oldest First</option>
            </select>
          </div>
        </div>
      </div>
      {/* Reviews Count */}
      {reviews.length > 0 && (
        <div className="flex items-center space-x-2 text-gray-600 text-sm">
          <MessageSquare className="w-4 h-4 text-amber-600" />
          <span>Showing <span className="text-gray-900 font-semibold">{reviews.length}</span> review{reviews.length !== 1 ? 's' : ''}</span>
        </div>
      )}
      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-amber-50 rounded-2xl p-12 border border-amber-200 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-6 rounded-full">
                <MessageSquare className="w-12 h-12 text-amber-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600">Be the first to share your thoughts about a movie!</p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <div
              key={review.id}
              className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-md">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    {/* Movie name is always non-editable */}
                    <h4 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                      {review.movieName}
                    </h4>
                  </div>
                </div>
                {/* Rating and Sentiment */}
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center space-x-2 bg-amber-50 px-4 py-2 rounded-full border border-amber-200 group-hover:border-amber-400 transition-colors">
                    {editingId === review.id ? (
                      renderEditableStars(editData.rating)
                    ) : (
                      <>
                        {renderStars(review.rating)}
                        <span className="text-gray-900 font-semibold ml-2">{review.rating}/5</span>
                      </>
                    )}
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
              <div className="mb-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                {editingId === review.id ? (
                  <textarea
                    value={editData.reviewText}
                    onChange={(e) => setEditData({ ...editData, reviewText: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none text-gray-700 leading-relaxed resize-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
                    rows={3}
                    placeholder="Your review text..."
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {review.reviewText}
                  </p>
                )}
              </div>
              {/* Footer */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="bg-amber-100 p-1.5 rounded-full">
                    <User className="w-4 h-4 text-amber-600" />
                  </div>
                  <span>
                    By <span className="text-amber-700 font-medium">{review.User?.email || 'Unknown User'}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>{new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                {/* Actions - only for owner */}
                {isOwner(review) && (
                  <div className="flex items-center space-x-2 ml-auto">
                    {editingId === review.id ? (
                      <form onSubmit={handleSaveEdit} className="flex items-center space-x-2">
                        <button
                          type="submit"
                          className="p-2 bg-green-100 rounded-lg text-green-700 hover:bg-green-200 transition-colors border border-green-200 shadow-sm"
                          aria-label="Save changes"
                          title="Save changes"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="p-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors border border-gray-200 shadow-sm"
                          aria-label="Cancel edit"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </form>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleEdit(review)}
                          className="p-2 bg-blue-100 rounded-lg text-blue-700 hover:bg-blue-200 transition-colors border border-blue-200 shadow-sm"
                          aria-label="Edit review"
                          title="Edit review"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(review.id)}
                          className="p-2 bg-red-100 rounded-lg text-red-700 hover:bg-red-200 transition-colors border border-red-200 shadow-sm"
                          aria-label="Delete review"
                          title="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default ReviewList;