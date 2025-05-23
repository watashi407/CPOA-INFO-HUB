import React from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import App from './App.jsx';

const msalConfig = {
  auth: {
    clientId: '625d88e5-92ce-4611-aa66-5fbef0b74bb6',
    authority: 'https://login.microsoftonline.com/073be8a1-48eb-494c-8d79-cbf237967925',
    redirectUri: 'http://localhost:5173',
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

// Ensure MSAL is initialized before rendering the app
await msalInstance.initialize();

export default function MSALRoot() {
  return (
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  );
}
