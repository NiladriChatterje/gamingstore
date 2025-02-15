import { createContext, ReactNode, useState, useContext } from 'react'
import type { AdminContextType } from './AdminContextType.d.ts'
import { createClient, SanityClient } from '@sanity/client'
import { ProductType } from '@/declarations/UserStateContextType.js'

const AdminContext = createContext<Partial<AdminContextType>>({})

const sanityClient: SanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  token: import.meta.env.VITE_SANITY_TOKEN,
  dataset: 'production',
})

export const AdminStateContext = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<any>({})
  const [isPlanActiveState, setIsPlanActive] = useState<boolean>(true)
  const [editProductForm, setEditProductForm] = useState<ProductType | null>() // To fill up form fields when a product is about to edit

  return (
    <AdminContext.Provider
      value={{
        editProductForm,
        setEditProductForm,
        isPlanActiveState,
        setIsPlanActive,
        admin,
        setAdmin,
        sanityClient,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export const useAdminStateContext = () => useContext(AdminContext)
