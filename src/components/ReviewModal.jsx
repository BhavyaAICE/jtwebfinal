import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Toast from './Toast';
import './ReviewModal.css';

function ReviewModal({ isOpen, onClose, onReviewSubmitted }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [verifiedPurchase, setVerifiedPurchase] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (isOpen && user) {
      loadProducts();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (productId && user) {
      checkVerifiedPurchase();
    }
  }, [productId, user]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const checkVerifiedPurchase = async () => {
    if (!productId || !user) {
      setVerifiedPurchase(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('check_verified_purchase', {
          p_user_id: user.id,
          p_product_id: productId
        });

      if (error) throw error;
      setVerifiedPurchase(data || false);
    } catch (error) {
      console.error('Error checking verified purchase:', error);
      setVerifiedPurchase(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showToast('Please log in to submit a review', 'error');
      return;
    }

    if (rating === 0) {
      showToast('Please select a rating', 'error');
      return;
    }

    if (!comment.trim()) {
      showToast('Please write a comment', 'error');
      return;
    }

    if (!authorName.trim()) {
      showToast('Please enter your name', 'error');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert([{
          user_id: user.id,
          product_id: productId || null,
          rating,
          comment: comment.trim(),
          author: authorName.trim(),
          verified_purchase: verifiedPurchase,
        }]);

      if (error) throw error;

      showToast('Review submitted successfully!', 'success');

      setRating(0);
      setComment('');
      setAuthorName('');
      setProductId('');
      setVerifiedPurchase(false);

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast('Error submitting review. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRating(0);
      setComment('');
      setAuthorName('');
      setProductId('');
      setVerifiedPurchase(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />
      <div className="review-modal-overlay" onClick={handleClose}>
        <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="review-modal-close" onClick={handleClose} disabled={loading}>
            &times;
          </button>

          <div className="review-modal-header">
            <h2>Leave a Review</h2>
            <p>Share your experience with our products and services</p>
          </div>

          <form onSubmit={handleSubmit} className="review-form">
            <div className="rating-input">
              <label className="rating-label">Your Rating</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-button ${star <= rating ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                    disabled={loading}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Product (Optional)</label>
              <select
                className="product-select"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                disabled={loading}
              >
                <option value="">General Review</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              {verifiedPurchase && (
                <div className="verified-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Verified Purchase
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input
                type="text"
                className="form-input"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="John Doe"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your Review</label>
              <textarea
                className="form-textarea"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your experience..."
                rows="5"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn-primary full-width"
              disabled={loading || rating === 0}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Review
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default ReviewModal;
