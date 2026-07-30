import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)

// Remove initial loader smoothly after mount
const initialLoader = document.getElementById('initial-loader');
if (initialLoader) {
  setTimeout(() => {
    initialLoader.style.opacity = '0';
    setTimeout(() => {
      initialLoader.remove();
    }, 500); // Wait for transition
  }, 100); // Small delay to ensure React has painted
}
