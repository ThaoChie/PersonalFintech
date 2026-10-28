import React from 'react';
import ReactDOM from 'react-dom/client';

// 1. Bootstrap Core CSS
import 'bootstrap/dist/css/bootstrap.min.css';
// 2. FontAwesome Icons
import '@fortawesome/fontawesome-free/css/all.min.css';
// 3. Global Custom Styles
import './index.css';

import App from './App.jsx';

// =========================================================
// ENTRY POINT (main.jsx)
// Trách nhiệm: Mount App vào root DOM
// =========================================================
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
