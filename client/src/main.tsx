import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PrivyProvider } from '@privy-io/react-auth'
import ErrorBoundary from './ErrorBoundary.tsx'
import { BrowserRouter } from 'react-router'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <PrivyProvider
        appId="cm7eiidxa01iwk9lbfgtk2aar"
        config={{
          // Display email and wallet as login methods
          loginMethods: ['email'],
          // Customize Privy's appearance in your app
          appearance: {
            theme: 'light',
            accentColor: '#676FFF',
          },
          // Create embedded wallets for users who don't have a wallet
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
        }}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>

        <Toaster />
      </PrivyProvider>
    </ErrorBoundary>


  </StrictMode>,
)
