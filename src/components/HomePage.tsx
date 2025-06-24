// ==========================================
// File: src/components/HomePage.tsx
// ==========================================
import { ConnectWallet, useAddress, useContract, useOwnedNFTs } from "@thirdweb-dev/react";
import React from "react";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as string;

export default function HomePage() {
  const address = useAddress();
  const { contract } = useContract(CONTRACT_ADDRESS);
  const { data: nfts, isLoading, error } = useOwnedNFTs(contract, address);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <main className="container">
      <div className="header">
        <h1>Benvenuto Utente</h1>
        <ConnectWallet theme="dark" btnTitle="Login con Wallet" />
      </div>

      <button onClick={handleRefresh} style={{ margin: '1rem 0' }}>Refresh Dati</button>

      {address ? (
        <div className="card">
          <h2>Le Tue Informazioni</h2>
          <p><strong>Wallet Connesso:</strong> {address}</p>
          <h3>I Tuoi NFT</h3>
          {isLoading && <p>Caricamento NFT...</p>}
          {!isLoading && nfts && nfts.length === 0 && <p>Non possiedi nessun NFT da questo contratto.</p>}
          {!isLoading && nfts && nfts.length > 0 && (
            <div>
              <p><strong>Numero di NFT:</strong> {nfts.length}</p>
              <ul>
                {nfts.map((nft) => (
                  <li key={nft.metadata.id.toString()}>
                    <p><strong>Nome:</strong> {nft.metadata.name}</p>
                    <p><strong>ID:</strong> {nft.metadata.id.toString()}</p>
                    {/* Aggiungi qui altri metadati se presenti */}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {error && <p style={{color: 'red'}}>Errore nel caricamento degli NFT.</p>}
        </div>
      ) : (
        <div className="card">
          <p>Effettua il login con il tuo wallet per visualizzare i tuoi asset.</p>
        </div>
      )}
    </main>
  );
}