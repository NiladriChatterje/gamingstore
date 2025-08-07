import { ProductType } from "./ProductContextType";

export declare type UserType = {
  _id: string;
  username: string | null | undefined;
  geoPoint: {
    lat: number;
    lng: number;
  }
  phone?: string;
  email: string | null | undefined;
  address: {
    pincode: string;
    county: string;
    country: string;
    state: string;
  },
  cart: { _id: string; quantity: number }[]
}
