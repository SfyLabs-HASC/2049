// ==========================================
// File: src/main.tsx
// Copia e incolla tutto il codice seguente
// nel tuo file `src/main.tsx`.
// ==========================================
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThirdwebProvider } from '@thirdweb-dev/react';

const activeChain = "sepolia";

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
} else {
  console.error("Elemento 'root' non trovato nel DOM. Il mounting dell'app React è fallito.");
}