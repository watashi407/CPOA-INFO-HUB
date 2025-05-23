import React from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import App from './App.jsx';

const msalConfig = {
  auth: {
    clientId: '625d88e5-92ce-4611-aa66-5fbef0b74bb6',
    authority: 'https://login.microsoftonline.com/073be8a1-48eb-494c-8d79-cbf237967925',
    redirectUri: 'https://cpoa-info-hub.vercel.app',
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

// Remove top-level await for build compatibility
// Instead, initialize in a useEffect in the component

export default function MSALRoot() {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let ignore = false;
    msalInstance.initialize().then(() => {
      if (!ignore) setReady(true);
    });
    return () => { ignore = true; };
  }, []);

  if (!ready) return <div style={{textAlign:'center',padding:'2rem',color:'#2563eb'}}>Initializing authentication...</div>;

  return (
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  );
}
