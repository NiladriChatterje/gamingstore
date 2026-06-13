import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import styles from './Orders.module.css';
import { useAdminStateContext } from '../AdminStateContext';
import ShipperAssignmentModal from './ShipperAssignmentModal';
import ShipperDetailsModal from './ShipperDetailsModal';
import { FaStore, FaTruck, FaEye, FaBox, FaFilter, FaSyncAlt, FaClipboardList, FaExclamationTriangle, FaCheckCircle, FaHourglass, FaShippingFast } from 'react-icons/fa6';

interface OrderProduct {
    product: {
        _id: string;
        _ref: string;
    };
    quantity: number;
    price: number;
}

interface ShipperAssignment {
    shippingId: string;
    shipperId: string;
    shipperName: string;
    shipperPhone: string;
    shipperEmail: string;
    status: string;
    assignedAt: string;
    shippedAt: string | null;
    deliveredAt: string | null;
    notes: string;
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
    pincode?: string;
    shippers?: ShipperAssignment[];
}

interface StoreGroup {
    pincode: string;
    storeName: string;
    orders: OrderAssignment[];
    orderCount: number;
}

const Orders = () => {
    const { isSignedIn } = useUser();
    const { getToken } = useAuth();
    const { admin } = useAdminStateContext();
    const [orders, setOrders] = useState<OrderAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'processing' | 'ready_to_ship'>('all');
    const [selectedStore, setSelectedStore] = useState<string>('all');
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderAssignment | null>(null);
    const [shipperDetailsOpen, setShipperDetailsOpen] = useState(false);
    const [selectedShipperId, setSelectedShipperId] = useState('');
    const [selectedShipperName, setSelectedShipperName] = useState('');
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const sseRef = useRef<EventSource | null>(null);

    // Derive stores from admin data for grouping
    const stores = useMemo(() => {
        if (!admin?.stores?.length) return [];
        return admin.stores.map((s: any) => ({
            pincode: String(s.pincode),
            storeName: s.store_name || `Store #${s.store_number || s.id}`
        }));
    }, [admin?.stores]);

    // Group orders by store (pincode)
    const storeGroups = useMemo<StoreGroup[]>(() => {
        const groups = new Map<string, OrderAssignment[]>();

        orders.forEach(order => {
            const pc = order.pincode || 'unknown';
            if (!groups.has(pc)) {
                groups.set(pc, []);
            }
            groups.get(pc)!.push(order);
        });

        const result: StoreGroup[] = [];

        // First, add known stores (even if they have no orders)
        stores.forEach(store => {
            const storeOrders = groups.get(store.pincode) || [];
            result.push({
                pincode: store.pincode,
                storeName: store.storeName,
                orders: storeOrders,
                orderCount: storeOrders.length
            });
            groups.delete(store.pincode);
        });

        // Then add unknown pincodes
        groups.forEach((orders, pincode) => {
            result.push({
                pincode,
                storeName: `Store (Pincode: ${pincode})`,
                orders,
                orderCount: orders.length
            });
        });

        return result;
    }, [orders, stores]);

    // Filtered orders
    const filteredOrders = useMemo(() => {
        let result = orders;

        if (filter !== 'all') {
            result = result.filter(order => order.status === filter);
        }

        if (selectedStore !== 'all') {
            result = result.filter(order => (order.pincode || 'unknown') === selectedStore);
        }

        return result;
    }, [orders, filter, selectedStore]);

    // Fetch orders
    const fetchSellerOrders = useCallback(async () => {
        if (!admin) return;
        try {
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
                setLastUpdate(new Date());
            } else {
                console.warn('Failed to fetch seller orders');
            }
        } catch (error) {
            console.error('Error fetching seller orders:', error);
        } finally {
            setLoading(false);
        }
    }, [admin, getToken]);

    // Initial fetch
    useEffect(() => {
        if (isSignedIn && admin) {
            fetchSellerOrders();
        }
    }, [isSignedIn, admin, fetchSellerOrders]);

    // SSE for real-time order updates
    useEffect(() => {
        if (!isSignedIn || !admin) return;

        // Close any existing connection
        if (sseRef.current) {
            sseRef.current.close();
        }

        // Connect to order SSE
        const eventSource = new EventSource(`http://localhost:4000/orders?sellerId=${admin._id}`);
        sseRef.current = eventSource;

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.topic === 'order-notifications' || data.topic === 'seller-order-notification-topic') {
                    console.log('[Orders SSE] Order update received, refreshing...');
                    fetchSellerOrders();
                }
            } catch (e) {
                console.error('[Orders SSE] Parse error:', e);
            }
        };

        eventSource.onerror = () => {
            console.warn('[Orders SSE] Connection error, will retry...');
        };

        // Connect to shipper events SSE
        const shipperSource = new EventSource(`http://localhost:4000/shipper-events?sellerId=${admin._id}`);

        shipperSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.topic === 'shipper-assignment-topic' || data.topic === 'shipping-event-topic') {
                    console.log('[Orders SSE] Shipper event received, refreshing...');
                    fetchSellerOrders();
                }
            } catch (e) {
                console.error('[Orders SSE - Shipper] Parse error:', e);
            }
        };

        return () => {
            eventSource.close();
            shipperSource.close();
            sseRef.current = null;
        };
    }, [isSignedIn, admin, fetchSellerOrders]);

    // Status update handlers
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
                toast.success(`Order status updated to ${newStatus.replace('_', ' ')}`);
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

    // Shipper assignment modal
    const openAssignModal = (order: OrderAssignment) => {
        setSelectedOrder(order);
        setAssignModalOpen(true);
    };

    const closeAssignModal = () => {
        setAssignModalOpen(false);
        setSelectedOrder(null);
    };

    // Shipper details modal (fraud tracing)
    const openShipperDetails = (shipperId: string, shipperName: string) => {
        setSelectedShipperId(shipperId);
        setSelectedShipperName(shipperName);
        setShipperDetailsOpen(true);
    };

    const getStatusColor = (status: OrderAssignment['status']) => {
        switch (status) {
            case 'pending': return '#FFA500';
            case 'accepted': return '#4CAF50';
            case 'processing': return '#2196F3';
            case 'ready_to_ship': return '#9C27B0';
            case 'rejected': return '#F44336';
            default: return '#666';
        }
    };

    const getStatusIcon = (status: OrderAssignment['status']) => {
        switch (status) {
            case 'pending': return <FaHourglass size={12} />;
            case 'accepted': return <FaCheckCircle size={12} />;
            case 'processing': return <FaSyncAlt size={12} />;
            case 'ready_to_ship': return <FaShippingFast size={12} />;
            case 'rejected': return <FaExclamationTriangle size={12} />;
            default: return null;
        }
    };

    const orderCounts = useMemo(() => {
        const counts: Record<string, number> = { all: orders.length };
        ['pending', 'accepted', 'processing', 'ready_to_ship', 'rejected'].forEach(s => {
            counts[s] = orders.filter(o => o.status === s).length;
        });
        return counts;
    }, [orders]);

    if (loading) {
        return <div className={styles['loading']}>Loading orders...</div>;
    }

    return (
        <div className={styles['orders-container']}>
            {/* Header */}
            <div className={styles['header']}>
                <div className={styles['header-left']}>
                    <FaClipboardList size={24} />
                    <div>
                        <h1>Orders</h1>
                        <p>{orders.length} total orders · Last updated: {lastUpdate.toLocaleTimeString()}</p>
                    </div>
                </div>
                <button
                    className={styles['refresh-btn']}
                    onClick={() => { setLoading(true); fetchSellerOrders(); }}
                    title="Refresh orders"
                >
                    <FaSyncAlt size={14} />
                    Refresh
                </button>
            </div>

            {/* Store Filter Bar */}
            {storeGroups.length > 1 && (
                <div className={styles['store-bar']}>
                    <FaStore size={14} className={styles['store-bar-icon']} />
                    <button
                        className={`${styles['store-btn']} ${selectedStore === 'all' ? styles['store-active'] : ''}`}
                        onClick={() => setSelectedStore('all')}
                    >
                        All Stores
                    </button>
                    {storeGroups.map(group => (
                        <button
                            key={group.pincode}
                            className={`${styles['store-btn']} ${selectedStore === group.pincode ? styles['store-active'] : ''}`}
                            onClick={() => setSelectedStore(group.pincode)}
                        >
                            <FaStore size={10} />
                            {group.storeName}
                            <span className={styles['store-count']}>{group.orderCount}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Status Filter */}
            <div className={styles['filter-bar']}>
                <FaFilter size={12} className={styles['filter-icon']} />
                {(['all', 'pending', 'accepted', 'processing', 'ready_to_ship', 'rejected'] as const).map(status => (
                    <button
                        key={status}
                        className={`${styles['filter-btn']} ${filter === status ? styles['active'] : ''}`}
                        onClick={() => setFilter(status)}
                    >
                        {status === 'all' ? (
                            'All'
                        ) : (
                            <>
                                {getStatusIcon(status)}
                                {status.replace('_', ' ')}
                            </>
                        )}
                        <span className={styles['filter-count']}>{orderCounts[status]}</span>
                    </button>
                ))}
            </div>

            {/* Store-wise Order Sections */}
            {selectedStore === 'all' ? (
                storeGroups.length === 0 ? (
                    <div className={styles['empty-state']}>
                        <FaClipboardList size={48} />
                        <p>No orders found</p>
                    </div>
                ) : (
                    storeGroups.map(group => (
                        <div key={group.pincode} className={styles['store-section']}>
                            <div className={styles['store-section-header']}>
                                <FaStore size={16} />
                                <h2>{group.storeName}</h2>
                                <span className={styles['store-section-count']}>
                                    {group.orderCount} order{group.orderCount !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className={styles['orders-list']}>
                                {group.orders.length === 0 ? (
                                    <div className={styles['store-empty']}>
                                        No orders for this store
                                    </div>
                                ) : (
                                    group.orders.map(order => renderOrderCard(order))
                                )}
                            </div>
                        </div>
                    ))
                )
            ) : (
                /* Single store view */
                <div className={styles['orders-list']}>
                    {filteredOrders.length === 0 ? (
                        <div className={styles['empty-state']}>
                            <FaClipboardList size={48} />
                            <p>No orders matching your filters</p>
                        </div>
                    ) : (
                        filteredOrders.map(order => renderOrderCard(order))
                    )}
                </div>
            )}

            {/* Shipper Assignment Modal */}
            {selectedOrder && (
                <ShipperAssignmentModal
                    isOpen={assignModalOpen}
                    onClose={closeAssignModal}
                    sellerOrderId={selectedOrder._id}
                    sellerId={selectedOrder.seller._id}
                    orderId={selectedOrder.orderId || selectedOrder._id}
                    pincode={selectedOrder.pincode || ''}
                    products={selectedOrder.products}
                    onAssigned={fetchSellerOrders}
                />
            )}

            {/* Shipper Details Modal (Fraud Tracing) */}
            <ShipperDetailsModal
                isOpen={shipperDetailsOpen}
                onClose={() => setShipperDetailsOpen(false)}
                shipperId={selectedShipperId}
                shipperName={selectedShipperName}
            />
        </div>
    );

    // Render a single order card
    function renderOrderCard(order: OrderAssignment) {
        return (
            <div key={order._id} className={styles['order-card']}>
                <div className={styles['order-header']}>
                    <div className={styles['order-id']}>
                        <h3>Order ID: {order._id?.slice(0, 8)}...</h3>
                        <p className={styles['created-at']}>
                            {new Date(order._createdAt).toLocaleDateString()}{' '}
                            {new Date(order._createdAt).toLocaleTimeString()}
                        </p>
                        {order.pincode && (
                            <span className={styles['order-pincode']}>
                                <FaStore size={10} /> Store: {order.pincode}
                            </span>
                        )}
                    </div>
                    <span
                        className={styles['status-badge']}
                        style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                        {getStatusIcon(order.status)}
                        {order.status.replace('_', ' ')}
                    </span>
                </div>

                {/* Partial Fulfillment Warning */}
                {order.isPartialFulfillment && (
                    <div className={styles['partial-warning']}>
                        <FaExclamationTriangle size={14} />
                        <span>This is a partial fulfillment order</span>
                    </div>
                )}

                {/* Products */}
                <div className={styles['products-section']}>
                    <h4><FaBox size={12} /> Products:</h4>
                    <ul className={styles['products-list']}>
                        {order.products.map((product, idx) => (
                            <li key={idx}>
                                <span className={styles['product-ref']}>
                                    {product.product._id.slice(0, 8)}...
                                </span>
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

                {/* Assigned Shippers */}
                {order.shippers && order.shippers.length > 0 && (
                    <div className={styles['shippers-section']}>
                        <h4><FaTruck size={12} /> Assigned Shippers:</h4>
                        <div className={styles['shippers-list']}>
                            {order.shippers.map((shipper, idx) => (
                                <div
                                    key={idx}
                                    className={styles['shipper-item']}
                                    onClick={() => openShipperDetails(shipper.shipperId, shipper.shipperName)}
                                    title="Click to view shipping details & fraud trace"
                                >
                                    <div className={styles['shipper-avatar-sm']}>
                                        <FaTruck size={10} />
                                    </div>
                                    <div className={styles['shipper-item-info']}>
                                        <span className={styles['shipper-item-name']}>
                                            {shipper.shipperName}
                                        </span>
                                        <span className={styles['shipper-item-status']}
                                            style={{ color: getShippingStatusColor(shipper.status) }}
                                        >
                                            {shipper.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <FaEye size={12} className={styles['shipper-view-icon']} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {order.status === 'pending' && (
                    <div className={styles['action-buttons']}>
                        <button
                            className={`${styles['action-btn']} ${styles['accept-btn']}`}
                            onClick={() => handleStatusUpdate(order._id, 'accepted')}
                        >
                            <FaCheckCircle size={14} />
                            Accept Order
                        </button>
                        <button
                            className={`${styles['action-btn']} ${styles['reject-btn']}`}
                            onClick={() => {
                                const reason = prompt('Enter rejection reason:');
                                if (reason) handleRejectOrder(order._id, reason);
                            }}
                        >
                            <FaExclamationTriangle size={14} />
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
                            <FaSyncAlt size={14} />
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
                            <FaShippingFast size={14} />
                            Mark as Ready to Ship
                        </button>
                    </div>
                )}

                {order.status === 'ready_to_ship' && (
                    <div className={styles['action-buttons']}>
                        <button
                            className={`${styles['action-btn']} ${styles['assign-shipper-btn']}`}
                            onClick={() => openAssignModal(order)}
                        >
                            <FaTruck size={14} />
                            Assign Shipper
                        </button>
                    </div>
                )}
            </div>
        );
    }

    function getShippingStatusColor(status: string): string {
        switch (status) {
            case 'assigned': return '#FFA500';
            case 'picked_up': return '#2196F3';
            case 'in_transit': return '#9C27B0';
            case 'delivered': return '#4CAF50';
            case 'cancelled': return '#F44336';
            default: return '#666';
        }
    }
};

export default Orders;
