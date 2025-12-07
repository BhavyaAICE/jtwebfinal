import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { initializeSellAuth, openSellAuthCheckout } from '../lib/sellauth';
import Toast from '../components/Toast';
import './CartPage.css';

function CartPage() {
  const { cartItems, user, removeFromCart, updateQuantity, getTotalPrice, clearCart, loading } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 5000);
  };

  const handleCheckout = async () => {
    if (!cartItems.length) {
      alert('Your cart is empty');
      return;
    }

    if (!user) {
      alert('Please log in to checkout');
      return;
    }

    const shopId = import.meta.env.VITE_SELLAUTH_SHOP_ID;
    if (!shopId || shopId === '0') {
      alert('SellAuth is not configured');
      return;
    }

    setIsCheckingOut(true);

    try {
      await initializeSellAuth();

      if (!window.sellAuthEmbed) {
        throw new Error('SellAuth embed not available');
      }

      const cart = cartItems
        .map(item => {
          const productId = item.variant?.sellauth_product_id || item.product?.sellauth_product_id;
          const variantId = item.variant?.sellauth_variant_id || null;

          if (!productId) return null;

          const cartItem = {
            productId: parseInt(productId),
            quantity: item.quantity
          };

          if (variantId) {
            cartItem.variantId = parseInt(variantId);
          }

          return cartItem;
        })
        .filter(Boolean);

      if (cart.length === 0) {
        alert('None of your cart items have SellAuth product IDs configured');
        setIsCheckingOut(false);
        return;
      }

      window.sellAuthEmbed.checkout({
        shopId: parseInt(shopId),
        cart: cart,
        modal: true
      });

      setTimeout(async () => {
        await clearCart();
        setIsCheckingOut(false);
        showToast('Order placed successfully! Thank you for your purchase. Please consider leaving a review!', 'success');
      }, 1000);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout is loading, please try again in a moment.');
      setIsCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="cart-container">
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255, 255, 255, 0.5)' }}>
          Loading cart...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <h2>Please Log In</h2>
          <p>You need to be logged in to view your cart</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />
      <div className="cart-container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <span className="cart-item-count">{cartItems.length} item(s)</span>
        </div>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <h2>Your cart is empty</h2>
          <p>Add some products to get started!</p>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.variant?.image || item.product?.image}
                  alt={item.variant?.name || item.product?.name}
                  className="cart-item-image"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400&h=300&fit=crop';
                  }}
                />
                <div className="cart-item-details">
                  <h3 className="cart-item-name">{item.product?.name}</h3>
                  {item.variant && <p className="cart-item-variant">{item.variant.name}</p>}
                  <p className="cart-item-price">
                    ${(item.variant?.sale_price || item.product?.sale_price)?.toFixed(2)}
                  </p>
                </div>
                <div className="cart-item-controls">
                  <div className="quantity-control">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="qty-display">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="cart-item-total">
                    ${((item.variant?.sale_price || item.product?.sale_price) * item.quantity).toFixed(2)}
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-section">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax:</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
            </div>

            <div className="checkout-actions">
              <button
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={isCheckingOut || cartItems.length === 0}
              >
                {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
              </button>
              <button
                className="continue-shopping-btn"
                onClick={() => window.location.href = '/products'}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </>
      )}
      </div>
    </>
  );
}

export default CartPage;
