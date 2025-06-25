import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { TOTP } from 'otpauth';

const OTP_SECRET = 'KVKFKJSXMusicSceneKVKFKJSXMusicScene';

let totp = new TOTP({
  issuer: '2049App',
  label: 'Admin',
  algorithm: 'SHA1',
  digits: 6,
  period: 60,
  secret: OTP_SECRET,
});

export default function QrCode() {
  const [qrImage, setQrImage] = useState('');
  const [timeLeft, setTimeLeft] = useState(totp.period);
  const [currentToken, setCurrentToken] = useState('');

  const generateQrCode = (token: string) => {
    QRCode.toDataURL(token, (err, url) => {
      if (err) {
        console.error("Errore generazione QR:", err);
        return;
      }
      setQrImage(url);
    });
  };

  useEffect(() => {
    const token = totp.generate();
    setCurrentToken(token);
    generateQrCode(token);

    const interval = setInterval(() => {
      const newTimeLeft = totp.period - (Math.floor(Date.now() / 1000) % totp.period);
      setTimeLeft(newTimeLeft);
      if (newTimeLeft === totp.period) {
        const newToken = totp.generate();
        setCurrentToken(newToken);
        generateQrCode(newToken);
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
