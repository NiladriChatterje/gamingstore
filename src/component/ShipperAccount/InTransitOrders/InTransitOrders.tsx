import { useEffect, useState } from 'react';
import styles from "./InTransitOrders.module.css";
import { useNavigate } from 'react-router-dom';
import { SignIn, useUser, useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { OrderType } from "@declarations/OrderType";

const InTransitOrders = () => {
    const navigate = useNavigate();
    const { isSignedIn, user } = useUser();
    const { getToken } = useAuth();
    const [orders, setOrders] = useState<OrderType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isSignedIn || !user) return;

        const fetchInTransitOrders = async () => {
            try {
                const token = await getToken();
                const shipperId = `shipper-${user.id}`;
                const response = await fetch(`http://localhost:5004/fetch-shipper-orders/${shipperId}`, {
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
                console.error('Error fetching in-transit orders:', err);
                toast.error('Failed to load in-transit orders');
            } finally {
                setLoading(false);
            }
        };

        fetchInTransitOrders();
    }, [isSignedIn, user, getToken]);

    const handleViewDetails = (orderId: string) => {
        navigate(`/shipper/orders/${orderId}`);
    };

    if (!isSignedIn)
        return (
            <section
                style={{
                    width: '100%', height: '90dvh',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}
            >
                <SignIn redirectUrl={'/shipper'} />
            </section>
        );

    return (
        <div className={styles["orders-container"]}>
            <h1 className={styles["orders-title"]}>In-Transit Orders</h1>
            <div className={styles["orders-content"]}>
                <div className={styles["orders-grid"]}>
                    {loading ? (
                        <div className={styles["empty-state"]}>
                            <p>Loading in-transit orders...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className={styles["empty-state"]}>
                            <p>No orders in transit</p>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div className={styles["order-card"]} key={order._id}>
                                <div className={styles["order-header"]}>
                                    <h3>Order #{order.orderId}</h3>
                                    <span className={styles["status-badge-transit"]}>In Transit</span>
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
                                <div className={styles["order-actions"]}>
                                    <button
                                        className={styles["btn-primary"]}
                                        onClick={() => handleViewDetails(order.orderId)}
                                    >
                                        View Details
                                    </button>
                                    <button
                                        className={styles["btn-secondary"]}
                                        onClick={() => handleViewDetails(order.orderId)}
                                    >
                                        Track Delivery
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default InTransitOrders;