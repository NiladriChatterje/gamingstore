import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import styles from './Orders.module.css';
import { useAdminStateContext } from '../AdminStateContext';

interface OrderProduct {
    product: {
        _id: string;
        _ref: string;
    };
    quantity: number;
    price: number;
}

interface OrderAssignment {
    _id: string;
    orderId?: string;
    seller: {
        _id: string;
        _ref: string;
    };
    products: OrderProduct[];
    status: 'pending' | 'accepted' | 'rejected' | 'processing' | 'ready_to_ship';
    totalAmount: number;
    isPartialFulfillment: boolean;
    notes: string;
    acceptedAt?: string;
    rejectionReason?: string;
    _createdAt: string;
}

const Orders = () => {
    const { isSignedIn } = useUser();
    const { getToken } = useAuth();
    const [orders, setOrders] = useState<OrderAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'processing' | 'ready_to_ship'>('all');
    const { admin } = useAdminStateContext();
    // Fetch orders assigned to this seller
    useEffect(() => {
        if (isSignedIn && admin) {
            fetchSellerOrders();
            // Poll for new orders every 10 seconds
            const interval = setInterval(fetchSellerOrders, 10000);
            return () => clearInterval(interval);
        }
    }, [isSignedIn, admin]);

    const fetchSellerOrders = async () => {
        try {
            if (!admin) return;

            const token = await getToken();
            const response = await fetch(`http://localhost:5003/seller-orders/${admin._id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setOrders(data || []);
            } else {
                console.warn('Failed to fetch seller orders');
            }
        } catch (error) {
            console.error('Error fetching seller orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: OrderAssignment['status']) => {
        try {
            const token = await getToken();
            const response = await fetch(`http://localhost:5001/seller-order-status/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                toast.success(`Order status updated to ${newStatus}`);
                fetchSellerOrders();
            } else {
                toast.error('Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Error updating order status');
        }
    };

    const handleRejectOrder = async (orderId: string, reason: string) => {
        try {
            if (!reason.trim()) {
                toast.error('Please provide a rejection reason');
                return;
            }

            const token = await getToken();
            const response = await fetch(`http://localhost:5001/seller-order-reject/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rejectionReason: reason })
            });

            if (response.ok) {
                toast.success('Order rejected');
                fetchSellerOrders();
            } else {
                toast.error('Failed to reject order');
            }
        } catch (error) {
            console.error('Error rejecting order:', error);
            toast.error('Error rejecting order');
        }
    };

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(order => order.status === filter);

    const getStatusColor = (status: OrderAssignment['status']) => {
        switch (status) {
            case 'pending':
                return '#FFA500'; // Orange
            case 'accepted':
                return '#4CAF50'; // Green
            case 'processing':
                return '#2196F3'; // Blue
            case 'ready_to_ship':
                return '#9C27B0'; // Purple
            case 'rejected':
                return '#F44336'; // Red
            default:
                return '#666';
        }
    };

    if (loading) {
        return <div className={styles['loading']}>Loading orders...</div>;
    }

    return (
        <div className={styles['orders-container']}>
            <div className={styles['header']}>
                <h1>Your Assigned Orders</h1>
                <p>Total: {orders.length} orders</p>
            </div>

            {/* Filter Buttons */}
            <div className={styles['filter-bar']}>
                {(['all', 'pending', 'accepted', 'processing', 'ready_to_ship', 'rejected'] as const).map(status => (
                    <button
                        key={status}
                        className={`${styles['filter-btn']} ${filter === status ? styles['active'] : ''}`}
                        onClick={() => setFilter(status)}
                    >
                        {status.replace('_', ' ').toUpperCase()}
                        {status !== 'all' && ` (${orders.filter(o => o.status === status).length})`}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            <div className={styles['orders-list']}>
                {filteredOrders.length === 0 ? (
                    <div className={styles['empty-state']}>
                        <p>No orders with status "{filter}"</p>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order._id} className={styles['order-card']}>
                            <div className={styles['order-header']}>
                                <div className={styles['order-id']}>
                                    <h3>Order ID: {order._id?.slice(0, 8)}...</h3>
                                    <p className={styles['created-at']}>
                                        {new Date(order._createdAt).toLocaleDateString()} {new Date(order._createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                                <span
                                    className={styles['status-badge']}
                                    style={{ backgroundColor: getStatusColor(order.status) }}
                                >
                                    {order.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>

                            {/* Partial Fulfillment Warning */}
                            {order.isPartialFulfillment && (
                                <div className={styles['partial-warning']}>
                                    <p>This is a PARTIAL fulfillment order</p>
                                </div>
                            )}

                            {/* Products */}
                            <div className={styles['products-section']}>
                                <h4>Products:</h4>
                                <ul className={styles['products-list']}>
                                    {order.products.map((product, idx) => (
                                        <li key={idx}>
                                            <span className={styles['quantity']}>
                                                Qty: <strong>{product.quantity}</strong>
                                            </span>
                                            <span className={styles['price']}>
                                                ₹{(product.price * product.quantity).toFixed(2)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Amount */}
                            <div className={styles['amount-section']}>
                                <p className={styles['total-amount']}>
                                    Total Amount: <strong>₹{order.totalAmount.toFixed(2)}</strong>
                                </p>
                            </div>

                            {/* Notes */}
                            {order.notes && (
                                <div className={styles['notes-section']}>
                                    <p className={styles['notes-label']}>Notes:</p>
                                    <p className={styles['notes-text']}>{order.notes}</p>
                                </div>
                            )}

                            {/* Rejection Reason */}
                            {order.rejectionReason && (
                                <div className={styles['rejection-section']}>
                                    <p className={styles['rejection-label']}>Rejection Reason:</p>
                                    <p className={styles['rejection-text']}>{order.rejectionReason}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {order.status === 'pending' && (
                                <div className={styles['action-buttons']}>
                                    <button
                                        className={`${styles['action-btn']} ${styles['accept-btn']}`}
                                        onClick={() => handleStatusUpdate(order._id, 'accepted')}
                                    >
                                        Accept Order
                                    </button>
                                    <button
                                        className={`${styles['action-btn']} ${styles['reject-btn']}`}
                                        onClick={() => {
                                            const reason = prompt('Enter rejection reason:');
                                            if (reason) handleRejectOrder(order._id, reason);
                                        }}
                                    >
                                        Reject Order
                                    </button>
                                </div>
                            )}

                            {order.status === 'accepted' && (
                                <div className={styles['action-buttons']}>
                                    <button
                                        className={`${styles['action-btn']} ${styles['processing-btn']}`}
                                        onClick={() => handleStatusUpdate(order._id, 'processing')}
                                    >
                                        Mark as Processing
                                    </button>
                                </div>
                            )}

                            {order.status === 'processing' && (
                                <div className={styles['action-buttons']}>
                                    <button
                                        className={`${styles['action-btn']} ${styles['ready-btn']}`}
                                        onClick={() => handleStatusUpdate(order._id, 'ready_to_ship')}
                                    >
                                        Mark as Ready to Ship
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Orders;
