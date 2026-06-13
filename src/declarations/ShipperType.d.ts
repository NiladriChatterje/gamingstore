export declare interface ShipperFieldsType {
  _id: string;
  shippername: string | null | undefined;
  email: string | null | undefined;
  phone?: number;
  geoPoint?: {
    lat: number;
    lng: number;
  };
  address?: {
    pincode: string;
    county: string;
    country: string;
    state: string;
  };
  createdAt?: string;
}

/** Payload sent / received by create-shipper endpoints */
export declare interface CreateShipperPayload {
  _id: string;
  username: string;
  email: string;
}

/** Payload sent to PATCH /update-shipper-info */
export declare interface UpdateShipperPayload {
  _id: string;
  shippername?: string;
  phone?: number;
  email?: string;
  geoPoint?: {
    lat?: number;
    lng?: number;
  };
  address?: {
    pincode?: string;
    county?: string;
    country?: string;
    state?: string;
  };
}

/** Response from /fetch-shipper-data/:_id */
export declare interface FetchShipperResponse {
  _id: string;
  shippername: string;
  email: string;
  phone: number;
  address: {
    pincode: string;
    county: string;
    country: string;
    state: string;
  } | null;
}
