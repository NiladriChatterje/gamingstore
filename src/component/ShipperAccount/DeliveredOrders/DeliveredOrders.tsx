import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { MdSearch } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import styles from "./DeliveredOrders.module.css";
import { OrderType } from "@declarations/OrderType";

const DeliveredOrders = () => {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isSignedIn || !user) return;

    const fetchDeliveredOrders = async () => {
      try {
        const token = await getToken();
        const shipperId = `shipper-${user.id}`;
        const response = await fetch(
          `http://localhost:5004/fetch-delivered-orders/${shipperId}`,
          { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } }
        );
        if (response.ok) {
          const data: OrderType[] = await response.json();
          setOrders(data);
        }
      } catch (err) {
        console.error("Error fetching delivered orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveredOrders();
  }, [isSignedIn, user, getToken]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter(
      (o) => o.orderId.toLowerCase().includes(q) || o.customer?.username?.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Delivered Orders</h1>
          <p className={styles.subtitle}>{filteredOrders.length} completed deliver{filteredOrders.length !== 1 ? "ies" : "y"}</p>
        </div>
        <div className={styles.searchBar}>
          <MdSearch className={styles.searchIcon} />
          <input type="text" className={styles.searchInput} placeholder="Search by order ID or customer..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeleton}>
              <div className={`${styles.skeletonBar} ${styles.skeletonBarMedium}`} />
              <div className={`${styles.skeletonBar} ${styles.skeletonBarWide}`} />
              <div className={`${styles.skeletonBar} ${styles.skeletonBarNarrow}`} />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><FaCheckCircle /></div>
          <p className={styles.emptyStateTitle}>{searchQuery ? "No matching deliveries" : "No delivered orders yet"}</p>
          <p className={styles.emptyStateText}>{searchQuery ? "Try a different search term" : "Completed deliveries will show up here"}</p>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {filteredOrders.map((order) => (
            <div key={order._id} className={styles.orderCard} onClick={() => navigate(`/shipper/orders/${order.orderId}`)}>
              <div className={styles.orderTop}>
                <h3 className={styles.orderId}>Order #{order.orderId}</h3>
                <span className={styles.statusBadge}>Delivered</span>
              </div>
              <div className={styles.orderBody}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Customer</span>
                  <span className={styles.detailValue}>{order.customer?.username || "N/A"}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Amount</span>
                  <span className={styles.detailValue}>₹{order.amount?.toLocaleString() || "N/A"}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Items</span>
                  <span className={styles.detailValue}>{order.quantity} item{order.quantity !== 1 ? "s" : ""}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Delivered On</span>
                  <span className={styles.detailValue}><span className={styles.deliveryDate}>{formatDate(order.updatedAt || order.createdAt)}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveredOrders;