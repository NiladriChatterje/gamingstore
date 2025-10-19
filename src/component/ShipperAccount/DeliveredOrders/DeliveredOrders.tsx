import { SignedIn, SignIn, useUser } from '@clerk/clerk-react';
import styles from "./DeliveredOrders.module.css";

const DeliveredOrders = () => {
    const { isSignedIn } = useUser();

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
        <SignedIn>
            <div className={styles["orders-container"]}>
                <h1 className={styles["orders-title"]}>Delivered Orders</h1>
                <div className={styles["orders-content"]}>
                    <div className={styles["orders-grid"]}>
                        <div className={styles["order-card"]}>
                            <div className={styles["order-header"]}>
                                <h3>Order #1001</h3>
                                <span className={styles["status-badge-delivered"]}>Delivered</span>
                            </div>
                            <div className={styles["order-details"]}>
                                <p><strong>Customer:</strong> John Doe</p>
                                <p><strong>Address:</strong> 123 Main St, City, State</p>
                                <p><strong>Delivered on:</strong> Oct 15, 2025</p>
                                <p><strong>Items:</strong> 3</p>
                            </div>
                        </div>

                        <div className={styles["order-card"]}>
                            <div className={styles["order-header"]}>
                                <h3>Order #1002</h3>
                                <span className={styles["status-badge-delivered"]}>Delivered</span>
                            </div>
                            <div className={styles["order-details"]}>
                                <p><strong>Customer:</strong> Jane Smith</p>
                                <p><strong>Address:</strong> 456 Oak Ave, City, State</p>
                                <p><strong>Delivered on:</strong> Oct 14, 2025</p>
                                <p><strong>Items:</strong> 2</p>
                            </div>
                        </div>

                        <div className={styles["empty-state"]}>
                            <p>More delivered orders will appear here</p>
                        </div>
                    </div>
                </div>
            </div>
        </SignedIn>
    );
};

export default DeliveredOrders;