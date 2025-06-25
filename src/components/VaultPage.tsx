import { useState, useEffect } from 'react';

export default function VaultPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Funzione per recuperare l'indirizzo dal nostro nuovo endpoint API
    const fetchBackendWalletAddress = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/get-wallet-address');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Errore nel recupero dell\'indirizzo.');
        }

        setWalletAddress(data.address);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBackendWalletAddress();
  }, []); // L'array vuoto assicura che venga eseguito solo una volta

  return (
    <main className="container">
      <div className="card">
        <h2>Indirizzo Wallet Backend</h2>
        <p>
          Questo è l'indirizzo pubblico del wallet gestito da Thirdweb Engine.
          È l'indirizzo che deve essere autorizzato sul tuo smart contract
          per eseguire le operazioni di mint.
        </p>
        <div style={{ 
          background: '#111', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginTop: '1rem',
          fontFamily: 'monospace',
          wordWrap: 'break-word'
        }}>
          {isLoading && <p>Recupero indirizzo in corso...</p>}
          {error && <p style={{ color: 'red' }}>Errore: {error}</p>}
          {walletAddress && <p>{walletAddress}</p>}
        </div>
      </div>
    </main>
  );
}