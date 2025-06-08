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
  orderData: ProductType[];
  setOrderData: React.Dispatch<React.SetStateAction<ProductType[]>>;
  oneItem: boolean;
  setOneItem: React.Dispatch<React.SetStateAction<boolean>>;
  qty: number;
  setQty: React.Dispatch<React.SetStateAction<number>>;
  ItemIDCount: object & { id?: string };
  setItemIDCount: React.Dispatch<React.SetStateAction<object>>;
  incDecQty: (counter: number, id: string) => void;
  addItemToOrderList: (item: ProductType) => void;
};
