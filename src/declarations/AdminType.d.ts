export declare interface AdminFieldsType {
  _type?: string;
  _id: string;
  gstin?: string;
  username: string | null | undefined;
  geoPoint: {
    lat: number;
    lng: number;
  };
  phone?: number;
  email: string | null | undefined;
  subscriptionPlan?: subscription[] | undefined | null;
  isPlanActive?: boolean;
  address: {
    pincode: string;
    county: string;
    country: string;
    state: string;
  };

  stores?: Store[];
}
export type Store = {
  id: number;
  county: string;
  pincode: string;
  address: string;
  state: string;
  country: string;
};

type subscription = {
  transactionId: string;
  orderId: string;
  paymentSignature: string;
  amount: number;
  storeAllotment: number;  // number of stores the seller can configure under this plan
  planSchemaList: plan;
};

interface plan {
  activeDate: Date;
  expireDate: Date;
}

