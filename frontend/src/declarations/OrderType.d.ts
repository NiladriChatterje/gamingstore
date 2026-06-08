import { ProductType } from "./ProductContextType";
import { UserType } from "./UserType";

export declare type OrderType = {
    _id: string;
    customer: UserType;
    product: ProductType[];
    quantity: number;
    transactionId: string;
    orderId: string;
    paymentSignature: string;
    amount: number;
    status: 'orderPlaced' | 'dispatched' | 'shipping' | 'shipped';
    createdAt?: string;
    expectedDelivery?: string;
}

export declare type OrderDetailsType = {
    order: OrderType;
    currentLocation?: {
        lat: number;
        lng: number;
    };
    estimatedArrival?: string;
}