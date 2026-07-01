import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setupMocks } from './api'
import './index.css'
import App from './App'

setupMocks()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
