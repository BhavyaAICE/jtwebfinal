import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import ProductVariantsModal from '../components/ProductVariantsModal';
import ReviewModal from '../components/ReviewModal';
import FastForwardIcon from '../assets/fast-forward-button-svgrepo-com.svg';
import ShieldCheckIcon from '../assets/shield-check-svgrepo-com.svg';
import CustomerServiceIcon from '../assets/customer-service-headset-svgrepo-com.svg';
import './HomePage.css';

function HomePage({ navigateTo }) {
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState({});
  const [stats, setStats] = useState({ total_products: 0, total_customers: 0, avg_rating: 0, total_reviews: 0 });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showVariantsModal, setShowVariantsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, reviewsRes, settingsRes, statsRes] = await Promise.all([
        supabase.from('products').select('*').eq('featured', true),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(4),
        supabase.from('site_settings').select('*'),
        supabase.rpc('get_site_stats')
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (reviewsRes.data) setReviews(reviewsRes.data);

      if (settingsRes.data) {
        const settingsObj = {};
        settingsRes.data.forEach(setting => {
          settingsObj[setting.key] = setting.value;
        });
        setSettings(settingsObj);
      }

      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    { icon: <img src={FastForwardIcon} alt="Fast Forward" style={{ width: '56px', height: '56px' }} />, title: 'Instant Digital Delivery', description: 'Get your products instantly through a secure automated system.' },
    { icon: <img src={ShieldCheckIcon} alt="Shield Check" style={{ width: '56px', height: '56px' }} />, title: 'Verified & Trusted Services', description: 'Every product passes strict quality checks for safety & performance.' },
    { icon: <img src={CustomerServiceIcon} alt="Customer Service" style={{ width: '56px', height: '56px' }} />, title: '24/7 Customer Support', description: 'Our team ensures smooth service and fast responses for every user.' }
  ];

  const faqs = [
    { question: 'What does Aurora offer?', answer: 'Aurora provides a range of digital gaming services, including: Valorant accounts, Fortnite accounts, Roblox accounts, and Account unban services.' },
    { question: 'How do I receive my account after purchasing from Aurora?', answer: 'Once your purchase is complete, Aurora will send the login details through the website and sent directly to your email selected. Delivery is typically fast, depending on order volume.' },
    { question: 'Are Aurora\'s accounts verified?', answer: 'Yes. All accounts listed on Aurora are checked and verified before being sold. However, customers are responsible for following each game\'s Terms of Service to avoid any future issues.' },
    { question: 'Does Aurora offer refunds?', answer: 'No. Aurora does not offer refunds. All sales are final due to the nature of digital products and services.' },
    { question: 'What if the account doesn\'t work when I receive it?', answer: 'If there is an issue immediately upon delivery, contact Aurora support right away. After verification, a replacement may be issued if eligible.' },
    { question: 'How long do unban services take?', answer: 'Timeframes vary depending on the game and the ban type. Some unbans may be resolved quickly, while others can take several days.' },
    { question: 'Can Aurora guarantee a successful unban?', answer: 'No. While Aurora uses proven methods, no unban service can guarantee 100% success. All service fees remain non-refundable.' },
    { question: 'How can I contact Aurora support?', answer: 'You can reach Aurora through Discord: Username i.nc0g' }
  ];

  const [activeFAQ, setActiveFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const handleProductClick = (product) => {
    if (product.has_variants) {
      setSelectedProduct(product);
      setShowVariantsModal(true);
    }
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div
          className="hero-image"
          style={{ backgroundImage: `url(${settings.hero_image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1920&h=600&fit=crop'})` }}
        >
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content">
          <h1>{settings.hero_heading || 'Unlock Premium Digital Services with AuroraServices'}</h1>
          <h2>{settings.hero_subheading || 'Your trusted platform for high-quality digital assets, game services, premium accounts, tools, and exclusive solutions.'}</h2>
          <p>{settings.hero_paragraph || 'AuroraServices is a leading online provider of secure, fast, and premium digital services.'}</p>
          <div className="cta-buttons">
            <button className="btn-primary" onClick={() => navigateTo('products')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Shop Now
            </button>
            <button className="btn-secondary" onClick={() => window.open(settings.discord_link || 'https://discord.gg/auroraaccounts', '_blank')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Discord
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Why Choose AuroraServices?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Trending Digital Services</h2>
        <p className="section-subtitle">
          Explore the latest and top-selling digital services hand-picked for quality and performance.
        </p>
        <div className="products-grid">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => handleProductClick(product)}
              onAddToCart={() => handleProductClick(product)}
            />
          ))}
        </div>
      </section>

      <ProductVariantsModal
        isOpen={showVariantsModal}
        onClose={() => setShowVariantsModal(false)}
        product={selectedProduct}
      />

      <section className="section" id="stats">
        <h2 className="section-title">Our Stats</h2>
        <p className="section-subtitle">Here are some of our stats that show how well we succeed</p>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.total_products}</div>
            <div className="stat-label">Products</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.total_customers}</div>
            <div className="stat-label">Happy Customers</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.avg_rating}</div>
            <div className="stat-label">Average Rating</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.total_reviews}</div>
            <div className="stat-label">Total Reviews</div>
          </div>
        </div>
      </section>

      <section className="section" id="about">
        <h2 className="section-title">About AuroraServices</h2>
        <p className="section-subtitle">
          AuroraServices provides a premium ecosystem of digital products supported by advanced automation
          and secure delivery systems. Every item we offer is tested for usability, reliability, and value.
        </p>
      </section>

      <section className="section" id="reviews">
        <div className="reviews-header">
          <h2 className="section-title">Customer Reviews</h2>
          <p className="section-subtitle">See what our customers have to say about our products!</p>
          <div className="reviews-rating">
            <span className="star">★</span>
            <span className="star">★</span>
            <span className="star">★</span>
            <span className="star">★</span>
            <span className="star">★</span>
            <span style={{ marginLeft: '8px', fontSize: '20px' }}>{stats.avg_rating} ({stats.total_reviews} reviews)</span>
          </div>
          <button
            className="btn-primary"
            onClick={() => setShowReviewModal(true)}
            style={{ marginTop: '24px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Leave a Review
          </button>
        </div>
        <div className="reviews-grid">
          {reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-stars">
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </div>
              <p className="review-text">"{review.comment}"</p>
              <div className="review-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {review.author}
                  {review.verified_purchase && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" title="Verified Purchase">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  )}
                </span>
                <span>{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="faq">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-container">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${activeFAQ === index ? 'active' : ''}`}
              onClick={() => toggleFAQ(index)}
            >
              <div className="faq-question">
                <span>{faq.question}</span>
                <span className="faq-icon">▼</span>
              </div>
              <div className="faq-answer">{faq.answer}</div>
            </div>
          ))}
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

export default HomePage;
