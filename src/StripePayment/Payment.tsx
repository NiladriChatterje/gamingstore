import { useEffect, useState } from "react";
import styles from './Payment.module.css';
import axios from 'axios';
import Loader from "./Loader";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { loadStripe, Stripe } from "@stripe/stripe-js";
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
        setStripePromise(loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_API));

        (async function () {
            // https://game-store-stripe.onrender.com
            const { data } = await axios.post("http://localhost:5000/create-payment-intent", {
                price: oneItem ? oneProduct.price : totalPrice
            })
            setClientSecret(data?.clientSecret)
        })();
        setTimeout(() => setLoader(false), 200);

        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div id={styles['payment-container']}>
            {loader ? <Loader /> : (
                <div id={styles['whole_wrapper']}>
                    <div id={styles['product-list']}>
                        {oneItem ? <div id={styles['nam_price_container']}>
                            <section id={styles['nam_price']}>
                                <span>{oneProduct?.name}</span>
                                <div className={styles['pdt-details']}><span>Quantity: </span><span>{oneProduct?.qty}</span></div>
                                <div className={styles['pdt-details']}><span>Unit Price: </span><span>₹ {oneProduct?.price}</span></div>
                            </section>
                            <div className={`${styles['pdt-details']} ${styles['single-pdt-total']}`}><span>Total: </span><span>₹ {oneProduct?.price * oneProduct?.qty}</span></div>
                        </div> :
                            <section id={styles['table']}>
                                <header>
                                    <th className={styles['first-column']}>Product</th>
                                    <th className={styles['second-column']}>QTY</th>
                                    <th className={styles['third-column']}>Price</th>
                                </header>
                                <div>
                                    {data?.map(item => (
                                        <div key={item.id} >
                                            <span className={styles['first-column']} >{item?.name}</span>
                                            <span className={styles['second-column']}>{item?.count}</span>
                                            <span className={styles['third-column']}>₹{item?.price * item?.count}</span>
                                        </div>))}
                                </div>
                                <footer className={styles['single-pdt-total']}>
                                    <span className={styles['first-column']}>Amount: </span>
                                    <span className={styles['second-column']}></span>
                                    <span className={styles['third-column']}>₹{oneItem ? oneProduct?.price * oneProduct?.qty : totalPrice}</span>
                                </footer>
                            </section>}
                    </div>
                    <div id={styles['loader-payment-card-container']}>
                        {clientSecret && stripePromise ? (
                            <Elements
                                stripe={stripePromise} options={{ clientSecret }}>
                                <CheckoutForm />
                            </Elements>) : <PaymentLoader />}
                    </div>
                </div>)}
        </div>
    );
}

export default Payment;