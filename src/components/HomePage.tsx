import { ConnectWallet, useAddress, useContract, useNFT } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as string;

// Definiamo un'interfaccia per i nostri dati
interface OwnedNft {
  id: number;
  quantity: number;
}

// Componente per visualizzare un singolo tipo di NFT e la sua quantità
const NftCard = ({ nftData }: { nftData: OwnedNft }) => {
  const { contract } = useContract(CONTRACT_ADDRESS);
  // Usiamo l'hook useNFT per ottenere i metadati (nome, immagine) del tipo di token
  const { data: nftMetadata, isLoading } = useNFT(contract, nftData.id);

  if (isLoading) return <li>Caricamento metadati per NFT #{nftData.id}...</li>;

  return (
    <li>
      <p><strong>Nome:</strong> {nftMetadata?.metadata.name || `Token #${nftData.id}`}</p>
      <p><strong>ID Tipo:</strong> {nftData.id}</p>
      <p><strong>Quantità posseduta:</strong> {nftData.quantity}</p>
    </li>
  );
};


export default function HomePage() {
  const address = useAddress();
  const { contract } = useContract(CONTRACT_ADDRESS);

  // Stato per salvare gli NFT che l'utente possiede
  const [ownedNfts, setOwnedNfts] = useState<OwnedNft[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Questo useEffect si attiva quando l'utente si connette o il contratto è pronto.
  useEffect(() => {
    // Lista degli ID dei TIPI di token che vogliamo controllare.
    // Dovrai aggiornare questa lista se aggiungi nuovi tipi di NFT.
    const TOKEN_IDS_TO_CHECK = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; 

    if (!address || !contract) {
      setOwnedNfts([]); // Pulisce la lista se l'utente si disconnette
      return;
    }

    const fetchOwnedBalances = async () => {
      setIsLoading(true);
      try {
        // Creiamo una lista di "promesse", una per ogni chiamata al contratto
        const balancePromises = TOKEN_IDS_TO_CHECK.map(tokenId => 
          contract.erc1155.balanceOf(address, tokenId)
        );
        
        // Eseguiamo tutte le chiamate in parallelo per essere più veloci
        const balances = await Promise.all(balancePromises);

        const owned = [];
        for (let i = 0; i < TOKEN_IDS_TO_CHECK.length; i++) {
          const balance = balances[i];
          // Se il saldo è maggiore di zero, l'utente possiede questo tipo di NFT
          if (balance.gt(0)) {
            owned.push({
              id: TOKEN_IDS_TO_CHECK[i],
              quantity: balance.toNumber(),
            });
          }
        }
        setOwnedNfts(owned);
      } catch (e) {
        console.error("Impossibile recuperare i saldi degli NFT", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwnedBalances();
  }, [address, contract]);

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
          
          {isLoading && <p>Caricamento dei tuoi NFT...</p>}

          {!isLoading && (
            <>
              {ownedNfts.length === 0 && <p>Non possiedi nessun NFT da questo contratto.</p>}
              {ownedNfts.length > 0 && (
                <div>
                  <ul>
                    {ownedNfts.map((nftData) => (
                      <NftCard key={nftData.id} nftData={nftData} />
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
