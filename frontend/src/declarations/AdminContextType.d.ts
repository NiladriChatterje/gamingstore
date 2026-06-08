import { ProductType } from '@/declarations/UserStateContextType'
import { SanityClient } from '@sanity/client'
import React from 'react'
import { AdminFieldsType } from './AdminType';

export type AdminContextType = {
  editProductForm: ProductType | null;
  setEditProductForm: React.Dispatch<
    React.SetStateAction<ProductType | null | undefined>
  >;
  admin: AdminFieldsType;
  isPlanActiveState: boolean;
  setIsPlanActive: React.Dispatch<React.SetStateAction<boolean>>;
  setAdmin: React.Dispatch<React.SetStateAction<any>>;
  sanityClient: SanityClient;
  // Date filtering states for statistics
  fromDate: Date | null;
  setFromDate: React.Dispatch<React.SetStateAction<Date | null>>;
  toDate: Date | null;
  setToDate: React.Dispatch<React.SetStateAction<Date | null>>;
  // Function to fetch filtered statistics
  fetchFilteredStatistics: (fromDate: Date | null, toDate: Date | null) => Promise<void>;
}
