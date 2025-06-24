// ==========================================
// File: src/App.tsx
// Copia e incolla tutto il codice seguente
// nel tuo file `src/App.tsx`.
// ==========================================
import { ConnectWallet, useAddress, useContract, useContractRead, Web3Button } from "@thirdweb-dev/react";
import "./App.css";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as string;

export default function App() {
  const connectedAddress = useAddress();
  const { contract } = useContract(CONTRACT_ADDRESS);

  const { data: tokenName, isLoading: isLoadingName } = useContractRead(contract, "name");
  const { data: tokenSymbol, isLoading: isLoadingSymbol } = useContractRead(contract, "symbol");
  const { data: tokenBalance, isLoading: isLoadingBalance } = useContractRead(
    contract, 
    "balanceOf", 
    [connectedAddress]
  );

  return (
    <main className="container">
      <div className="header">
        <h1>RewardToken (RDT) DApp</h1>
        <ConnectWallet
          theme="dark"
          btnTitle="Connetti Wallet"
        />
      </div>

      <div className="card">
        <h2>Dati del Token (da Sepolia)</h2>
        <p>
          <strong>Nome:</strong> {isLoadingName ? "Caricamento..." : tokenName}
        </p>
        <p>
          <strong>Simbolo:</strong> {isLoadingSymbol ? "Caricamento..." : tokenSymbol}
        </p>
        <hr />
        <h3>Il Tuo Saldo</h3>
        {connectedAddress ? (
          <p>
            <strong>Saldo RDT:</strong> {isLoadingBalance ? "Caricamento..." : `${tokenBalance?.displayValue || '0'} ${tokenSymbol || ''}`}
          </p>
        ) : (
          <p>Connetti il wallet per vedere il tuo saldo.</p>
        )}
      </div>

      <div className="card">
        <h2>Richiedi Token</h2>
        <p>Clicca per ricevere 10 token RDT gratuiti sul tuo wallet (funzione `claimTo`).</p>
        
        <Web3Button
          contractAddress={CONTRACT_ADDRESS}
          action={(contract) => {
            const quantity = "10"; 
            return contract.call("claimTo", [connectedAddress, quantity]);
          }}
          isDisabled={!connectedAddress}
          onSuccess={() => {
            // Non usare alert(), potrebbe non funzionare in tutti gli ambienti
            console.log("10 RDT richiesti con successo!");
          }}
          onError={(error) => {
            console.error("Qualcosa è andato storto:", error.message);
          }}
        >
          Richiedi 10 RDT
        </Web3Button>
      </div>
    </main>
  );
}