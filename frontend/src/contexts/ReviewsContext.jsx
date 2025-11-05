import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ReviewsContext = createContext();

export const useReviews = () => useContext(ReviewsContext);

export const ReviewsProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, logout } = useAuth(); // Add logout from auth

  const fetchReviews = async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const res = await axios.get(`/reviews?${params}`);
      setReviews(res.data);
    } catch (err) {
      console.error('Fetch reviews error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addReview = async (reviewData) => {
    try {
      const res = await axios.post('/reviews', reviewData);
      setReviews([res.data, ...reviews]);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.msg || 'Add review failed';
      if (err.response?.status === 401) {
        logout(); // Auto-logout on invalid token
      }
      return { success: false, msg };
    }
  };

  // ... (deleteReview and updateReview similar; add 401 handling with logout)

  const deleteReview = async (reviewId) => {
    try {
      await axios.delete(`/reviews/${reviewId}`);
      await fetchReviews();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.msg || 'Delete failed';
      if (err.response?.status === 401) {
        logout();
      }
      return { success: false, msg };
    }
  };

  const updateReview = async (reviewId, data) => {
    try {
      const res = await axios.put(`/reviews/${reviewId}`, data);
      await fetchReviews();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.msg || 'Update failed';
      if (err.response?.status === 401) {
        logout();
      }
      return { success: false, msg };
    }
  };

  useEffect(() => {
    if (token) {
      fetchReviews();
    }
  }, [token]);

  return (
    <ReviewsContext.Provider value={{ reviews, loading, fetchReviews, addReview, deleteReview, updateReview }}>
      {children}
    </ReviewsContext.Provider>
  );
};