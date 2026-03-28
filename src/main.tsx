import React from 'react';
import ReactDOM from 'react-dom/client';
import './lib/i18n'; // Initialize i18n before App
import './index.css';
import App from './App';

// Set initial direction based on i18n default (Hebrew = RTL)
document.documentElement.dir = 'rtl';
document.documentElement.lang = 'he';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
