import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Main } from './components/Main/'
import { AppProvider } from './context/AppContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <Main />
    </AppProvider>
  </StrictMode>,
)
