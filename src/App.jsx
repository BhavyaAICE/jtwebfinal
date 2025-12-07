import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { initializeSellAuth } from './lib/sellauth';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ReviewsPage from './pages/ReviewsPage';
import CartPage from './pages/CartPage';
import LoginModal from './components/LoginModal';
import AdminDashboard from './pages/AdminDashboard';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    createSnowParticles();
    initializeSellAuth();
  }, []);

  const createSnowParticles = () => {
    const snowContainer = document.querySelector('.snow-particles');
    if (!snowContainer) return;

    for (let i = 0; i < 80; i++) {
      const snow = document.createElement('div');
      snow.className = 'snow-particle';
      snow.style.left = Math.random() * 100 + '%';
      snow.style.animationDuration = (Math.random() * 12 + 18) + 's';
      snow.style.animationDelay = Math.random() * 8 + 's';
      snow.style.opacity = Math.random() * 0.7 + 0.3;
      snow.style.width = snow.style.height = (Math.random() * 3 + 3) + 'px';
      snowContainer.appendChild(snow);
    }
  };

  const navigateTo = (page) => {
    if (page === 'login') {
      setShowLoginModal(true);
    } else {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage navigateTo={navigateTo} />;
      case 'products':
        return <ProductsPage />;
      case 'reviews':
        return <ReviewsPage />;
      case 'cart':
        return <CartPage />;
      case 'admin':
        return <AdminDashboard navigateTo={navigateTo} />;
      default:
        return <HomePage navigateTo={navigateTo} />;
    }
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="app">
        <div className="snow-particles"></div>
        <div className="aurora-bg">
          <div className="aurora-particle"></div>
          <div className="aurora-particle"></div>
          <div className="aurora-particle"></div>
          <div className="aurora-particle"></div>
        </div>

        <Navbar navigateTo={navigateTo} currentPage={currentPage} />

        <div className="main-content">
          {renderPage()}
        </div>

        <Footer navigateTo={navigateTo} />

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          navigateTo={navigateTo}
        />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
