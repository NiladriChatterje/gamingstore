import { useUser, SignIn } from '@clerk/clerk-react'
import styles from './Orders.module.css'
import { useEffect, useState } from 'react';

const Orders = () => {
    const [orders, setOrders] = useState<any[]>(() => [1, 2, 3, 5, 6, 6, 6, 8]);
    const { isSignedIn } = useUser();

    async function fetchOrderData(userId: string) {

    }

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

    useEffect(() => {
        fetchOrderData("")
    }, [])


    return (
        <div
            id={styles['order-container']}>
            <section
                id={styles['order-sub-container']}>
                {orders?.map((item, i) => {
                    return <section key={i}>
                        {item}
                    </section>
                })}
            </section>
        </div>
    )
}

export default Orders