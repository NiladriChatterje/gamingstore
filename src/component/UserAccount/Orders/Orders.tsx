import { useUser, SignIn } from '@clerk/clerk-react'
import styles from './Orders.module.css'
import { useEffect, useState } from 'react';
import OrderPendingItem from './OrderPendingItem';
import { ProductType } from '@/declarations/UserStateContextType';

const Orders = () => {
    const [orders, setOrders] = useState<ProductType[]>(() => [1, 2, 3, 5, 6, 6, 6, 8] as unknown as ProductType[]);

    const { isSignedIn } = useUser();

    async function fetchOrderData(userId: string): Promise<void> {

    }
    useEffect(() => {
        if (isSignedIn)
            fetchOrderData("")
    }, [])


    if (!isSignedIn)
        return (
            <section
                style={{
                    width: '100%', height: '90dvh',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}
            >
                <SignIn redirectUrl={'/user/Orders'} />
            </section>
        );



    return (
        <div
            id={styles['order-container']}>
            <fieldset
                className={styles['fieldset-style']}
            >
                <legend>Pending :</legend>
                <section
                    className={styles['order-sub-container']}>
                    {orders?.map((item, i) => {
                        return <OrderPendingItem key={item?._id ?? i} item={item} />
                    })}
                </section>
            </fieldset>
            <section
                style={{
                    width: '55%', display: 'flex', justifyContent: 'flex-end',
                    backgroundColor: 'rgb(59, 59, 96)', padding: '5px 10px', marginTop: 10,
                    borderRadius: 5
                }}
            ><button className={styles['button-invert']}>Buy All</button></section>
            <fieldset
                className={styles['fieldset-style']}
            >
                <legend>Received :</legend>
                <section
                    className={styles['order-sub-container']}>
                    {orders?.map((item, i) => {
                        return <section key={i}
                            className={styles['order-items']}>
                            {item.productName || "ok"}
                        </section>
                    })}
                </section>
            </fieldset>
        </div>
    )
}

export default Orders