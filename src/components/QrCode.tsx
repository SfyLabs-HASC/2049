// ==========================================
// File: src/components/QrCode.tsx
// ==========================================
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode'; // Libreria per generare QR
import { TOTP } from 'otpauth'; // Libreria per generare codici TOTP

// Chiave segreta per generare i codici. DEVE essere la stessa usata nel backend.
const OTP_SECRET = 'KVKFKJSXMusicSceneKVKFKJSXMusicScene'; // Esempio, usa una stringa più complessa

let totp = new TOTP({
  issuer: '2049App',
  label: 'Admin',
  algorithm: 'SHA1',
  digits: 6,
  period: 60, // Cambia ogni 60 secondi
  secret: OTP_SECRET,
});

export default function QrCode() {
  const [qrImage, setQrImage] = useState('');
  const [timeLeft, setTimeLeft] = useState(totp.period);
  const [currentToken, setCurrentToken] = useState('');

  useEffect(() => {
    // Genera il token corrente
    const token = totp.generate();
    setCurrentToken(token);
    
    // Il QR code contiene il token stesso come segreto
    QRCode.toDataURL(token)
      .then(url => setQrImage(url))
      .catch(err => console.error(err));

    // Countdown per l'aggiornamento
    const interval = setInterval(() => {
      let newTimeLeft = totp.period - (Math.floor(Date.now() / 1000) % totp.period);
      setTimeLeft(newTimeLeft);
      if (newTimeLeft === totp.period) {
        const newToken = totp.generate();
        setCurrentToken(newToken);
        QRCode.toDataURL(newToken).then(setQrImage);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      {qrImage && <img src={qrImage} alt="QR Code Dinamico" />}
      <p>Il segreto attuale è: <strong>{currentToken}</strong></p>
      <p>Il codice cambierà tra: <strong>{timeLeft}</strong> secondi</p>
    </div>
  );
}