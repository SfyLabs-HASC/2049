import { ConnectWallet, useAddress, useContract, useOwnedNFTs } from "@thirdweb-dev/react";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as string;

// Funzione helper per gestire in modo sicuro l'errore di tipo 'unknown'
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "Si è verificato un errore sconosciuto nel caricamento degli NFT.";
};

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
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* QUESTA È LA SOLUZIONE DEFINITIVA: 
              Usiamo la funzione helper per mostrare il messaggio di errore in modo sicuro. 
          */}
          {error && <p style={{color: 'red'}}>Errore: {getErrorMessage(error)}</p>}
        </div>
      ) : (
        <div className="card">
          <p>Effettua il login con il tuo wallet per visualizzare i tuoi asset.</p>
        </div>
      )}
    </main>
  );
}
