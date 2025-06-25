import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { TOTP } from "otpauth";

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

    const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; 

    if (!THIRDWEB_SECRET_KEY || !CONTRACT_ADDRESS) {
      console.error("Variabili d'ambiente THIRDWEB_SECRET_KEY o CONTRACT_ADDRESS non configurate!");
      return res.status(500).json({ error: "Configurazione del server errata." });
    }
    
    try {
        const { userWallet, nftId, secret } = req.body;
        
        if (!userWallet || !nftId || !secret) {
            return res.status(400).json({ error: 'Campi mancanti' });
        }

        const delta = totp.validate({ token: secret, window: 1 });
        if (delta === null) {
            return res.status(401).json({ error: 'Segreto non valido o scaduto.' });
        }
        
        const sdk = new ThirdwebSDK("moonbeam", {
          secretKey: THIRDWEB_SECRET_KEY,
        });
            
        const contract = await sdk.getContract(CONTRACT_ADDRESS);
        
        // SOLUZIONE: Cambiamo il nome della funzione da "safeMint" a "mint".
        // "mint" è l'altro nome standard per la funzione di minting.
        // 
        // IMPORTANTE: Se anche questo non funziona, devi trovare il nome esatto
        // della funzione di mint nel codice del tuo smart contract.
        const tx = await contract.call(
            "mint",     // <--- NOME DELLA FUNZIONE CAMBIATO
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
