import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ClerkProvider } from '@clerk/clerk-react'
import { esES } from '@clerk/localizations'
import App from './App.jsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_Zmx5aW5nLXR1bmEtNzAuY2xlcmsuYWNjb3VudHMuZGV2JA";

if (!PUBLISHABLE_KEY) {
  console.error("Missing Clerk Publishable Key - Authentication may not work");
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} localization={esES}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkProvider>
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
