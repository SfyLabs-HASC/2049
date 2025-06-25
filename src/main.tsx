import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThirdwebProvider } from '@thirdweb-dev/react';
// NUOVO: Importiamo la definizione della chain Moonbeam
import { Moonbeam } from "@thirdweb-dev/chains";

// MODIFICA: Usiamo l'oggetto Moonbeam importato invece della stringa "moonbeam"
const activeChain = Moonbeam;
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
