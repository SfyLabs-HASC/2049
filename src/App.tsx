import { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import AdminPage from './components/AdminPage';

export default function App() {
  const [route, setRoute] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setRoute(path);
  };

  let Component;
  switch (route) {
    case '/1':
      Component = <AdminPage />;
      break;
    default:
      Component = <HomePage />;
  }
  
  return (
    <div>
      <nav style={{ padding: '1rem', background: '#111', textAlign: 'center' }}>
        <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} style={{ marginRight: '2rem' }}>Home Utente</a>
        <a href="/1" onClick={(e) => { e.preventDefault(); navigate('/1'); }}>Pagina Admin</a>
      </nav>
      {Component}
    </div>
  );
}
