import styles from "./InTransitOrders.module.css";
import { useNavigate } from 'react-router-dom';

const inTransitOrders = [
    {
        orderId: "2001",
        customer: "Alice Johnson",
        address: "789 Pine Rd, City, State",
        expectedDelivery: "Oct 20, 2025",
        items_qty: 5,
        items: [],
        geoPoint: {
            lat: 40.7128,
            lng: -74.0060
        }
    },
    {
        orderId: "2002",
        customer: "Bob Williams",
        address: "321 Elm St, City, State",
        expectedDelivery: "Oct 21, 2025",
        items_qty: 2,
        items: [],
        geoPoint: {
            lat: 34.0522,
            lng: -118.2437
        }
    }
]

const InTransitOrders = () => {
    const navigate = useNavigate();

    const handleViewDetails = (orderId: string) => {
        navigate(`/shipper/orders/${orderId}`);
    };

    return (
        <div className={styles["orders-container"]}>
            <h1 className={styles["orders-title"]}>In-Transit Orders</h1>
            <div className={styles["orders-content"]}>
                <div className={styles["orders-grid"]}>
                    {
                        inTransitOrders.map((order) => (
                            <div className={styles["order-card"]} key={order.orderId}>
                                <div className={styles["order-header"]}>
                                    <h3>Order #{order.orderId}</h3>
                                    <span className={styles["status-badge-transit"]}>In Transit</span>
                                </div>
                                <div className={styles["order-details"]}>
                                    <p><strong>Customer:</strong> {order.customer}</p>
                                    <p><strong>Address:</strong> {order.address}</p>
                                    <p><strong>Expected:</strong> {order.expectedDelivery}</p>
                                    <p><strong>Items:</strong> {order.items_qty}</p>
                                </div>
                                <div className={styles["order-actions"]}>
                                    <button className={styles["btn-primary"]}>Update Status</button>
                                    <button
                                        className={styles["btn-secondary"]}
                                        onClick={() => handleViewDetails(order.orderId)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))
                    }

                    <div className={styles["empty-state"]}>
                        <p>More in-transit orders will appear here</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InTransitOrders;