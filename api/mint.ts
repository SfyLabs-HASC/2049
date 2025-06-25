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
        
        // SOLUZIONE: Non usiamo più la scorciatoia .erc721.mintTo.
        // Usiamo il metodo generico .call() per chiamare direttamente la funzione
        // 'safeMint' del tuo contratto.
        // NOTA: Se la funzione di mint del tuo contratto ha un nome diverso (es. "mint"),
        // devi cambiarlo qui.
        const tx = await contract.call(
            "safeMint",     // <--- NOME DELLA FUNZIONE DI MINT DEL TUO CONTRATTO
            [
                userWallet, // L'indirizzo a cui mintare (to)
                nftId       // L'ID del token da mintare (tokenId)
            ]
        );
        
        const receipt = tx.receipt; 
        
        return res.status(200).json({ success: true, transactionHash: receipt.transactionHash });

    } catch (error: any) {
        console.error("Errore nell'API di mint:", error);
        // Inoltriamo il messaggio di errore specifico dal SDK/contratto
        return res.status(500).json({ error: error.message || 'Errore sconosciuto durante il minting.' });
    }
}
