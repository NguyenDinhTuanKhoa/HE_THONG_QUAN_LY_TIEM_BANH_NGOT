// main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import './styles/responsive.css';

// Context Providers
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/common/Toast';

// Main App Component
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <CartProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CartProvider>
    </ToastProvider>
  </StrictMode>
);
