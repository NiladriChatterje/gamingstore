import { ProductType } from "./ProductContextType";

export declare type UserType = {
  _id: string;
  username: string | null | undefined;
  geoPoint: {
    lat: number;
    lng: number;
  }
  phone?: number;
  email: string | null | undefined;
  address: {
    pinCode: string;
    county: string;
    country: string;
    state: string;
  },
  cart: ProductType[]
}
