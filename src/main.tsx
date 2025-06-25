import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThirdwebProvider } from '@thirdweb-dev/react';

// MODIFICA: Cambiata la chain da "sepolia" a "moonbeam"
const activeChain = "moonbeam";
const container = document.getElementById('root');

if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <ThirdwebProvider
        activeChain={activeChain}
        clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID}
      >
        <App />
      </ThirdwebProvider>
    </React.StrictMode>
  );
}
