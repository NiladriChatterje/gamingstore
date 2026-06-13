import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import styles from './ShipperAssignmentModal.module.css';
import { FaTruck, FaXmark, FaPhone, FaEnvelope, FaBox, FaCheck } from 'react-icons/fa6';

interface Shipper {
    id: string;
    shippername: string;
    phone: string;
    email: string;
    address_pincode?: string;
    address_county?: string;
    address_state?: string;
}

interface ProductItem {
    product: {
        _id: string;
        _ref: string;
    };
    quantity: number;
    price: number;
}

interface ShipperAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    sellerOrderId: string;
    sellerId: string;
    orderId: string;
    pincode: string;
    products: ProductItem[];
    onAssigned: () => void;
}

const ShipperAssignmentModal = ({
    isOpen,
    onClose,
    sellerOrderId,
    sellerId,
    orderId,
    pincode,
    products,
    onAssigned
}: ShipperAssignmentModalProps) => {
    const { getToken } = useAuth();
    const [shippers, setShippers] = useState<Shipper[]>([]);
    const [selectedShipperId, setSelectedShipperId] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!isOpen) return;

        const fetchShippers = async () => {
            setFetching(true);
            try {
                const token = await getToken();
                const response = await fetch('http://localhost:5003/fetch-all-shippers', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setShippers(data || []);
                } else {
                    console.warn('Failed to fetch shippers');
                    toast.error('Failed to load shippers');
                }
            } catch (error) {
                console.error('Error fetching shippers:', error);
                toast.error('Error loading shippers');
            } finally {
                setFetching(false);
            }
        };

        fetchShippers();
        setSelectedShipperId('');
        setNotes('');
    }, [isOpen, getToken]);

    const handleAssign = async () => {
        if (!selectedShipperId) {
            toast.error('Please select a shipper');
            return;
        }

        setLoading(true);
        try {
            const token = await getToken();
            const response = await fetch('http://localhost:5003/assign-shipper', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    sellerOrderId,
                    shipperId: selectedShipperId,
                    orderId,
                    sellerId,
                    pincode,
                    products: products.map(p => ({
                        productId: p.product._id,
                        quantity: p.quantity
                    })),
                    notes: notes || undefined
                })
            });

            if (response.ok) {
                toast.success('Shipper assigned successfully');
                onAssigned();
                onClose();
            } else {
                const err = await response.json();
                toast.error(err.error || 'Failed to assign shipper');
            }
        } catch (error) {
            console.error('Error assigning shipper:', error);
            toast.error('Error assigning shipper');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles['modal-overlay']} onClick={onClose}>
            <div className={styles['modal-content']} onClick={e => e.stopPropagation()}>
                <div className={styles['modal-header']}>
                    <div className={styles['modal-title']}>
                        <FaTruck size={20} />
                        <h2>Assign Shipper</h2>
                    </div>
                    <button className={styles['close-btn']} onClick={onClose}>
                        <FaXmark size={18} />
                    </button>
                </div>

                <div className={styles['modal-body']}>
                    {/* Products to Ship */}
                    <div className={styles['section']}>
                        <h3>
                            <FaBox size={14} />
                            <span>Products to Ship</span>
                        </h3>
                        <div className={styles['products-list']}>
                            {products.map((p, idx) => (
                                <div key={idx} className={styles['product-item']}>
                                    <span className={styles['product-id']}>
                                        Product: {p.product._id.slice(0, 8)}...
                                    </span>
                                    <span className={styles['product-qty']}>
                                        Qty: <strong>{p.quantity}</strong>
                                    </span>
                                    <span className={styles['product-price']}>
                                        ₹{(p.price * p.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Select Shipper */}
                    <div className={styles['section']}>
                        <h3>
                            <FaTruck size={14} />
                            <span>Select Shipper</span>
                        </h3>
                        {fetching ? (
                            <div className={styles['loading']}>Loading shippers...</div>
                        ) : shippers.length === 0 ? (
                            <div className={styles['empty']}>No shippers available</div>
                        ) : (
                            <div className={styles['shipper-grid']}>
                                {shippers.map(shipper => (
                                    <div
                                        key={shipper.id}
                                        className={`${styles['shipper-card']} ${
                                            selectedShipperId === shipper.id ? styles['selected'] : ''
                                        }`}
                                        onClick={() => setSelectedShipperId(shipper.id)}
                                    >
                                        <div className={styles['shipper-check']}>
                                            {selectedShipperId === shipper.id && <FaCheck size={12} />}
                                        </div>
                                        <div className={styles['shipper-info']}>
                                            <span className={styles['shipper-name']}>{shipper.shippername}</span>
                                            <span className={styles['shipper-detail']}>
                                                <FaPhone size={10} /> {shipper.phone}
                                            </span>
                                            <span className={styles['shipper-detail']}>
                                                <FaEnvelope size={10} /> {shipper.email}
                                            </span>
                                            {shipper.address_county && (
                                                <span className={styles['shipper-detail']}>
                                                    {shipper.address_county}, {shipper.address_state}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div className={styles['section']}>
                        <h3>Notes (Optional)</h3>
                        <textarea
                            className={styles['notes-input']}
                            placeholder="Add any special instructions for the shipper..."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>

                <div className={styles['modal-footer']}>
                    <button className={styles['cancel-btn']} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={styles['assign-btn']}
                        onClick={handleAssign}
                        disabled={loading || !selectedShipperId}
                    >
                        {loading ? 'Assigning...' : 'Assign Shipper'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShipperAssignmentModal;
