import { useState } from "react";
import styles from './Payment.module.css';
import Loader from "./Loader.tsx";
import { useUserStateContext } from "../UserStateContext.tsx";
import Checkout from "../../../utils/Checkout.tsx";
import { SignedIn, SignedOut, SignIn, useSignIn } from "@clerk/clerk-react";
import { useStateContext } from "../../../StateContext.tsx";


function Payment() {
    const [oneProduct, _] = useState<{ name: string; qty: number; price: number }>(JSON.parse(localStorage.getItem('oneProduct') ?? '{}'));
    const { oneItem, data, totalPrice } = useUserStateContext();

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
                            {oneItem ? <div id={styles['nam_price_container']}>
                                <section id={styles['nam_price']}>
                                    <span>{oneProduct?.name}</span>
                                    <div className={styles['pdt-details']}><span>Quantity: </span><span>{oneProduct?.qty}</span></div>
                                    <div className={styles['pdt-details']}><span>Unit Price: </span><span>₹ {oneProduct?.price}</span></div>
                                </section>
                                <div className={`${styles['pdt-details']} ${styles['single-pdt-total']}`}>
                                    <Checkout price={oneProduct.price * oneProduct.qty} />
                                    <span>Total: </span><span>₹ {oneProduct?.price * oneProduct?.qty}</span></div>
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
                                        <Checkout price={oneItem ? oneProduct.price * oneProduct.qty : totalPrice || 0} />
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