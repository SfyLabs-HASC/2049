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

    const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
    // Indirizzo del tuo wallet specifico nel Vault, che firmerà la transazione
    const BACKEND_WALLET_ADDRESS = "0x4dc45a01E146756D9D9809F93179D66BA8e03D62";

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
        
        // FASE 1: Inizializziamo l'SDK in modalità amministrativa con la Secret Key.
        const sdk = new ThirdwebSDK("moonbeam", {
          secretKey: THIRDWEB_SECRET_KEY,
        });
            
        // FASE 2: Otteniamo l'oggetto "signer" per il nostro wallet backend specifico.
        // Questo è il passaggio cruciale che mancava.
        const signer = await sdk.getSigner({
            walletAddress: BACKEND_WALLET_ADDRESS,
            // Inserisci qui l'ID della tua istanza Engine se applicabile.
            // Se non usi Engine, puoi omettere questa riga.
            // engineInstanceId: "YOUR_ENGINE_INSTANCE_ID",
        });

        // Se lo signer non viene trovato, l'SDK lancerà un errore che verrà catturato sotto.
        if (!signer) {
            throw new Error("Impossibile ottenere lo signer per il wallet backend.");
        }

        // FASE 3: Colleghiamo l'SDK a questo signer per renderlo "scrivibile".
        sdk.updateSigner(signer);
            
        const contract = await sdk.getContract(CONTRACT_ADDRESS);
        
        // FASE 4: Eseguiamo il mint. Ora l'SDK ha un signer e sa chi deve firmare.
        const tx = await contract.call(
            "mint",
            [userWallet, nftId]
        );
        
        const receipt = tx.receipt; 
        
        return res.status(200).json({ success: true, transactionHash: receipt.transactionHash });

    } catch (error: any) {
        console.error("Errore nell'API di mint:", error);
        return res.status(500).json({ error: error.message || 'Errore sconosciuto durante il minting.' });
    }
}
