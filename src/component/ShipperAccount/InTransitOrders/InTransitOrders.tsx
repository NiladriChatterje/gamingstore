import styles from "./InTransitOrders.module.css";

const InTransitOrders = () => {
    return (
        <div className={styles["orders-container"]}>
            <h1 className={styles["orders-title"]}>In-Transit Orders</h1>
            <div className={styles["orders-content"]}>
                <div className={styles["orders-grid"]}>
                    <div className={styles["order-card"]}>
                        <div className={styles["order-header"]}>
                            <h3>Order #2001</h3>
                            <span className={styles["status-badge-transit"]}>In Transit</span>
                        </div>
                        <div className={styles["order-details"]}>
                            <p><strong>Customer:</strong> Alice Johnson</p>
                            <p><strong>Address:</strong> 789 Pine Rd, City, State</p>
                            <p><strong>Expected:</strong> Oct 20, 2025</p>
                            <p><strong>Items:</strong> 5</p>
                        </div>
                        <div className={styles["order-actions"]}>
                            <button className={styles["btn-primary"]}>Update Status</button>
                            <button className={styles["btn-secondary"]}>View Details</button>
                        </div>
                    </div>

                    <div className={styles["order-card"]}>
                        <div className={styles["order-header"]}>
                            <h3>Order #2002</h3>
                            <span className={styles["status-badge-transit"]}>In Transit</span>
                        </div>
                        <div className={styles["order-details"]}>
                            <p><strong>Customer:</strong> Bob Williams</p>
                            <p><strong>Address:</strong> 321 Elm St, City, State</p>
                            <p><strong>Expected:</strong> Oct 21, 2025</p>
                            <p><strong>Items:</strong> 2</p>
                        </div>
                        <div className={styles["order-actions"]}>
                            <button className={styles["btn-primary"]}>Update Status</button>
                            <button className={styles["btn-secondary"]}>View Details</button>
                        </div>
                    </div>

                    <div className={styles["empty-state"]}>
                        <p>More in-transit orders will appear here</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InTransitOrders;