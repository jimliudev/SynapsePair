import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AppWalletProvider from './providers/WalletProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppWalletProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppWalletProvider>
  </StrictMode>,
)
