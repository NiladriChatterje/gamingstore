import styles from './Delivery.module.css'
import { OrderType } from '@/declarations/OrderType';

interface DeliveryItemProps {
    item: OrderType;
    isDelivered?: boolean;
}

const DeliveryItem = ({ item, isDelivered = false }: DeliveryItemProps) => {
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get the first product from the order
    const firstProduct = item?.product?.[0];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'orderPlaced':
                return '#FFA500';
            case 'dispatched':
                return '#2196F3';
            case 'shipping':
                return '#FF9800';
            case 'shipped':
                return '#4CAF50';
            default:
                return '#666';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'orderPlaced':
                return 'Order Placed';
            case 'dispatched':
                return 'Dispatched';
            case 'shipping':
                return 'In Transit';
            case 'shipped':
                return 'Shipped';
            default:
                return status;
        }
    };

    return (
        <section className={styles['delivery-items']}>
            <figure className={styles['delivery-items-figure']}>
                {firstProduct?.imagesBase64 && firstProduct.imagesBase64.length > 0 && (
                    <img
                        width={50}
                        height={50}
                        src={firstProduct.imagesBase64[0].base64}
                        alt={firstProduct.productName}
                        style={{ objectFit: 'cover', borderRadius: '4px' }}
                    />
                )}
                <div className={styles['product-info']}>
                    <span className={styles['product-name']}>
                        {firstProduct?.productName || 'Unknown Product'}
                    </span>
                    <span className={styles['order-id']}>
                        Order ID: {item.orderId}
                    </span>
                </div>
            </figure>

            <section className={styles['delivery-details']}>
                <div className={styles['status-info']}>
                    <span
                        className={styles['status-badge']}
                        style={{ backgroundColor: getStatusColor(item.status) }}
                    >
                        {getStatusText(item.status)}
                    </span>
                    <span className={styles['quantity']}>
                        Qty: {item.quantity}
                    </span>
                </div>

                <div className={styles['date-info']}>
                    <span className={styles['order-date']}>
                        Ordered: {formatDate(item.createdAt)}
                    </span>
                    {item.expectedDelivery && (
                        <span className={styles['delivery-date']}>
                            {isDelivered ? 'Delivered' : 'Expected'}: {formatDate(item.expectedDelivery)}
                        </span>
                    )}
                </div>

                <div className={styles['amount-info']}>
                    <span className={styles['amount']}>
                        ₹{item.amount.toLocaleString('en-IN')}
                    </span>
                </div>
            </section>
        </section>
    )
}

export default DeliveryItem;