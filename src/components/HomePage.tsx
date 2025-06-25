import { ConnectWallet, useAddress, useContract, useNFT, useTotalCount } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as string;

// Componente per visualizzare un singolo NFT
// Recupera i metadati usando l'ID dell'NFT
const NftCard = ({ tokenId }: { tokenId: number }) => {
  const { contract } = useContract(CONTRACT_ADDRESS);
  const { data: nft, isLoading, error } = useNFT(contract, tokenId);

  if (isLoading) return <li>Caricamento NFT #{tokenId}...</li>;
  if (error || !nft) return <li>Impossibile caricare NFT #{tokenId}</li>;

  return (
    <li key={nft.metadata.id}>
      <p><strong>Nome:</strong> {nft.metadata.name}</p>
      <p><strong>ID:</strong> {nft.metadata.id}</p>
    </li>
  );
};


export default function HomePage() {
  const address = useAddress();
  const { contract } = useContract(CONTRACT_ADDRESS);
  // SOLUZIONE: Non usiamo più useOwnedNFTs.
  // Prima, otteniamo il numero totale di NFT nel contratto.
  const { data: totalCount, isLoading: isLoadingTotalCount } = useTotalCount(contract);
  
  // Stato per salvare gli ID degli NFT dell'utente
  const [ownedTokenIds, setOwnedTokenIds] = useState<number[]>([]);
  const [isFetchingOwned, setIsFetchingOwned] = useState(false);

  // Questo useEffect si attiva quando l'utente si connette o il contratto è pronto.
  useEffect(() => {
    if (!address || !contract || totalCount === undefined) return;

    const fetchOwnedNfts = async () => {
      setIsFetchingOwned(true);
      const ownedIds = [];
      // Questo è il metodo manuale e robusto:
      // controlliamo ogni NFT, uno per uno, per vedere chi è il proprietario.
      for (let i = 0; i < totalCount.toNumber(); i++) {
        try {
          // SOLUZIONE: Usiamo contract.erc721.ownerOf() per accedere alla funzione corretta.
          const owner = await contract.erc721.ownerOf(i);
          if (owner.toLowerCase() === address.toLowerCase()) {
            ownedIds.push(i);
          }
        } catch (e) {
            console.error(`Impossibile controllare il proprietario del token ${i}`, e);
        }
      }
      setOwnedTokenIds(ownedIds);
      setIsFetchingOwned(false);
    };

    fetchOwnedNfts();
  }, [address, contract, totalCount]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const isLoading = isLoadingTotalCount || isFetchingOwned;

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
          
          {isLoading && <p>Caricamento dei tuoi NFT...</p>}

          {!isLoading && (
            <>
              {ownedTokenIds.length === 0 && <p>Non possiedi nessun NFT da questo contratto.</p>}
              {ownedTokenIds.length > 0 && (
                <div>
                  <p><strong>Numero di NFT:</strong> {ownedTokenIds.length}</p>
                  <ul>
                    {/* Per ogni ID trovato, renderizziamo un componente NftCard */}
                    {ownedTokenIds.map((tokenId) => (
                      <NftCard key={tokenId} tokenId={tokenId} />
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
