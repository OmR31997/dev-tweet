import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import NotFoundPage from './components/NotFoundPage';
import './index.css';

function appRelativePath(): string {
  const baseRaw = import.meta.env.BASE_URL;
  const base = baseRaw.endsWith('/') ? baseRaw.slice(0, -1) : baseRaw;
  let path = window.location.pathname;
  if (base && path.startsWith(base)) {
    path = path.slice(base.length);
  }
  path = path.replace(/\/$/, '') || '/';
  return path;
}

function isUnknownClientRoute(): boolean {
  const p = appRelativePath();
  if (p === '/' || p === '') return false;
  if (p.toLowerCase() === '/index.html') return false;
  return true;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isUnknownClientRoute() ? <NotFoundPage /> : <App />}</StrictMode>,
);
