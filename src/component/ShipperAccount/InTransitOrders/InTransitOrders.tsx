import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { MdSearch, MdLocalShipping } from "react-icons/md";
import { FaBoxOpen } from "react-icons/fa";
import toast from "react-hot-toast";
import styles from "./InTransitOrders.module.css";
import { OrderType } from "@declarations/OrderType";

const InTransitOrders = () => {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!isSignedIn || !user) return;

    const fetchOrders = async () => {
      try {
        const token = await getToken();
        const shipperId = `shipper-${user.id}`;
        const response = await fetch(
          `http://localhost:5004/fetch-shipper-orders/${shipperId}`,
          { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } }
        );
        if (response.ok) {
          const data: OrderType[] = await response.json();
          setOrders(data);
        }
      } catch (err) {
        console.error("Error fetching in-transit orders:", err);
        toast.error("Failed to load in-transit orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isSignedIn, user, getToken]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        !searchQuery ||
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer?.username?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return counts;
  }, [orders]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "dispatched": return styles.statusDispatched;
      case "shipping": return styles.statusShipping;
      case "shipped": return styles.statusShipped;
      default: return "";
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>In-Transit Orders</h1>
          <p className={styles.subtitle}>{filteredOrders.length} active deliver{filteredOrders.length !== 1 ? "ies" : "y"}</p>
        </div>
        <div className={styles.searchBar}>
          <MdSearch className={styles.searchIcon} />
          <input type="text" className={styles.searchInput} placeholder="Search by order ID or customer..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className={styles.filters}>
        {["all", "dispatched", "shipping"].map((status) => (
          <button key={status}
            className={`${styles.filterBtn} ${statusFilter === status ? styles.filterBtnActive : ""}`}
            onClick={() => setStatusFilter(status)}>
            {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
            {statusCounts[status] ? ` (${statusCounts[status]})` : ""}
          </button>
        ))}
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
          <div className={styles.emptyIcon}><FaBoxOpen /></div>
          <p className={styles.emptyStateTitle}>{searchQuery ? "No matching orders" : "No orders in transit"}</p>
          <p className={styles.emptyStateText}>{searchQuery ? "Try a different search or filter" : "New delivery assignments will appear here"}</p>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {filteredOrders.map((order) => (
            <div key={order._id} className={styles.orderCard} onClick={() => navigate(`/shipper/orders/${order.orderId}`)}>
              <div className={styles.orderTop}>
                <h3 className={styles.orderId}>Order #{order.orderId}</h3>
                <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>{order.status}</span>
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
                  <span className={styles.detailLabel}>Destination</span>
                  <span className={styles.detailValue}>{order.customer?.address ? `${order.customer.address.county}, ${order.customer.address.state}` : "N/A"}</span>
                </div>
              </div>
              <div className={styles.orderActions}>
                <button className={styles.btnPrimary} onClick={(e) => { e.stopPropagation(); navigate(`/shipper/orders/${order.orderId}`); }}>
                  <MdLocalShipping style={{ marginRight: 6 }} /> Track Delivery
                </button>
                <button className={styles.btnSecondary} onClick={(e) => { e.stopPropagation(); navigate(`/shipper/orders/${order.orderId}`); }}>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InTransitOrders;