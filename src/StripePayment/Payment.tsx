import { useEffect, useState } from "react";
import './Payment.css';
import axios from 'axios';
import Loader from "./Loader";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Toaster } from "react-hot-toast";
import { useStateContext } from "../StateContext";
import PaymentLoader from "./PaymentLoader.tsx";


function Payment() {
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null>>();
    const [clientSecret, setClientSecret] = useState("");
    const [loader, setLoader] = useState(() => true);
    // eslint-disable-next-line
    const [oneProduct, _] = useState<{ name: string; qty: number; price: number }>(JSON.parse(localStorage.getItem('oneProduct') ?? '{}'));
    const { oneItem, data, totalPrice } = useStateContext();

    useEffect(() => {
        (async function () {
            const { data: { publishableKey } }: { data: { publishableKey: string } } = await axios.get('https://game-store-stripe.onrender.com/config')
            setStripePromise(loadStripe(publishableKey as string));
        })();
        (async function () {
            const { data } = await axios.post("https://game-store-stripe.onrender.com/create-payment-intent", {
                price: oneItem?.current ? (oneProduct?.price ? oneProduct.price : 0) : totalPrice
            })
            setClientSecret(data?.clientSecret)
        })();
        setTimeout(() => setLoader(false), 200);

        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <h1 id={'h1'}>PAYMENT GATEWAY</h1>
            <Toaster />
            {loader ? <Loader /> : <div id='whole_wrapper'>
                <div>
                    {oneItem?.current ? <div id='nam_price'>
                        <span>{oneProduct?.name}</span>
                        <div><span>Quantity: </span><span>{oneProduct?.qty}</span></div>
                        <div><span>Unit Price: </span><span>₹ {oneProduct?.price}</span></div>
                        <div><span>Total: </span><span>₹ {oneProduct?.price * oneProduct?.qty}</span></div>
                    </div> :
                        <table cellPadding={10} width={'100%'} style={{ color: 'white', fontWeight: 900 }} >
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>QTY</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.map(item => (
                                    <tr key={item.id} >
                                        <td >{item?.name}</td><td>{item?.count}</td><td>₹{item?.price * item?.count}</td>
                                    </tr>))}
                            </tbody>
                            <tfoot><tr>
                                <td><span>Amount: </span></td>
                                <td></td>
                                <td><span>₹{oneItem?.current ? oneProduct?.price * oneProduct?.qty : totalPrice}</span></td>
                            </tr>
                            </tfoot>
                        </table>}
                </div>
                <span id='barrier'></span>
                {clientSecret && stripePromise ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutForm />
                    </Elements>) : <PaymentLoader />}
            </div>}
        </>
    );
}

export default Payment;