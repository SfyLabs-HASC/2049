// ==========================================
// FILE: api/mint.ts
// ==========================================
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { TOTP } from "otpauth";
import type { NextApiRequest, NextApiResponse } from 'next';

const OTP_SECRET = 'KVKFKJSXMusicSceneKVKFKJSXMusicScene';

let totp = new TOTP({
  issuer: '2049App',
  label: 'Admin',
  algorithm: 'SHA1',
  digits: 6,
  period: 60,
  secret: OTP_SECRET,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
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
        
        const sdk = ThirdwebSDK.fromPrivateKey(
            process.env.THIRDWEB_SECRET_KEY as string, 
            "sepolia"
        );
            
        const contract = await sdk.getContract(process.env.VITE_CONTRACT_ADDRESS as string);
        
        const metadata = {
            name: `NFT #${nftId}`,
            description: `NFT speciale mintato per ${userWallet}`,
            image: "ipfs://...", 
        };

        const tx = await contract.erc721.mintTo(userWallet, metadata);
        
        const receipt = tx.receipt; 
        
        return res.status(200).json({ success: true, transactionHash: receipt.transactionHash });

    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}