import styles from './ShipperDashboard.module.css';

const ShipperDashboard = () => {
    return (
        <div className={styles['dashboard-container']}>
            <h1 className={styles['dashboard-title']}>Shipper Dashboard</h1>
            <div className={styles['dashboard-content']}>
                <div className={styles['stats-container']}>
                    <div className={styles['stat-card']}>
                        <h3>Pending Shipments</h3>
                        <p className={styles['stat-number']}>0</p>
                    </div>
                    <div className={styles['stat-card']}>
                        <h3>In Transit</h3>
                        <p className={styles['stat-number']}>0</p>
                    </div>
                    <div className={styles['stat-card']}>
                        <h3>Delivered</h3>
                        <p className={styles['stat-number']}>0</p>
                    </div>
                </div>
                <div className={styles['welcome-message']}>
                    <h2>Welcome to Shipper Portal</h2>
                    <p>Manage your shipments and deliveries efficiently.</p>
                </div>
            </div>
        </div>
    );
};

export default ShipperDashboard;