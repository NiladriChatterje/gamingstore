import { useState } from "react";
import styles from './Payment.module.css';
import Loader from "./Loader.tsx";
import { useUserStateContext } from "../UserStateContext.tsx";
import Checkout from "../../../utils/Checkout.tsx";
import { SignedIn, SignedOut, SignIn, useAuth, useSignIn } from "@clerk/clerk-react";
import { useStateContext } from "../../../StateContext.tsx";


function Payment() {
    const [oneProduct, _] = useState<{ name: string; qty: number; price: number }>(JSON.parse(localStorage.getItem('oneProduct') ?? '{}'));
    const { isOneItem, cartData, totalPrice, userData } = useUserStateContext();

    const { setDefaultLoginAdminOrUser } = useStateContext()

    const { isLoaded } = useSignIn();
    if (isLoaded) {
        localStorage.setItem('loginusertype', 'user')
        setDefaultLoginAdminOrUser?.('user')
    }
    return (

        <div id={styles['payment-container']}>
            <SignedIn>
                {false ? <Loader /> : (
                    <div id={styles['whole_wrapper']}>
                        <div id={styles['product-list']}>
                            {isOneItem ? <div id={styles['nam_price_container']}>
                                <section id={styles['nam_price']}>
                                    <span>{oneProduct?.name}</span>
                                    <div className={styles['pdt-ProductDetail']}><span>Quantity: </span><span>{oneProduct?.qty}</span></div>
                                    <div className={styles['pdt-ProductDetail']}><span>Unit Price: </span><span>₹ {oneProduct?.price}</span></div>
                                </section>
                                <div className={`${styles['pdt-ProductDetail']} ${styles['single-pdt-total']}`}>
                                    <Checkout price={oneProduct.price * oneProduct.qty}
                                        callback={async (
                                            payment_id: string,
                                            razorpay_signature: string,
                                            razorpay_order_id: string,
                                        ) => {
                                            await fetch(`http://localhost:5000/user-order`, {
                                                method: 'PUT',
                                                headers: {
                                                    'Content-Type': `application/json`,
                                                    'Authorization': `Bearer ${await useAuth().getToken()}`
                                                },
                                                body: JSON.stringify({
                                                    customer: userData?._id,
                                                    transactionId: payment_id,
                                                    orderId: razorpay_order_id,
                                                    paymentSignature: razorpay_signature,
                                                    amount: oneProduct.price * oneProduct.qty
                                                })
                                            });
                                        }} />
                                    <span>Total: </span><span>₹ {oneProduct?.price * oneProduct?.qty}</span></div>
                            </div> :
                                <section id={styles['table']}>
                                    <header>
                                        <th className={styles['first-column']}>Product</th>
                                        <th className={styles['second-column']}>QTY</th>
                                        <th className={styles['third-column']}>Price</th>
                                    </header>
                                    <div>
                                        {cartData?.map(item => (
                                            <div key={item._id} >
                                                <span className={styles['first-column']} >{item?.productName}</span>
                                                <span className={styles['second-column']}>{item?.quantity}</span>
                                                <span className={styles['third-column']}>₹{item?.price.pdtPrice * item?.quantity}</span>
                                            </div>))}
                                    </div>
                                    <footer className={styles['single-pdt-total']}>
                                        <Checkout price={isOneItem ? oneProduct.price * oneProduct.qty : totalPrice || 0} />
                                        {/* <span className={styles['first-column']}>Amount: </span> */}
                                        <span className={styles['second-column']}>Amount: </span>
                                        <span className={styles['third-column']}>₹{totalPrice}</span>
                                    </footer>
                                </section>}
                        </div>
                    </div>)}
            </SignedIn>
            <SignedOut>
                <SignIn redirectUrl={'/user/payment'} afterSignInUrl={'/user/payment'} />
            </SignedOut>
        </div>
    );
}

export default Payment;