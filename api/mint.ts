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
    const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;
    const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS;

    if (!THIRDWEB_SECRET_KEY || !CONTRACT_ADDRESS) {
      console.error("Variabili d'ambiente THIRDWEB_SECRET_KEY o VITE_CONTRACT_ADDRESS non configurate!");
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
        
        // 2. Inizializza l'SDK con il metodo corretto `fromSecretKey`.
        // Questo metodo si autentica con il servizio Vault e userà automaticamente
        // il wallet corretto per la chain specificata ("moonbeam").
        const sdk = ThirdwebSDK.fromSecretKey(
            THIRDWEB_SECRET_KEY, 
            {
              // Specifichiamo la chain qui come opzione
              chain: "moonbeam",
            }
        );
            
        const contract = await sdk.getContract(CONTRACT_ADDRESS);
        
        // 3. Esegui il mint dell'NFT
        // Il Vault firmerà questa transazione con il wallet 0x4dc...
        const metadata = {
            name: `NFT #${nftId}`,
            description: `NFT speciale mintato per ${userWallet}`,
            image: "ipfs://...", // Sostituisci con un hash IPFS valido
        };

        const tx = await contract.erc721.mintTo(userWallet, metadata);
        
        const receipt = tx.receipt; 
        
        // 4. Invia la risposta di successo
        return res.status(200).json({ success: true, transactionHash: receipt.transactionHash });

    } catch (error: any) {
        console.error("Errore nell'API di mint:", error);
        return res.status(500).json({ error: error.message || 'Errore sconosciuto durante il minting.' });
    }
}
