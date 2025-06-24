// src/main.jsx (o .tsx)

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThirdwebProvider } from '@thirdweb-dev/react';

// Sostituisci "sepolia" con il nome della chain dove è deployato il tuo contratto (es. "ethereum", "polygon").
// Puoi trovare la lista qui: https://thirdweb.com/chainlist
const activeChain = "sepolia"; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThirdwebProvider
      activeChain={activeChain}
      // Per progetti in produzione, ottieni una clientId gratuita dalla dashboard di Thirdweb
      // e inseriscila qui per evitare limitazioni sugli RPC.
      // clientId="LA_TUA_CLIENT_ID" 
    >
      <App />
    </ThirdwebProvider>
  </React.StrictMode>
);