// Questo endpoint API sicuro legge l'indirizzo del wallet backend
// dalle variabili d'ambiente del server e lo restituisce al frontend.

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        // Accetta solo richieste GET
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const backendWalletAddress = process.env.ENGINE_BACKEND_WALLET_ADDRESS;

    if (!backendWalletAddress) {
        console.error("La variabile d'ambiente ENGINE_BACKEND_WALLET_ADDRESS non è impostata!");
        return res.status(500).json({ error: 'Indirizzo del wallet backend non configurato sul server.' });
    }

    // Invia l'indirizzo pubblico come risposta
    return res.status(200).json({ address: backendWalletAddress });
}
