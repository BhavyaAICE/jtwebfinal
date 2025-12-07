import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { openSellAuthCheckout } from '../lib/sellauth';
import Toast from './Toast';
import './ProductCard.css';

function ProductCard({ product, onClick, onAddToCart }) {
  const [adding, setAdding] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const { addToCart, user } = useCart();

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };
  const handleBuyNow = async (e) => {
    e.stopPropagation();

    const shopId = import.meta.env.VITE_SELLAUTH_SHOP_ID;

    if (!shopId || shopId === '0') {
      showToast('SellAuth is not configured. Please contact support.', 'error');
      return;
    }

    if (product.sellauth_product_id) {
      const variantId = product.sellauth_variant_id || null;
      await openSellAuthCheckout(shopId, product.sellauth_product_id, variantId, 1);
    } else {
      showToast('This product does not have a SellAuth product ID configured.', 'error');
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    if (!user) {
      showToast('Please log in to add items to cart', 'error');
      return;
    }

    if (!product.has_variants && product.stock === 0) {
      showToast('This product is currently out of stock.', 'error');
      return;
    }

    setAdding(true);
    const success = await addToCart(product.id, null, 1);
    setAdding(false);

    if (success) {
      showToast(`${product.name} added to cart!`, 'success');
    } else {
      showToast('Error adding to cart', 'error');
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(product);
    }
  };

  const isOutOfStock = !product.has_variants && product.stock === 0;

  const getProductImage = () => {
    if (imageFailed) {
      return 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400&h=300&fit=crop';
    }
    return product.image;
  };

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />
      <div className="product-card" onClick={handleClick}>
      <img
        key={imageFailed ? 'fallback' : 'primary'}
        src={getProductImage()}
        alt={product.name}
        className="product-image"
        onError={() => setImageFailed(true)}
      />
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        {product.has_variants ? (
          <p className="product-variants-badge">Multiple Options Available</p>
        ) : (
          <p className="product-stock">In Stock: {product.stock} units</p>
        )}
        <div className="product-pricing">
          <span className="product-price">Starting at ${product.sale_price?.toFixed(2)}</span>
          {product.price !== product.sale_price && (
            <span className="product-original-price">${product.price?.toFixed(2)}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="product-btn"
            onClick={product.has_variants ? handleClick : handleAddToCart}
            disabled={isOutOfStock || adding}
            style={isOutOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : { flex: 1 }}
          >
            {adding ? 'Adding...' : (isOutOfStock ? 'Out of Stock' : (product.has_variants ? 'View Options' : 'Add to Cart'))}
          </button>
          {!product.has_variants && (
            <button
              className="product-btn-buy"
              onClick={(e) => { e.stopPropagation(); handleBuyNow(e); }}
              disabled={isOutOfStock}
              style={isOutOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export default ProductCard;
