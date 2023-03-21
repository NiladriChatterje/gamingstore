import { useEffect, useState } from "react";
import './Payment.css';
import axios from 'axios';
import Loader from "./Loader";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { loadStripe } from "@stripe/stripe-js";
import { Toaster } from "react-hot-toast";
import { useStateContext } from "../StateContext";


function Payment() {
    const [stripePromise, setStripePromise] = useState(null);
    const [clientSecret, setClientSecret] = useState("");
    const [loader, setLoader] = useState(() => true);

    const { oneItem, data, totalPrice, oneProduct } = useStateContext();

    useEffect(() => {
        (async function () {
            const { data: { publishableKey } } = await axios.get('https://game-store-stripe.onrender.com/config')
            setStripePromise(loadStripe(publishableKey));
        })();
         (async function () {
            const { data } = await axios.post("https://game-store-stripe.onrender.com/create-payment-intent", {
                price: oneItem ? oneProduct.price : totalPrice
            })
            setClientSecret(data?.clientSecret)
        })();
    }, []);

    useEffect(() => {
        setTimeout(() => setLoader(false), 3050);
    });

    return (
        <>
            <h1 id={'h1'}>PAYMENT GATEWAY</h1>
            <Toaster />
            {loader ? <Loader /> : <div id='whole_wrapper'>
                <div>
                    {oneItem ? <div id='nam_price'>
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
                                <td><span>₹{oneItem ? oneProduct?.price * oneProduct?.qty : totalPrice}</span></td>
                            </tr>
                            </tfoot>
                        </table>}
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