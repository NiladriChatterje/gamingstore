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
  SubscriptionPlan?: subscription[] | undefined | null;
  address: {
    pincode: string;
    county: string;
    country: string;
    state: string;
  };
}

type subscription = {
  transactionId: string;
  orderId: string;
  paymentSignature: string;
  amount: number;
  planSchemeList: plan;
};

interface plan {
  activeDate: Date;
  expireDate: Date;
}
