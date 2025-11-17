import { useUser, SignIn, useAuth } from '@clerk/clerk-react'
import styles from './Orders.module.css'
import { useEffect, useState } from 'react';
import OrderPendingItem from './OrderPendingItem';
import { ProductType } from '@/declarations/ProductContextType';
import { useUserStateContext } from '../UserStateContext';

type AccordionState = 'pending' | 'received' | null;

const Orders = () => {
    const [orders, setOrders] = useState<ProductType[]>(() => []);
    const [activeAccordion, setActiveAccordion] = useState<AccordionState>('pending');
    const { cartData, userData } = useUserStateContext();
    const { isSignedIn } = useUser();
    const { getToken } = useAuth();

    async function fetchOrderData(userId: string): Promise<void> {
        const token = await getToken();
        const response = await fetch(`http://localhost:5001/orders/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                "Authorization": `Bearer ${token}`
            }
        });

        const orderData: any[] = await response.json();
        setOrders(orderData);
    }

    useEffect(() => {
        if (isSignedIn && userData)
            fetchOrderData(userData._id)
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

            {/* Pending Orders Accordion */}
            <fieldset
                className={styles['fieldset-style']}
                style={{
                    height: activeAccordion === 'pending' ? '75%' : 'auto'
                }}
            >
                <legend
                    onClick={() => setActiveAccordion(activeAccordion === 'pending' ? null : 'pending')}
                    style={{ cursor: 'pointer' }}
                >
                    Pending :
                </legend>
                {activeAccordion === 'pending' && (
                    <section
                        className={styles['order-sub-container']}
                        style={{
                            height: 'calc(100% - 40px)',
                            overflowY: 'auto'
                        }}
                    >
                        {cartData?.map((item, i) => {
                            return <OrderPendingItem key={item?._id ?? i} item={item} />
                        })}
                    </section>
                )}
            </fieldset>

            {/* Buy All Button - only show when pending is active */}
            {activeAccordion === 'pending' && (
                <section
                    style={{
                        width: '55%', display: 'flex', justifyContent: 'flex-end',
                        backgroundColor: 'rgb(59, 59, 96)', padding: '5px 10px', marginTop: 10,
                        borderRadius: 5
                    }}
                >
                    <button className={styles['button-invert']}
                        onClick={() => { localStorage.setItem("isOneItem", "false") }}>Buy All</button>
                </section>
            )}

            {/* Received Orders Accordion */}
            <fieldset
                className={styles['fieldset-style']}
                style={{
                    height: activeAccordion === 'received' ? '80%' : 'auto'
                }}
            >
                <legend
                    onClick={() => setActiveAccordion(activeAccordion === 'received' ? null : 'received')}
                    style={{ cursor: 'pointer' }}
                >
                    Received :
                </legend>
                {activeAccordion === 'received' && (
                    <section
                        className={styles['order-sub-container']}
                        style={{
                            height: 'calc(100% - 40px)',
                            overflowY: 'auto'
                        }}
                    >
                        {orders?.map((item, i) => {
                            return <section key={i}
                                className={styles['order-items']}>
                                {item.productName || "ok"}
                            </section>
                        })}
                    </section>
                )}
            </fieldset>
        </div>
    )
}

export default Orders