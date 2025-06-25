import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { TOTP } from "otpauth";

// Chiave segreta per la verifica TOTP. DEVE essere la stessa usata nel frontend.
const OTP_SECRET = 'KVKFKJSXMusicSceneKVKFKJSXMusicScene';

let totp = new TOTP({
  issuer: '2049App',
  label: 'Admin',
  algorithm: 'SHA1',
  digits: 6,
  period: 60,
  secret: OTP_SECRET,
});

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Prendiamo le credenziali necessarie dalle variabili d'ambiente di Vercel
    const BACKEND_WALLET_PRIVATE_KEY = process.env.BACKEND_WALLET_PRIVATE_KEY;
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; 

    if (!BACKEND_WALLET_PRIVATE_KEY || !CONTRACT_ADDRESS) {
      console.error("Variabili d'ambiente BACKEND_WALLET_PRIVATE_KEY o CONTRACT_ADDRESS non configurate!");
      return res.status(500).json({ error: "Configurazione del server errata." });
    }
    
    try {
        const { userWallet, nftId, secret } = req.body;
        
        if (!userWallet || !nftId || !secret) {
            return res.status(400).json({ error: 'Campi mancanti' });
        }

        // 1. Verifica il segreto TOTP
        const delta = totp.validate({ token: secret, window: 1 });
        if (delta === null) {
            return res.status(401).json({ error: 'Segreto non valido o scaduto.' });
        }
        
        // SOLUZIONE FINALE: Inizializziamo l'SDK direttamente dalla chiave privata.
        // Questo crea un "signer" che può approvare transazioni in modo diretto e affidabile.
        const sdk = ThirdwebSDK.fromPrivateKey(
          BACKEND_WALLET_PRIVATE_KEY,
          "moonbeam"
        );
            
        const contract = await sdk.getContract(CONTRACT_ADDRESS);
        
        // 3. Esegui il mint chiamando direttamente la funzione del tuo contratto
        const tx = await contract.call(
            "mint",     // Assicurati che il nome della funzione sia corretto
            [
                userWallet, // L'indirizzo a cui mintare (to)
                nftId       // L'ID del token da mintare (tokenId)
            ]
        );
        
        const receipt = tx.receipt; 
        
        return res.status(200).json({ success: true, transactionHash: receipt.transactionHash });

    } catch (error: any) {
        console.error("Errore nell'API di mint:", error);
        return res.status(500).json({ error: error.message || 'Errore sconosciuto durante il minting.' });
    }
}
