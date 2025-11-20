import { useUser, SignIn, useAuth } from '@clerk/clerk-react'
import styles from './Delivery.module.css'
import { useEffect, useState } from 'react';
import DeliveryItem from './DeliveryItem';
import { OrderType } from '@/declarations/OrderType';
import { useUserStateContext } from '../UserStateContext';
import { EanUpcIsbnType, currency } from '@enums/enums';

type AccordionState = 'inTransit' | 'delivered' | null;

const Delivery = () => {
    const [deliveryOrders, setDeliveryOrders] = useState<OrderType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { userData } = useUserStateContext();
    const { isSignedIn } = useUser();
    const { getToken } = useAuth();

    // Filter orders based on status
    const inTransitOrders = deliveryOrders.filter(order =>
        order.status === 'shipped' || order.status === 'dispatched' || order.status === 'shipping'
    );
    const deliveredOrders = deliveryOrders.filter(order =>
        order.status === 'orderPlaced'
    );

    async function fetchDeliveryData(userId: string): Promise<void> {
        setLoading(true);
        try {
            const token = await getToken();
            const response = await fetch(`http://localhost:5001/delivery-orders/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const deliveryData: OrderType[] = await response.json();
            setDeliveryOrders(deliveryData);
        } catch (error) {
            console.error('Error fetching delivery orders:', error);
            setDeliveryOrders([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isSignedIn && userData)
            fetchDeliveryData(userData._id)
    }, [])

    if (!isSignedIn)
        return (
            <section
                style={{
                    width: '100%', height: '90dvh',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}
            >
                <SignIn redirectUrl={'/user/Delivery'} />
            </section>
        );

    if (loading) {
        return (
            <div id={styles['delivery-container']}>
                <div className={styles['loading']}>
                    Loading delivery orders...
                </div>
            </div>
        );
    }

    return (
        <div id={styles['delivery-container']}>
            {/* In Transit Orders Section */}
            <fieldset className={styles['fieldset-style']}>
                <legend>
                    In Transit ({inTransitOrders.length})
                </legend>
                <section
                    className={styles['delivery-sub-container']}
                    style={{
                        height: '300px',
                        overflowY: 'auto'
                    }}
                >
                    {inTransitOrders.length > 0 ? (
                        inTransitOrders.map((item, i) => {
                            return <DeliveryItem key={item?._id ?? i} item={item} />
                        })
                    ) : (
                        <div className={styles['no-orders']}>
                            No orders in transit
                        </div>
                    )}
                </section>
            </fieldset>

            {/* Delivered Orders Section */}
            <fieldset className={styles['fieldset-style']}>
                <legend>
                    Delivered ({deliveredOrders.length})
                </legend>
                <section
                    className={styles['delivery-sub-container']}
                    style={{
                        height: '300px',
                        overflowY: 'auto'
                    }}
                >
                    {deliveredOrders.length > 0 ? (
                        deliveredOrders.map((item, i) => {
                            return <DeliveryItem key={item?._id ?? i} item={item} isDelivered={true} />
                        })
                    ) : (
                        <div className={styles['no-orders']}>
                            No delivered orders
                        </div>
                    )}
                </section>
            </fieldset>
        </div>
    )
}

export default Delivery