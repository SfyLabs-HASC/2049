// src/App.jsx (o .tsx)

import { ConnectWallet, useAddress, useContract, useContractRead, Web3Button } from "@thirdweb-dev/react";
import "./App.css";

// Leggiamo l'indirizzo del contratto dalle variabili d'ambiente
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// ... tutto il resto del codice del componente rimane identico ...

export default function App() {
  const connectedAddress = useAddress();
  const { contract } = useContract(CONTRACT_ADDRESS);

  const { data: tokenName, isLoading: isLoadingName } = useContractRead(contract, "name");
  // ... ecc ...
  
  // Il resto del codice non cambia
}