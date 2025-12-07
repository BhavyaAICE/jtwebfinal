import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './Footer.css';

function Footer({ navigateTo }) {
  const [discordLink, setDiscordLink] = useState('https://discord.gg/auroraaccounts');

  useEffect(() => {
    loadDiscordLink();
  }, []);

  const loadDiscordLink = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'discord_link')
        .maybeSingle();

      if (data) {
        setDiscordLink(data.value);
      }
    } catch (error) {
      console.error('Error loading Discord link:', error);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Aurora</h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '8px' }}>
            Premium digital services
          </p>
          <div className="social-icons">
            <a href={discordLink} target="_blank" rel="noopener noreferrer" className="social-icon">
              D
            </a>
            <a href="#" className="social-icon">T</a>
            <a href="#" className="social-icon">F</a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Navigation</h3>
          <ul className="footer-links">
            <li><a onClick={() => navigateTo('home')}>Home</a></li>
            <li><a onClick={() => navigateTo('products')}>Products</a></li>
            <li><a onClick={() => navigateTo('reviews')}>Reviews</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Support</h3>
          <ul className="footer-links">
            <li><a href="#">Contact</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Aurora. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
