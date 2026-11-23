// Oswald, la fuente de los titulares de las páginas públicas, va incluida en el build (sin pedir a Google Fonts).
import '@fontsource/oswald/latin-500.css';
import '@fontsource/oswald/latin-600.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
