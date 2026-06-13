import { useEffect, useState } from 'react';
import { SignIn, useUser, useAuth } from '@clerk/clerk-react';
import styles from "./DeliveredOrders.module.css";
import { OrderType } from "@declarations/OrderType";

const DeliveredOrders = () => {
    const { isSignedIn, user } = useUser();
    const { getToken } = useAuth();
    const [orders, setOrders] = useState<OrderType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isSignedIn || !user) return;

        const fetchDeliveredOrders = async () => {
            try {
                const token = await getToken();
                const shipperId = `shipper-${user.id}`;
                const response = await fetch(`http://localhost:5004/fetch-delivered-orders/${shipperId}`, {
                    headers: {
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data: OrderType[] = await response.json();
                    setOrders(data);
                }
            } catch (err) {
                console.error('Error fetching delivered orders:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDeliveredOrders();
    }, [isSignedIn, user, getToken]);

    if (!isSignedIn)
        return (
            <section
                style={{
                    width: '100%', height: '90dvh',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}
            >
                <SignIn redirectUrl={'/shipper/delivered'} />
            </section>
        );

    return (
        <div className={styles["orders-container"]}>
            <h1 className={styles["orders-title"]}>Delivered Orders</h1>
            <div className={styles["orders-content"]}>
                <div className={styles["orders-grid"]}>
                    {loading ? (
                        <div className={styles["empty-state"]}>
                            <p>Loading delivered orders...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className={styles["empty-state"]}>
                            <p>No delivered orders yet</p>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div className={styles["order-card"]} key={order._id}>
                                <div className={styles["order-header"]}>
                                    <h3>Order #{order.orderId}</h3>
                                    <span className={styles["status-badge-delivered"]}>Delivered</span>
                                </div>
                                <div className={styles["order-details"]}>
                                    <p><strong>Customer:</strong> {order.customer?.username || 'N/A'}</p>
                                    <p><strong>Address:</strong> {
                                        order.customer?.address
                                            ? `${order.customer.address.county}, ${order.customer.address.state}`
                                            : 'N/A'
                                    }</p>
                                    <p><strong>Items:</strong> {order.quantity}</p>
                                    <p><strong>Amount:</strong> ₹{order.amount?.toLocaleString() || 'N/A'}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeliveredOrders;