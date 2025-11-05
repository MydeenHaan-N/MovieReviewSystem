import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useReviews } from '../contexts/ReviewsContext';
import { useAuth } from '../contexts/AuthContext';
import { Film, Star, Send, Check, AlertCircle, Search, Sparkles } from 'lucide-react';

const schema = yup.object({
  movieName: yup.string().min(2, 'Movie name must be at least 2 chars').required('Movie name required'),
  rating: yup.number().integer().min(1, 'Rating min 1').max(5, 'Rating max 5').required('Rating required'),
  reviewText: yup.string().min(10, 'Review must be at least 10 chars').required('Review required'),
});

// Simple base64 placeholder for broken images (Film icon)
const posterPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA0MCA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDE2SDE0VjIwSDEwVjI2SDE0VjMwSDEwVjM2SDE0VjQwSDE4VjIwSDE0VjE2SDE4VjE2SDEwVjE2Wk0yMCAxNkwyNCAyMEgyOVYxNkgyMFYxNlpNMjAgNDhMMjQgNDJMMjAgMzZMMjQgMzJMMTYgMjhMMjAgMzJMMjQgMzZMMTYgNDJMMjAgNDhaIiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPgo=';

const ReviewForm = () => {
  const { addReview } = useReviews();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const { control, register, handleSubmit, reset, setValue, formState: { errors, isValid }, watch, trigger, clearErrors } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      rating: 0,
      movieName: '',
      reviewText: '',
    },
  });

  const movieName = watch('movieName', '');
  const reviewText = watch('reviewText', '');
  const watchedRating = watch('rating', 0);
  const charCount = reviewText.length;

  // Clear field-specific errors on change
  useEffect(() => {
    if (reviewText.length > 0) {
      clearErrors('reviewText');
    }
  }, [reviewText, clearErrors]);

  // Debounced search for movie suggestions
  useEffect(() => {
    const currentQuery = movieName;
    if (currentQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`/movies/search?q=${encodeURIComponent(currentQuery)}`);
        if (res.data.Response === 'True') {
          setSuggestions(res.data.Search.slice(0, 3) || []);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error('Search error:', err);
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [movieName]);

  const onSubmit = async (data) => {
    // Auth check before submit
    if (!token || !user) {
      setError('Please log in to submit a review.');
      setTimeout(() => setError(''), 3000);
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const result = await addReview(data);
      if (result.success) {
        setSuccess('Review added successfully!');
        reset();
        setSuggestions([]);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.msg || 'Failed to add review. Please try again.');
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('An unexpected error occurred. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectSuggestion = (suggestion) => {
    setValue('movieName', suggestion.Title, { shouldValidate: true });
    setSuggestions([]);
    setError('');
  };

  const handleImageError = (e) => {
    e.target.src = posterPlaceholder;
  };

  const hasErrors = Object.keys(errors).length > 0;
  const isFormReady = isValid && watchedRating >= 1 && token && user;

  const onInvalid = (errors) => {
    trigger();
  };

  return (
    <div className="relative">
      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500 rounded-full p-1">
              <Check className="w-4 h-4 text-white" />
            </div>
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Global Form Error Banner */}
      {hasErrors && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 inline mr-2 text-amber-600" />
          <span className="text-amber-700 text-sm font-medium">Please fix the errors below to submit.</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        {/* Movie Name Input with Autocomplete */}
        <div className="space-y-2">
          <label className="text-gray-700 text-sm font-semibold flex items-center space-x-2">
            <div className="bg-amber-100 p-1.5 rounded-md">
              <Film className="w-4 h-4 text-amber-600" />
            </div>
            <span>Movie Name</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              {...register('movieName')}
              type="text"
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              placeholder="Search for a movie..."
            />
          </div>
          {errors.movieName && (
            <p className="text-red-500 text-xs mt-1 ml-1 flex items-center space-x-1">
              <span>⚠</span>
              <span>{errors.movieName.message}</span>
            </p>
          )}
          
          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="mt-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg animate-in fade-in slide-in-from-top-2">
              <ul className="max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => selectSuggestion(suggestion)}
                    className="flex items-center px-4 py-3 hover:bg-amber-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200 group"
                  >
                    {suggestion.Poster !== 'N/A' ? (
                      <img 
                        src={suggestion.Poster} 
                        alt={suggestion.Title} 
                        onError={handleImageError}
                        className="w-10 h-14 mr-4 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform" 
                      />
                    ) : (
                      <div className="w-10 h-14 mr-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                        <Film className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">{suggestion.Title}</div>
                      <div className="text-sm text-gray-500">{suggestion.Year} • {suggestion.Type}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Rating Stars with Controller */}
        <div className="space-y-3">
          <label className="text-gray-700 text-sm font-semibold flex items-center space-x-2">
            <div className="bg-amber-100 p-1.5 rounded-md">
              <Star className="w-4 h-4 text-amber-600" />
            </div>
            <span>Your Rating</span>
            <span className="text-red-500">*</span>
          </label>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <Controller
              name="rating"
              control={control}
              render={({ field: { value: ratingValue, onChange } }) => (
                <>
                  <div className="flex items-center justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((starRating) => (
                      <button
                        key={starRating}
                        type="button"
                        onClick={() => {
                          onChange(starRating);
                          clearErrors('rating');
                        }}
                        onMouseEnter={() => setHoverRating(starRating)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-all duration-200 hover:scale-110 focus:outline-none"
                        title={`Rate ${starRating} star${starRating > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-10 h-10 transition-all duration-200 ${
                            starRating <= (hoverRating || ratingValue)
                              ? 'fill-amber-400 text-amber-400 drop-shadow-md'
                              : 'text-gray-300 hover:text-gray-400'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-center mt-3">
                    {ratingValue > 0 ? (
                      <span className="text-gray-700 font-semibold text-lg">
                        {ratingValue} / 5 Stars
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm italic">Click to select a rating</span>
                    )}
                  </div>
                </>
              )}
            />
          </div>
          {errors.rating && (
            <p className="text-red-500 text-xs mt-1 ml-1 flex items-center space-x-1">
              <span>⚠</span>
              <span>{errors.rating.message}</span>
            </p>
          )}
        </div>

        {/* Review Text Area */}
        <div className="space-y-2">
          <label className="text-gray-700 text-sm font-semibold flex items-center space-x-2">
            <div className="bg-amber-100 p-1.5 rounded-md">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <span>Your Review</span>
          </label>
          <div className="relative">
            <textarea
              {...register('reviewText')}
              rows={5}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Share your thoughts about this movie... What did you love? What could be better?"
            />
            <div className="absolute bottom-3 right-3 text-xs font-medium text-gray-400">
              {charCount} / 500
            </div>
          </div>
          {errors.reviewText && (
            <p className="text-red-500 text-xs mt-1 ml-1 flex items-center space-x-1">
              <span>⚠</span>
              <span>{errors.reviewText.message}</span>
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !isFormReady}
          className="group relative w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:from-gray-300 disabled:to-gray-400 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-center space-x-3">
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Submitting Your Review...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Review</span>
              </>
            )}
          </div>
        </button>

        {/* Helper Text */}
        <p className="text-center text-xs text-gray-500 mt-4">
          All fields are required. Your review will be visible to the community.
        </p>
      </form>
    </div>
  );
};

export default ReviewForm;