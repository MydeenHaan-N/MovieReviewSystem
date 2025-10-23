import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { useReviews } from '../contexts/ReviewsContext';
import { useAuth } from '../contexts/AuthContext';
import { Film, Star, Send, Check, AlertCircle, Search, Sparkles } from 'lucide-react';

const schema = yup.object({
  movieName: yup.string().min(2, 'Movie name must be at least 2 chars').required('Movie name required'),
  rating: yup.number().min(1, 'Rating min 1').max(5, 'Rating max 5').required('Rating required'),
  reviewText: yup.string().min(10, 'Review must be at least 10 chars').required('Review required'),
});

const ReviewForm = () => {
  const { addReview } = useReviews();
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const { register, handleSubmit, reset, setValue, formState: { errors }, watch } = useForm({
    resolver: yupResolver(schema),
  });

  const reviewText = watch('reviewText', '');
  const charCount = reviewText.length;

  // Debounced search for movie suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`/movies/search?q=${encodeURIComponent(query)}`);
        if (res.data.Response === 'True') {
          setSuggestions(res.data.Search || []);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error('Search error:', err);
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const result = await addReview(data);
    if (result.success) {
      setSuccess('Review added successfully!');
      reset();
      setQuery('');
      setSuggestions([]);
      setSelectedRating(0);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.msg);
      setTimeout(() => setError(''), 3000);
    }
    setIsSubmitting(false);
  };

  const selectSuggestion = (suggestion) => {
    setValue('movieName', suggestion.Title);
    setQuery(suggestion.Title);
    setSuggestions([]);
  };

  const handleRatingClick = (rating) => {
    setSelectedRating(rating);
    setValue('rating', rating);
  };

  return (
    <div className="relative">
      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-xl p-4 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500 rounded-full p-1">
              <Check className="w-4 h-4 text-white" />
            </div>
            <p className="text-green-400 font-medium">{success}</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Movie Name Input with Autocomplete */}
        <div className="space-y-2">
          <label className="text-white text-sm font-semibold flex items-center space-x-2">
            <Film className="w-4 h-4 text-purple-400" />
            <span>Movie Name</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              {...register('movieName')}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setValue('movieName', e.target.value);
              }}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              placeholder="Search for a movie..."
            />
          </div>
          {errors.movieName && (
            <p className="text-red-400 text-xs mt-1 ml-1 flex items-center space-x-1">
              <span>⚠</span>
              <span>{errors.movieName.message}</span>
            </p>
          )}
          
          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2">
              <ul className="max-h-60 overflow-y-auto">
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => selectSuggestion(suggestion)}
                    className="flex items-center px-4 py-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-b-0 transition-colors duration-200 group"
                  >
                    {suggestion.Poster !== 'N/A' ? (
                      <img 
                        src={suggestion.Poster} 
                        alt={suggestion.Title} 
                        className="w-10 h-14 mr-4 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform" 
                      />
                    ) : (
                      <div className="w-10 h-14 mr-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Film className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-white group-hover:text-purple-300 transition-colors">{suggestion.Title}</div>
                      <div className="text-sm text-gray-400">{suggestion.Year} • {suggestion.Type}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Rating Stars */}
        <div className="space-y-3">
          <label className="text-white text-sm font-semibold flex items-center space-x-2">
            <Star className="w-4 h-4 text-purple-400" />
            <span>Your Rating</span>
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleRatingClick(rating)}
                onMouseEnter={() => setHoverRating(rating)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-all duration-200 hover:scale-110 focus:outline-none"
              >
                <Star
                  className={`w-10 h-10 transition-all duration-200 ${
                    rating <= (hoverRating || selectedRating)
                      ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                      : 'text-gray-600 hover:text-gray-500'
                  }`}
                />
              </button>
            ))}
            {selectedRating > 0 && (
              <span className="ml-3 text-white font-semibold text-lg">
                {selectedRating} / 5
              </span>
            )}
          </div>
          <input type="hidden" {...register('rating')} value={selectedRating} />
          {errors.rating && (
            <p className="text-red-400 text-xs mt-1 ml-1 flex items-center space-x-1">
              <span>⚠</span>
              <span>{errors.rating.message}</span>
            </p>
          )}
        </div>

        {/* Review Text Area */}
        <div className="space-y-2">
          <label className="text-white text-sm font-semibold flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Your Review</span>
          </label>
          <div className="relative">
            <textarea
              {...register('reviewText')}
              rows={5}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
              placeholder="Share your thoughts about this movie..."
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {charCount} / 500
            </div>
          </div>
          {errors.reviewText && (
            <p className="text-red-400 text-xs mt-1 ml-1 flex items-center space-x-1">
              <span>⚠</span>
              <span>{errors.reviewText.message}</span>
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-center space-x-3">
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Review</span>
              </>
            )}
          </div>
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;