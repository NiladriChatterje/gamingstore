import React, { LegacyRef, RefObject } from "react";

export declare type ProductType = {
  _id: string;
  productName: string;
  category: string;
  eanUpcIsbnGtinAsinType: EanUpcIsbnType;
  eanUpcNumber: string;
  price: {
    currency: string;
    discountPercentage: number;
    pdtPrice: number
  };
  pincode: string;
  storeId: number;
  currency?: currency;
  imagesBase64?: { size: number; extension: string; base64: string }[];
  image?: File[];
  modelNumber?: string;
  variations?: { key: string; value: string }[];
  productDescription: string;
  quantity: number | null;
  keywords: string[];
  seller?: string;
};
