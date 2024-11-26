import { useState } from "react";
import styles from './Payment.module.css';
import Loader from "./Loader.tsx";
import { useStateContext } from "../StateContext.tsx";
import Checkout from "../utils/Checkout.tsx";


function Payment() {
    const [oneProduct, _] = useState<{ name: string; qty: number; price: number }>(JSON.parse(localStorage.getItem('oneProduct') ?? '{}'));
    const { oneItem, data, totalPrice } = useStateContext();


    return (
        <div id={styles['payment-container']}>
            {false ? <Loader /> : (
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
                        <Checkout price={oneItem ? oneProduct.price * oneProduct.qty : totalPrice || 0} />
                    </div>
                </div>)}
        </div>
    );
}

export default Payment;