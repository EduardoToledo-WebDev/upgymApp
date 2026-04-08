import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Main } from './components/Main/'
import { AppProvider } from './context/AppContext';
import { StepperEntrenamiento } from './views/StepperEntrenamiento';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <Main />
      <StepperEntrenamiento />
    </AppProvider>
  </StrictMode>,
)
