export declare type UserType = {
  document_id: string;
   _id: string;
    username: string | null | undefined;
    geoPoint: {
      lat: number;
      lng: number;
    }
    phone?: number;
    adminId: string | null | undefined;
    email: string | null | undefined;
    address: {
      pinCode: string;
      county: string;
      country: string;
      state: string;
    }
}
