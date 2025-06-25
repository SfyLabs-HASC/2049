import { ConnectWallet, useAddress, useContract, useOwnedNFTs } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as string;

export default function HomePage() {
  const address = useAddress();
  const { contract } = useContract(CONTRACT_ADDRESS);
  const { data: nfts, isLoading, error } = useOwnedNFTs(contract, address);

  const [displayError, setDisplayError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      console.error("Errore catturato dal hook useOwnedNFTs:", error);
      setDisplayError("Si è verificato un errore nel caricamento degli NFT. Controlla la console per i dettagli.");
    } else {
        setDisplayError(null);
    }
  }, [error]);

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

          {displayError && <p style={{ color: 'red' }}>{displayError}</p>}

          {!isLoading && !displayError && (
            <>
              {nfts && nfts.length === 0 && <p>Non possiedi nessun NFT da questo contratto.</p>}
              {nfts && nfts.length > 0 && (
                <div>
                  <p><strong>Numero di NFT:</strong> {nfts.length}</p>
                  <ul>
                    {nfts.map((nft) => (
                      <li key={nft.metadata.id.toString()}>
                        <p><strong>Nome:</strong> {nft.metadata.name}</p>
                        <p><strong>ID:</strong> {nft.metadata.id.toString()}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="card">
          <p>Effettua il login con il tuo wallet per visualizzare i tuoi asset.</p>
        </div>
      )}
    </main>
  );
}
