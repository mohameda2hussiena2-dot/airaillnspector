import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './i18n/LanguageContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import './index.css';

// Register Service Worker for Offline Capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('👷 ServiceWorker registered successfully with scope:', registration.scope);
        
        // Setup periodic sync check
        if ('sync' in registration) {
          (registration as any).sync.register('replay-offline-sync').catch((err: any) => {
            console.warn('Background sync registration failed:', err);
          });
        }
      })
      .catch((error) => {
        console.error('👷 ServiceWorker registration failed:', error);
      });
  });

  // Handle messages from Service Worker (replay successes)
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data) {
      if (event.data.type === 'OFFLINE_REPLAY_SUCCESS') {
        const customEvent = new CustomEvent('sw-replay-success', {
          detail: { url: event.data.url, method: event.data.method }
        });
        window.dispatchEvent(customEvent);
      } else if (event.data.type === 'OFFLINE_REQUEST_QUEUED') {
        const customEvent = new CustomEvent('sw-offline-queued', {
          detail: { url: event.data.url, method: event.data.method }
        });
        window.dispatchEvent(customEvent);
      }
    }
  });

  // Listen for online/offline events to send state changes to the Service Worker
  window.addEventListener('online', () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'ONLINE' });
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </LanguageProvider>
  </StrictMode>,
);

