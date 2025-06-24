// src/main.jsx (o .tsx)

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThirdwebProvider } from '@thirdweb-dev/react';

const activeChain = "sepolia";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThirdwebProvider
      activeChain={activeChain}
      // Leggiamo la Client ID dalle variabili d'ambiente
      clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID}
    >
      <App />
    </ThirdwebProvider>
  </React.StrictMode>
);