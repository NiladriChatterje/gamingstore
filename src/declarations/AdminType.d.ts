export declare interface AdminFieldsType {
  _type?: string;
  _id: string;
  gstin?: string;
  username: string | null | undefined;
  geoPoint?: {
    lat: number;
    lng: number;
  };
  phone?: number;
  email: string | null | undefined;
  subscriptionPlan?: subscription[] | undefined | null;
  isPlanActive?: boolean;
  address?: {
    pincode: string;
    county: string;
    country: string;
    state: string;
  };

  stores?: Store[];
}
export type Store = {
  id: number;
  store_number?: number;
  pincode: string;
  shard_host?: string;
  store_name?: string;
  address_line1?: string;
  address_line2?: string;
  county: string;
  state: string;
  country: string;
};

type subscription = {
  _key?: string;            // auto-generated DB row id (returned from MySQL)
  transactionId: string;
  orderId: string;
  paymentSignature: string;
  amount?: number;
  storeAllotment: number;   // number of stores the seller can configure under this plan
  planSchemaList: {
    activeDate: Date;
    expireDate: Date;
  };
};

