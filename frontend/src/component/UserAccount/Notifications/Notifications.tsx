import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import styles from './Notifications.module.css';

interface OrderNotification {
    _id: string;
    orderId: string;
    customerId: string;
    customerEmail: string;
    productId: string;
    productName?: string;
    sellerId: string;
    sellerName?: string;
    quantity: number;
    totalAmount: number;
    isPartialFulfillment: boolean;
    refundAmount?: number;
    status: 'pending' | 'accepted' | 'rejected' | 'processing' | 'ready_to_ship';
    createdAt: string;
    read: boolean;
}

const Notifications = () => {
    const { user, isSignedIn } = useUser();
    const { getToken } = useAuth();
    const [notifications, setNotifications] = useState<OrderNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch notifications for customer
    useEffect(() => {
        if (isSignedIn && user) {
            fetchNotifications();
            // Poll for new notifications every 5 seconds
            const interval = setInterval(fetchNotifications, 5000);
            return () => clearInterval(interval);
        }
    }, [isSignedIn, user]);

    const fetchNotifications = async () => {
        try {
            if (!user) return;

            const token = await getToken();
            const response = await fetch(`http://localhost:5001/customer-notifications/${user.id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data || []);
                setUnreadCount(data?.filter((n: OrderNotification) => !n.read).length || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            const token = await getToken();
            await fetch(`http://localhost:5001/notification-read/${notificationId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const getStatusIcon = (status: OrderNotification['status']) => {
        switch (status) {
            case 'pending':
                return '⏳';
            case 'accepted':
                return '✅';
            case 'processing':
                return '🔄';
            case 'ready_to_ship':
                return '📦';
            case 'rejected':
                return '❌';
            default:
                return '📬';
        }
    };

    if (loading) {
        return <div className={styles['loading']}>Loading notifications...</div>;
    }

    return (
        <div className={styles['notifications-container']}>
            <div className={styles['header']}>
                <h2>🔔 Notifications</h2>
                {unreadCount > 0 && (
                    <span className={styles['unread-badge']}>{unreadCount}</span>
                )}
            </div>

            <div className={styles['notifications-list']}>
                {notifications.length === 0 ? (
                    <div className={styles['empty-state']}>
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification._id}
                            className={`${styles['notification-item']} ${!notification.read ? styles['unread'] : ''}`}
                            onClick={() => !notification.read && markAsRead(notification._id)}
                        >
                            <div className={styles['notification-icon']}>
                                {getStatusIcon(notification.status)}
                            </div>

                            <div className={styles['notification-content']}>
                                <p className={styles['notification-title']}>
                                    Order #{notification.orderId?.slice(0, 8)}
                                </p>
                                <p className={styles['notification-message']}>
                                    {notification.status === 'accepted' &&
                                        `Your order for ${notification.quantity} item(s) has been accepted by seller`}
                                    {notification.status === 'processing' &&
                                        `Your order is being processed`}
                                    {notification.status === 'ready_to_ship' &&
                                        `Your order is ready to ship! 📦`}
                                    {notification.status === 'rejected' &&
                                        `Your order was rejected by the seller`}
                                    {notification.isPartialFulfillment &&
                                        ` (Partial: Refund ₹${notification.refundAmount?.toFixed(2)} pending)`}
                                </p>
                                <p className={styles['notification-time']}>
                                    {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString()}
                                </p>
                            </div>

                            {!notification.read && (
                                <div className={styles['read-indicator']} />
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
