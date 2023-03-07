import { useEffect, useState } from "react";
import './Payment.css'
import Loader from "./Loader";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useStateContext } from "../StateContext";


function Payment() {
    const [stripePromise, setStripePromise] = useState(null);
    const [clientSecret, setClientSecret] = useState("");
    const [loader, setLoader] = useState(() => true);

    const { oneItem, data, totalPrice, oneProduct } = useStateContext();

    useEffect(() => {
        axios.get('http://localhost:4242/config').then(async (r) => {
            const { publishableKey } = await r?.data;
            setStripePromise(loadStripe(publishableKey));
        }).catch(toast('Internal Server Problem'));
    }, []);

    useEffect(() => {
        setTimeout(() => setLoader(false), 3000);
    });

    useEffect(() => {
        axios.post("http://localhost:4242/create-payment-intent", {
            body: JSON.stringify(oneItem ? oneProduct : { data, totalPrice }),
        }).then(async (result) => {
            var { clientSecret } = await result?.data;
            setClientSecret(clientSecret);
        });
    }, []);

    return (
        <>
            <h1 id={'h1'}>PAYMENT GATEWAY</h1>
            <Toaster />
            {loader ? <Loader /> : <div id='whole_wrapper'>
                <div>
                    {oneItem ? <div id='nam_price' style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{oneProduct?.name}</span>
                        <span>₹ {oneProduct?.price}</span>
                    </div> :
                        <table cellPadding={10} width={'100%'} style={{ color: 'white', fontWeight: 900 }} >
                            <tr><th>Product</th><th>QTY</th><th>Price</th></tr>
                            {data?.map(item => (
                                <tr key={item.id} >
                                    <td >{item?.name}</td><td>{item?.count}</td><td>₹{item?.price * item?.count}</td>
                                </tr>))}
                        </table>}
                    <div id='nam_price' style={{ height: '1px', position: 'relative', left: 0, backgroundColor: 'white' }} />
                    <div id='nam_price' style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Amount : </span>
                        <span>₹ {oneItem ? oneProduct?.price : totalPrice}</span>
                    </div>
                </div>
                <span id='barrier'></span>
                {clientSecret && stripePromise && (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutForm />
                    </Elements>)}
            </div>}
        </>
    );
}

export default Payment;