let sellAuthLoadPromise = null;

export const initializeSellAuth = () => {
  if (typeof window === 'undefined') return Promise.resolve();

  if (window.sellAuthEmbed) {
    return Promise.resolve();
  }

  if (sellAuthLoadPromise) {
    return sellAuthLoadPromise;
  }

  sellAuthLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src*="sellauth.com"]');

    if (existingScript) {
      const checkInterval = setInterval(() => {
        if (window.sellAuthEmbed) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.sellAuthEmbed) {
          reject(new Error('SellAuth script timeout'));
        }
      }, 10000);
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.sellauth.com/assets/js/embed-2.js';
      script.async = true;

      script.onload = () => {
        const checkInterval = setInterval(() => {
          if (window.sellAuthEmbed) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkInterval);
          if (!window.sellAuthEmbed) {
            reject(new Error('SellAuth embed not initialized'));
          }
        }, 5000);
      };

      script.onerror = () => {
        reject(new Error('Failed to load SellAuth script'));
      };

      document.head.appendChild(script);
    }
  });

  return sellAuthLoadPromise;
};

export const openSellAuthCheckout = async (shopId, productId, variantId = null, quantity = 1) => {
  try {
    await initializeSellAuth();

    if (!window.sellAuthEmbed) {
      throw new Error('SellAuth embed not available');
    }

    // Build cart and validate
    const cart = [{
      productId: Number(productId),
      quantity: Number(quantity)
    }];

    if (variantId) {
      cart[0].variantId = Number(variantId);
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      throw new Error('Invalid cart for SellAuth checkout');
    }

    console.debug('Opening SellAuth checkout with:', { shopId, cart });

    // IMPORTANT: pass `null` (or element) as first arg, options object as second
    const response = await window.sellAuthEmbed.checkout(
      null,
      {
        shopId: Number(shopId),
        cart,
        modal: false // or true if you prefer modal iframe
      }
    );

    // response may be undefined depending on embed behavior; log for debugging
    console.debug('SellAuth checkout response:', response);
    return response;
  } catch (error) {
    console.error('Error opening SellAuth checkout:', error);

    // Optional fallback: open a known checkout token (replace with a real token if you have one)
    // Comment out the next two lines if you DO NOT want a fallback.
    console.warn('Falling back to direct checkout URL:', fallbackTokenUrl);
    window.open(fallbackTokenUrl, '_blank', 'noopener');

    // Keep the user-friendly alert (optional)
    alert('Checkout is loading, please try again in a moment.');

    // Re-throw or return null depending on how you want callers to react
    return null;
  }
};
