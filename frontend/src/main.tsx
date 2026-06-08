import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router-dom'
import { StateContext } from './StateContext.tsx'
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY)
  throw new Error("Missing Publishable Key")

createRoot(document.getElementById('root')!).render(

  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <StateContext>
      <BrowserRouter><App /></BrowserRouter>
    </StateContext>
  </ClerkProvider>
)
