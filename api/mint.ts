import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { TOTP } from "otpauth";

// Chiave segreta per la verifica TOTP.
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
    const THIRDWEB_API_KEY = process.env.THIRDWEB_API_KEY;

    if (!BACKEND_WALLET_PRIVATE_KEY || !CONTRACT_ADDRESS || !THIRDWEB_API_KEY) {
      console.error("Una o più variabili d'ambiente (PRIVATE_KEY, CONTRACT_ADDRESS, API_KEY) non sono configurate!");
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
        
        // SOLUZIONE FINALE: Usiamo l'RPC dedicato di Thirdweb per Moonbeam
        const rpcUrl = `https://1284.rpc.thirdweb.com/${THIRDWEB_API_KEY}`;
        
        const sdk = ThirdwebSDK.fromPrivateKey(
          BACKEND_WALLET_PRIVATE_KEY,
          rpcUrl
        );
            
        const contract = await sdk.getContract(CONTRACT_ADDRESS);
        
        const tx = await contract.call(
            "mint",
            [
                userWallet,
                nftId
            ]
        );
        
        const receipt = tx.receipt; 
        
        return res.status(200).json({ success: true, transactionHash: receipt.transactionHash });

    } catch (error: any) {
        console.error("ERRORE DETTAGLIATO NELL'API DI MINT:", JSON.stringify(error, null, 2));
        return res.status(500).json({ error: error.message || 'Errore sconosciuto durante il minting.' });
    }
}
