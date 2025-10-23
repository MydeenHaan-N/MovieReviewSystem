import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ReviewsContext = createContext();

export const useReviews = () => useContext(ReviewsContext);

export const ReviewsProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

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
      return { success: false, msg: err.response?.data?.msg || 'Add review failed' };
    }
  };

  useEffect(() => {
    if (token) {
      fetchReviews(); // Fetch on load
    }
  }, [token]);

  return (
    <ReviewsContext.Provider value={{ reviews, loading, fetchReviews, addReview }}>
      {children}
    </ReviewsContext.Provider>
  );
};