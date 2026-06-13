import { useEffect, useState } from 'react';
import { SignIn, useUser, useAuth } from '@clerk/clerk-react';
import styles from './ShipperDashboard.module.css';

interface DashboardStats {
    pending: number;
    inTransit: number;
    delivered: number;
}

const ShipperDashboard = () => {
    const { isSignedIn, user } = useUser();
    const { getToken } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({ pending: 0, inTransit: 0, delivered: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isSignedIn || !user) return;

        const fetchStats = async () => {
            try {
                const token = await getToken();
                const shipperId = `shipper-${user.id}`;
                const response = await fetch(`http://localhost:5004/shipper-dashboard-stats/${shipperId}`, {
                    headers: {
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data: DashboardStats = await response.json();
                    setStats(data);
                }
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [isSignedIn, user, getToken]);

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
        <div className={styles['dashboard-container']}>
            <h1 className={styles['dashboard-title']}>Shipper Dashboard</h1>
            <div className={styles['dashboard-content']}>
                <div className={styles['stats-container']}>
                    <div className={styles['stat-card']}>
                        <h3>Pending Shipments</h3>
                        <p className={styles['stat-number']}>{loading ? '...' : stats.pending}</p>
                    </div>
                    <div className={styles['stat-card']}>
                        <h3>In Transit</h3>
                        <p className={styles['stat-number']}>{loading ? '...' : stats.inTransit}</p>
                    </div>
                    <div className={styles['stat-card']}>
                        <h3>Delivered</h3>
                        <p className={styles['stat-number']}>{loading ? '...' : stats.delivered}</p>
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