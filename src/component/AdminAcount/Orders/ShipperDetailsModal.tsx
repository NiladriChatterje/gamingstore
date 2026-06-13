import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import styles from './ShipperDetailsModal.module.css';
import { FaTruck, FaTimes, FaPhone, FaEnvelope, FaBox, FaCalendarAlt, FaMapMarkerAlt, FaCheck, FaHourglass, FaShippingFast } from 'react-icons/fa6';

interface ShipmentProduct {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
}

interface Shipment {
    shippingId: string;
    sellerOrderId: string;
    orderId: string;
    sellerId: string;
    sellerName: string;
    sellerEmail: string;
    status: string;
    orderStatus: string;
    totalAmount: number;
    assignedAt: string;
    pickedUpAt: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
    notes: string;
    products: ShipmentProduct[];
}

interface ShipperData {
    shipper: {
        id: string;
        name: string;
        phone: string;
        email: string;
        address: {
            pincode: string;
            county: string;
            state: string;
            country: string;
        };
    };
    totalShipments: number;
    shipments: Shipment[];
}

interface ShipperDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    shipperId: string;
    shipperName?: string;
}

const statusIcons: Record<string, React.ReactNode> = {
    'assigned': <FaHourglass size={12} />,
    'picked_up': <FaBox size={12} />,
    'in_transit': <FaShippingFast size={12} />,
    'delivered': <FaCheck size={12} />
};

const statusColors: Record<string, string> = {
    'assigned': '#FFA500',
    'picked_up': '#2196F3',
    'in_transit': '#9C27B0',
    'delivered': '#4CAF50',
    'cancelled': '#F44336'
};

const ShipperDetailsModal = ({
    isOpen,
    onClose,
    shipperId,
    shipperName
}: ShipperDetailsModalProps) => {
    const { getToken } = useAuth();
    const [data, setData] = useState<ShipperData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen || !shipperId) return;

        const fetchDetails = async () => {
            setLoading(true);
            try {
                const token = await getToken();
                const response = await fetch(`http://localhost:5003/shipper-shipment-details/${shipperId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    setData(result);
                } else {
                    toast.error('Failed to load shipper details');
                }
            } catch (error) {
                console.error('Error fetching shipper details:', error);
                toast.error('Error loading shipper details');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [isOpen, shipperId, getToken]);

    if (!isOpen) return null;

    return (
        <div className={styles['modal-overlay']} onClick={onClose}>
            <div className={styles['modal-content']} onClick={e => e.stopPropagation()}>
                <div className={styles['modal-header']}>
                    <div className={styles['modal-title']}>
                        <FaTruck size={20} />
                        <h2>Shipper Details — Fraud Trace</h2>
                    </div>
                    <button className={styles['close-btn']} onClick={onClose}>
                        <FaTimes size={18} />
                    </button>
                </div>

                <div className={styles['modal-body']}>
                    {loading ? (
                        <div className={styles['loading-state']}>
                            <div className={styles['spinner']}></div>
                            <p>Loading shipper details...</p>
                        </div>
                    ) : !data ? (
                        <div className={styles['loading-state']}>
                            <p>Failed to load shipper data</p>
                        </div>
                    ) : (
                        <>
                            {/* Shipper Info Card */}
                            <div className={styles['shipper-profile']}>
                                <div className={styles['shipper-avatar']}>
                                    <FaTruck size={24} />
                                </div>
                                <div className={styles['shipper-meta']}>
                                    <h3>{data.shipper.name}</h3>
                                    <span className={styles['shipper-contact']}>
                                        <FaPhone size={11} /> {data.shipper.phone}
                                    </span>
                                    <span className={styles['shipper-contact']}>
                                        <FaEnvelope size={11} /> {data.shipper.email}
                                    </span>
                                    {data.shipper.address.county && (
                                        <span className={styles['shipper-contact']}>
                                            <FaMapMarkerAlt size={11} />
                                            {data.shipper.address.county}, {data.shipper.address.state} - {data.shipper.address.pincode}
                                        </span>
                                    )}
                                </div>
                                <div className={styles['shipper-stat']}>
                                    <span className={styles['stat-number']}>{data.totalShipments}</span>
                                    <span className={styles['stat-label']}>Total Shipments</span>
                                </div>
                            </div>

                            {/* Shipment History */}
                            <div className={styles['shipments-section']}>
                                <h3 className={styles['section-title']}>
                                    <FaBox size={14} />
                                    <span>Shipment History ({data.shipments.length})</span>
                                </h3>

                                {data.shipments.length === 0 ? (
                                    <div className={styles['empty-state']}>
                                        <FaTruck size={40} />
                                        <p>No shipment history found for this shipper</p>
                                    </div>
                                ) : (
                                    <div className={styles['shipments-list']}>
                                        {data.shipments.map(shipment => (
                                            <div key={shipment.shippingId} className={styles['shipment-card']}>
                                                <div className={styles['shipment-header']}>
                                                    <div className={styles['shipment-status-row']}>
                                                        <span
                                                            className={styles['status-badge']}
                                                            style={{
                                                                backgroundColor: statusColors[shipment.status] || '#666'
                                                            }}
                                                        >
                                                            {statusIcons[shipment.status]}
                                                            {shipment.status.replace('_', ' ')}
                                                        </span>
                                                        <span className={styles['shipment-total']}>
                                                            ₹{shipment.totalAmount.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className={styles['shipment-dates']}>
                                                        <span className={styles['date-item']}>
                                                            <FaCalendarAlt size={10} />
                                                            Assigned: {new Date(shipment.assignedAt).toLocaleDateString()}
                                                            {' '}{new Date(shipment.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {shipment.shippedAt && (
                                                            <span className={styles['date-item']}>
                                                                <FaShippingFast size={10} />
                                                                Shipped: {new Date(shipment.shippedAt).toLocaleDateString()}
                                                                {' '}{new Date(shipment.shippedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        )}
                                                        {shipment.deliveredAt && (
                                                            <span className={styles['date-item']}>
                                                                <FaCheck size={10} />
                                                                Delivered: {new Date(shipment.deliveredAt).toLocaleDateString()}
                                                                {' '}{new Date(shipment.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className={styles['shipment-seller']}>
                                                    Seller: {shipment.sellerName}
                                                </div>

                                                <div className={styles['shipment-products']}>
                                                    <table className={styles['products-table']}>
                                                        <thead>
                                                            <tr>
                                                                <th>Product</th>
                                                                <th>Qty</th>
                                                                <th>Price/Unit</th>
                                                                <th>Total</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {shipment.products.map((item, idx) => (
                                                                <tr key={idx}>
                                                                    <td className={styles['product-name']}>{item.productName}</td>
                                                                    <td>{item.quantity}</td>
                                                                    <td>₹{item.price.toFixed(2)}</td>
                                                                    <td className={styles['product-total']}>
                                                                        ₹{(item.price * item.quantity).toFixed(2)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {shipment.notes && (
                                                    <div className={styles['shipment-notes']}>
                                                        <strong>Notes:</strong> {shipment.notes}
                                                    </div>
                                                )}

                                                <div className={styles['shipment-footer']}>
                                                    <span className={styles['order-ref']}>
                                                        Order ID: {shipment.orderId.slice(0, 12)}...
                                                    </span>
                                                    <span className={styles['seller-ref']}>
                                                        Seller: {shipment.sellerId}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShipperDetailsModal;
