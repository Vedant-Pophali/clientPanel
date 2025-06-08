import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';        // Import Bootstrap CSS once
import 'bootstrap/dist/js/bootstrap.bundle.min.js';   // Import Bootstrap JS bundle once
import 'bootstrap-icons/font/bootstrap-icons.css';    // Optional: Bootstrap icons
import { BrowserRouter } from 'react-router-dom';
import { StoreContextProvider } from './context/StoreContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <StoreContextProvider> 
        <App />
      </StoreContextProvider>
    </BrowserRouter>
  </StrictMode>
);
