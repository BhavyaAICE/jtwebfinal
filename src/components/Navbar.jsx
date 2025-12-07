import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import CartIcon from '../assets/cart-large-2-svgrepo-com.svg';
import LogoImage from '../assets/image.png';
import './Navbar.css';

function Navbar({ navigateTo, currentPage }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const { getTotalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigateTo('home');
    setMobileMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="logo" onClick={() => navigateTo('home')}>
          <img src={LogoImage} alt="Aurora Logo" className="logo-image" />
          <span className="logo-text">urora</span>
        </div>

        <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <li>
            <a onClick={() => { navigateTo('home'); setMobileMenuOpen(false); }}>
              Home
            </a>
          </li>
          <li>
            <a onClick={() => { navigateTo('products'); setMobileMenuOpen(false); }}>
              Products
            </a>
          </li>
          <li>
            <a onClick={() => { navigateTo('reviews'); setMobileMenuOpen(false); }}>
              Reviews
            </a>
          </li>
        </ul>

        <div className={`nav-actions ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <button className="nav-btn cart-btn" onClick={() => { navigateTo('cart'); setMobileMenuOpen(false); }}>
            <img src={CartIcon} alt="Cart" className="cart-icon" />
            {getTotalItems() > 0 && <span className="cart-badge">{getTotalItems()}</span>}
          </button>
          {user ? (
            <>
              {isAdmin && (
                <button className="nav-btn" onClick={() => { navigateTo('admin'); setMobileMenuOpen(false); }}>
                  Admin Panel
                </button>
              )}
              <button className="nav-btn nav-btn-outline" onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <button className="nav-btn" onClick={() => { navigateTo('login'); setMobileMenuOpen(false); }}>
              Login
            </button>
          )}
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
