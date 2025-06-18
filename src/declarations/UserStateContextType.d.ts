import React, { LegacyRef, RefObject } from "react";
import { currency, EanUpcIsbnType } from "@enums/enums";
import { ProductType } from "./ProductContextType";
import { UserType } from "./UserType";

export declare type ProductContextType = {
  singleProductDetail: ProductType;
  setSingleProductDetail: React.Dispatch<React.SetStateAction<ProductType | undefined>>;
  userData: UserType;
  setUserData: React.Dispatch<React.SetStateAction<UserType | undefined>>;
  lastRoute: string;
  setLastRoute: React.Dispatch<React.SetStateAction<string>>;
  slide: boolean;
  setSlide: React.Dispatch<React.SetStateAction<boolean>>;
  navRef: LegacyRef<HTMLElement>;
  totalPrice: number;
  setTotalPrice: React.Dispatch<React.SetStateAction<number>>;
  cartData: ProductType[];
  setOrderData: React.Dispatch<React.SetStateAction<ProductType[]>>;
  isOneItem: boolean;
  setIsOneItem: React.Dispatch<React.SetStateAction<boolean>>;
  qty: number;
  setQty: React.Dispatch<React.SetStateAction<number>>;
  incDecQty: (counter: number, id: string) => void;
  addItemToCart: (item: ProductType) => void;
};
