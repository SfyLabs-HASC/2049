import { TOTP } from "otpauth";

// Chiave segreta per la verifica. DEVE essere la stessa usata nel frontend.
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

    const ENGINE_URL = process.env.ENGINE_URL;
    const ENGINE_ACCESS_TOKEN = process.env.ENGINE_ACCESS_TOKEN;
    const ENGINE_BACKEND_WALLET_ADDRESS = process.env.ENGINE_BACKEND_WALLET_ADDRESS;
    const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS;

    if (!ENGINE_URL || !ENGINE_ACCESS_TOKEN || !ENGINE_BACKEND_WALLET_ADDRESS || !CONTRACT_ADDRESS) {
      console.error("Variabili d'ambiente di Engine non configurate!");
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
        
        // MODIFICA: Cambiata la chain da "sepolia" a "moonbeam"
        const response = await fetch(
            `${ENGINE_URL}/contract/moonbeam/${CONTRACT_ADDRESS}/erc721/mint-to`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${ENGINE_ACCESS_TOKEN}`,
                    "x-backend-wallet-address": ENGINE_BACKEND_WALLET_ADDRESS,
                },
                body: JSON.stringify({
                    receiver: userWallet,
                    metadata: {
                        name: `NFT #${nftId}`,
                        description: `NFT speciale mintato per ${userWallet}`,
                        image: "ipfs://...",
                    }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Errore da Thirdweb Engine:", data);
            throw new Error(data.error?.message || 'Errore durante la chiamata a Engine.');
        }

        return res.status(200).json({ 
            success: true, 
            transactionHash: data.result?.queueId || "Transazione accodata con successo" 
        });

    } catch (error: any) {
        console.error("Errore nell'API di mint:", error);
        return res.status(500).json({ error: error.message || 'Errore sconosciuto durante il minting.' });
    }
}
