import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { openSellAuthCheckout } from '../lib/sellauth';
import Toast from './Toast';
import './ProductVariantsModal.css';

function ProductVariantsModal({ isOpen, onClose, product }) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(null);
  const [failedImages, setFailedImages] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const { addToCart, user } = useCart();

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  useEffect(() => {
    if (isOpen && product && product.has_variants) {
      loadVariants();
    }
  }, [isOpen, product]);

  const loadVariants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('parent_id', product.id)
        .order('sort_order');

      if (error) throw error;
      setVariants(data || []);
    } catch (error) {
      console.error('Error loading variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockIndicator = (stock) => {
    if (stock === 0) return 'out';
    if (stock < 5) return 'low';
    return 'high';
  };

  const getStockText = (stock) => {
    if (stock === 0) return 'Out of Stock';
    if (stock < 5) return `Only ${stock} left`;
    return 'In Stock';
  };

  const handleAddToCart = async (variant) => {
    if (!user) {
      showToast('Please log in to add items to cart', 'error');
      return;
    }

    if (variant.stock === 0) {
      showToast('This product is currently out of stock.', 'error');
      return;
    }

    setAddingToCart(variant.id);
    const success = await addToCart(product.id, variant.id, 1);
    setAddingToCart(null);

    if (success) {
      showToast(`${variant.name} added to cart!`, 'success');
    } else {
      showToast('Error adding to cart', 'error');
    }
  };

  const handleBuyNow = async (variant) => {
    const shopId = import.meta.env.VITE_SELLAUTH_SHOP_ID;

    if (!shopId || shopId === '0') {
      showToast('SellAuth is not configured. Please contact support.', 'error');
      return;
    }

    if (!variant.sellauth_product_id) {
      showToast('This variant does not have a SellAuth product ID configured.', 'error');
      return;
    }

    if (variant.stock === 0) {
      showToast('This product is currently out of stock.', 'error');
      return;
    }

    const variantId = variant.sellauth_variant_id || null;
    await openSellAuthCheckout(shopId, variant.sellauth_product_id, variantId, 1);
  };

  const handleImageError = (variantId) => {
    setFailedImages(prev => ({ ...prev, [variantId]: true }));
  };

  const getVariantImage = (variant) => {
    if (failedImages[variant.id]) {
      return 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400&h=380&fit=crop';
    }
    return variant.image || product.image;
  };

  if (!isOpen || !product) return null;

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />
      <div className="variants-modal active" onClick={onClose}>
        <div className="variants-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="variants-header">
          <h2>{product.name}</h2>
          <button className="variants-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="variants-list">
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.5)' }}>
              Loading products...
            </div>
          ) : variants.length > 0 ? (
            variants.map((variant) => (
              <div key={variant.id} className="variant-item">
                <img
                  key={`${variant.id}-${failedImages[variant.id] ? 'fallback' : 'primary'}`}
                  src={getVariantImage(variant)}
                  alt={variant.name}
                  className="variant-image"
                  onError={() => handleImageError(variant.id)}
                />
                <div className="variant-info">
                  <h3 className="variant-name">{variant.name}</h3>
                  <p className="variant-description">{variant.description}</p>
                  <div className="variant-footer">
                    <div>
                      <div className="variant-pricing">
                        <span className="variant-price">${variant.sale_price?.toFixed(2)}</span>
                        {variant.price !== variant.sale_price && (
                          <span className="variant-original-price">${variant.price?.toFixed(2)}</span>
                        )}
                      </div>
                      <div className="variant-stock">
                        <span className={`stock-indicator ${getStockIndicator(variant.stock)}`}></span>
                        <span>{getStockText(variant.stock)}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="variant-add-btn"
                        onClick={() => handleAddToCart(variant)}
                        disabled={variant.stock === 0 || addingToCart === variant.id}
                        style={{ flex: 1 }}
                      >
                        {addingToCart === variant.id ? 'Adding...' : (variant.stock === 0 ? 'Sold Out' : 'Add to Cart')}
                      </button>
                      <button
                        className="variant-buy-btn"
                        onClick={() => handleBuyNow(variant)}
                        disabled={variant.stock === 0}
                        style={{ flex: 1 }}
                      >
                        {variant.stock === 0 ? 'Sold Out' : 'Buy Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.5)' }}>
              No variants available
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export default ProductVariantsModal;
