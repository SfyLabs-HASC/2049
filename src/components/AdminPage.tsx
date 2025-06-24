// ==========================================
// File: src/components/AdminPage.tsx
// ==========================================
import React, { useState } from 'react';
import QrCode from './QrCode';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // --- Stati per il form di mint ---
  const [userWallet, setUserWallet] = useState('');
  const [nftId, setNftId] = useState('');
  const [secret, setSecret] = useState('');
  const [mintingStatus, setMintingStatus] = useState('');


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'password') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Credenziali non valide.');
    }
  };
  
  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setMintingStatus('Minting in corso...');

    try {
      const response = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userWallet,
          nftId,
          secret,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMintingStatus(`Successo! Transazione: ${data.transactionHash}`);
      } else {
        throw new Error(data.error || 'Errore sconosciuto');
      }
    } catch (err: any) {
      setMintingStatus(`Errore: ${err.message}`);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="container">
        <div className="card">
          <h2>Accesso Area Admin</h2>
          <form onSubmit={handleLogin}>
            <input type="text" placeholder="Login" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Entra</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Pannello Amministratore</h2>
        <p>Questo QR code genera un segreto valido per 60 secondi.</p>
        <QrCode />
      </div>
      <div className="card">
        <h3>Test Mint con Wallet Backend</h3>
        <form onSubmit={handleMint}>
            <input type="text" placeholder="Wallet utente destinatario" value={userWallet} onChange={(e) => setUserWallet(e.target.value)} required />
            <input type="text" placeholder="ID del nuovo NFT" value={nftId} onChange={(e) => setNftId(e.target.value)} required />
            <input type="text" placeholder="Segreto dal QR code" value={secret} onChange={(e) => setSecret(e.target.value)} required />
            <button type="submit">Esegui Mint</button>
        </form>
        {mintingStatus && <p><strong>Stato:</strong> {mintingStatus}</p>}
      </div>
    </div>
  );
}