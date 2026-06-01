import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { StoreProvider } from './store/StoreProvider'
import { ViewProvider } from './context/ViewProvider'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <StoreProvider>
        <ViewProvider>
          <App />
        </ViewProvider>
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
)
