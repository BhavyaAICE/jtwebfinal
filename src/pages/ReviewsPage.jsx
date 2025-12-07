import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ReviewModal from '../components/ReviewModal';
import './ReviewsPage.css';

function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ avg_rating: 0, total_reviews: 0 });
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [filterRating, setFilterRating] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase.rpc('get_site_stats')
      ]);

      if (reviewsRes.data) setReviews(reviewsRes.data);
      if (statsRes.data) setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filterRating === 'all') return true;
    return review.rating === parseInt(filterRating);
  });

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();

  return (
    <div className="reviews-page">
      <section className="reviews-hero">
        <div className="reviews-hero-content">
          <h1>Customer Reviews</h1>
          <p>See what our customers are saying about our products and services</p>
        </div>
      </section>

      <section className="reviews-container">
        <div className="reviews-summary">
          <div className="rating-overview">
            <div className="rating-score">
              <span className="big-rating">{stats.avg_rating}</span>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star} className={`star ${star <= Math.round(stats.avg_rating) ? 'filled' : ''}`}>
                    ★
                  </span>
                ))}
              </div>
              <span className="total-reviews">{stats.total_reviews} reviews</span>
            </div>

            <div className="rating-bars">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = ratingDistribution[rating] || 0;
                const percentage = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
                return (
                  <div key={rating} className="rating-bar-row">
                    <span className="rating-label">{rating} ★</span>
                    <div className="rating-bar">
                      <div
                        className="rating-bar-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="rating-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            className="btn-primary write-review-btn"
            onClick={() => setShowReviewModal(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Write a Review
          </button>
        </div>

        <div className="reviews-list-section">
          <div className="reviews-filter">
            <label>Filter by rating:</label>
            <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {loading ? (
            <div className="loading-state">
              <p>Loading reviews...</p>
            </div>
          ) : filteredReviews.length > 0 ? (
            <div className="reviews-list">
              {filteredReviews.map(review => (
                <div key={review.id} className="review-card-full">
                  <div className="review-header">
                    <div className="review-author-info">
                      <div className="review-avatar">
                        {review.author.charAt(0).toUpperCase()}
                      </div>
                      <div className="review-author-details">
                        <h4>{review.author}</h4>
                        <span className="review-date">
                          {new Date(review.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="review-rating">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} className={`star ${star <= review.rating ? 'filled' : ''}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="review-content">
                    <p>{review.comment}</p>
                    {review.verified_purchase && (
                      <span className="verified-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-reviews">
              <p>No reviews found for this rating filter.</p>
            </div>
          )}
        </div>
      </section>

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onReviewSubmitted={loadData}
      />
    </div>
  );
}

export default ReviewsPage;
