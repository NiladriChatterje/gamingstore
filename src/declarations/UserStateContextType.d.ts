import React, { LegacyRef, RefObject } from 'react'
import { currency, EanUpcIsbnType } from '@enums/enums'

export declare type ProductType = {
  _id?: string
  productName: string
  category: string
  eanUpcIsbnGtinAsinType: EanUpcIsbnType
  eanUpcNumber: string
  price: number
  currency?: currency
  imagesBase64?: { size: number; extension: string; base64: string }[]
  image?: FileList
  modelNumber?: string
  seller: string
  productDescription: string
  quantity: number
  keywords: string[]
  discount: number
  seller?: string[]
  created_at: Date
  update_at: Date
}

export declare type UserType = {}

export declare type ProductContextType = {
  userData: any
  setUserData: React.Dispatch<React.SetStateAction<any>>
  lastRoute: string
  setLastRoute: React.Dispatch<React.SetStateAction<string>>
  slide: boolean
  setSlide: React.Dispatch<React.SetStateAction<boolean>>
  navRef: LegacyRef<HTMLElement>
  totalPrice: number
  setTotalPrice: React.Dispatch<React.SetStateAction<number>>
  data: ProductType[]
  setData: React.Dispatch<React.SetStateAction<ProductType[]>>
  oneItem: boolean
  setOneItem: React.Dispatch<React.SetStateAction<boolean>>
  qty: number
  setQty: React.Dispatch<React.SetStateAction<number>>
  ItemIDCount: object & { id?: string }
  setItemIDCount: React.Dispatch<React.SetStateAction<object>>
  incDecQty: (counter: number, id: number | string) => void
  addItemToOrderList: (item: ProductType) => void
}
