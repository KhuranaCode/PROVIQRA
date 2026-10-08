import React, { Suspense, lazy, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// The 3D landing page (three.js) is lazy-loaded so it never weighs down the app bundle.
const Landing = lazy(() => import('./landing/Landing.jsx'));

const isAppRoute = () => window.location.hash.startsWith('#/app');

function Root() {
  const [inApp, setInApp] = useState(isAppRoute);

  useEffect(() => {
    const onHash = () => setInApp(isAppRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (inApp) return <App />;
  return (
    <Suspense fallback={null}>
      <Landing />
    </Suspense>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
