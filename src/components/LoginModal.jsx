import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import './LoginModal.css';

function LoginModal({ isOpen, onClose, navigateTo }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const { user, isAdmin, handleLoginSuccess } = useAuth();

  useEffect(() => {
    if (user) {
      onClose();
      if (isAdmin) {
        navigateTo('admin');
      }
    }
  }, [user, isAdmin, onClose, navigateTo]);

  useEffect(() => {
    if (!isOpen) {
      setStep('email');
      setEmail('');
      setOtp(['', '', '', '', '', '']);
      setMessage('');
      setLoading(false);
    }
  }, [isOpen]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!email) {
        throw new Error('Please enter your email address');
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      setMessageType('success');
      setMessage('A 6-digit code has been sent to your email!');
      setStep('otp');
    } catch (error) {
      setMessageType('error');
      setMessage(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const otpCode = otp.join('');

      if (otpCode.length !== 6) {
        throw new Error('Please enter the complete 6-digit code');
      }

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email',
      });

      if (error) throw error;

      if (data.user) {
        const session = await supabase.auth.getSession();
        if (session.data.session) {
          const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user-profile`;
          await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.data.session.access_token}`,
              'Content-Type': 'application/json',
            },
          });
        }

        setMessageType('success');
        setMessage('Successfully logged in!');

        handleLoginSuccess();

        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (error) {
      setMessageType('error');
      setMessage(error.message || 'Invalid code. Please try again.');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp(['', '', '', '', '', '']);
    setMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal-close" onClick={onClose}>
          &times;
        </button>

        <div className="login-modal-header">
          <h1>Log in to Your Customer Account</h1>
          {step === 'email' ? (
            <p>We'll send you a one-time password to this email address.</p>
          ) : (
            <p>A 6-digit code has been sent to {email}</p>
          )}
        </div>

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="login-modal-form">
            <div className="form-group">
              <label className="form-label">E-mail Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                required
                autoFocus
                disabled={loading}
              />
            </div>

            {message && (
              <div className={`message message-${messageType}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary full-width"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Sending code...
                </>
              ) : (
                <>
                  Continue
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="login-modal-form">
            <div className="form-group">
              <label className="form-label">One Time Password</label>
              <div className="otp-inputs">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="1"
                    className="otp-input"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    disabled={loading}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            {message && (
              <div className={`message message-${messageType}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary full-width"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Verifying...
                </>
              ) : (
                <>
                  Log In
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBackToEmail}
              className="btn-back"
              disabled={loading}
            >
              Back to email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginModal;
