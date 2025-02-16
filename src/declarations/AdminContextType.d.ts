import { ProductType } from '@/declarations/UserStateContextType'
import { SanityClient } from '@sanity/client'
import React from 'react'

export type AdminContextType = {
  editProductForm: ProductType | null;
  setEditProductForm: React.Dispatch<
    React.SetStateAction<ProductType | null | undefined>
  >;
  admin: any;
  isPlanActiveState: boolean;
  setIsPlanActive: React.Dispatch<React.SetStateAction<boolean>>;
  setAdmin: React.Dispatch<React.SetStateAction<any>>;
  sanityClient: SanityClient;
}
