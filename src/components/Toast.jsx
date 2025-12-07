import './Toast.css';

function Toast({ message, type = 'success', show, onClose }) {
  return (
    <div className={`custom-toast ${show ? 'show' : ''} ${type}`}>
      <div className="toast-icon">
        {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ⓘ'}
      </div>
      <div className="toast-content">
        <div className="toast-title">
          {type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info'}
        </div>
        <div className="toast-message">{message}</div>
      </div>
      <button className="toast-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

export default Toast;
