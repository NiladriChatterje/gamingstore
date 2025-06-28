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
  currency?: currency;
  imagesBase64?: { size: number; extension: string; base64: string }[];
  image?: File[];
  modelNumber?: string;
  productDescription: string;
  quantity: number;
  keywords: string[];
  seller?: string;
};
