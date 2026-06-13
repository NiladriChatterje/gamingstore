import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { MdLocalShipping, MdCheckCircle, MdPendingActions } from "react-icons/md";
import { FaTruck, FaBoxOpen } from "react-icons/fa";
import { IoTimeOutline } from "react-icons/io5";
import styles from "./ShipperDashboard.module.css";

interface DashboardStats {
  pending: number;
  inTransit: number;
  delivered: number;
}

interface RecentOrder {
  _id: string;
  orderId: string;
  customer?: { username?: string };
  status: string;
  createdAt?: string;
}

const ShipperDashboard = () => {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ pending: 0, inTransit: 0, delivered: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn || !user) return;

    const fetchData = async () => {
      try {
        const token = await getToken();
        const shipperId = `shipper-${user.id}`;

        const statsRes = await fetch(
          `http://localhost:5004/shipper-dashboard-stats/${shipperId}`,
          { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } }
        );
        if (statsRes.ok) {
          const data: DashboardStats = await statsRes.json();
          setStats(data);
        }

        const ordersRes = await fetch(
          `http://localhost:5004/fetch-shipper-orders/${shipperId}`,
          { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } }
        );
        if (ordersRes.ok) {
          const data: RecentOrder[] = await ordersRes.json();
          setRecentOrders(data.slice(0, 5));
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isSignedIn, user, getToken]);

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const statCards = [
    { icon: MdPendingActions, label: "Pending Pickup", value: stats.pending, iconClass: styles.statIconPending, change: "Awaiting collection" },
    { icon: MdLocalShipping, label: "In Transit", value: stats.inTransit, iconClass: styles.statIconTransit, change: "On the move" },
    { icon: MdCheckCircle, label: "Delivered", value: stats.delivered, iconClass: styles.statIconDelivered, change: "Completed" },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>Welcome back, {user?.firstName || "Shipper"}! Here's your delivery overview.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingGrid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeleton}>
              <div className={styles.skeletonBar} style={{ width: "40%" }} />
              <div className={`${styles.skeletonBar} ${styles.skeletonBarTall}`} />
              <div className={`${styles.skeletonBar} ${styles.skeletonBarShort}`} />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.statsGrid}>
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div className={`${styles.statIcon} ${card.iconClass}`}><Icon /></div>
                  <span className={styles.statChange}>{card.change}</span>
                </div>
                <p className={styles.statValue}>{card.value}</p>
                <p className={styles.statLabel}>{card.label}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.quickActions}>
        <h2 className={styles.sectionTitle}><FaTruck /> Quick Actions</h2>
        <div className={styles.actionsGrid}>
          <button className={styles.actionBtn} onClick={() => navigate("/shipper/in-transit")}>
            <MdLocalShipping className={styles.actionBtnIcon} /> View Active Deliveries
          </button>
          <button className={styles.actionBtn} onClick={() => navigate("/shipper/delivered")}>
            <MdCheckCircle className={styles.actionBtnIcon} /> View Delivery History
          </button>
        </div>
      </div>

      <div className={styles.recentSection}>
        <h2 className={styles.sectionTitle}><IoTimeOutline /> Recent Activity</h2>
        {loading ? (
          <div className={styles.emptyState}><p>Loading recent orders...</p></div>
        ) : recentOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><FaBoxOpen /></div>
            <p>No active deliveries yet. New orders will appear here once assigned.</p>
          </div>
        ) : (
          <div className={styles.recentList}>
            {recentOrders.map((order) => (
              <div key={order._id} className={styles.recentItem} onClick={() => navigate(`/shipper/orders/${order.orderId}`)}>
                <span className={`${styles.recentDot} ${order.status === "shipped" ? styles.recentDotDelivered : (order.status === "shipping" || order.status === "dispatched") ? styles.recentDotTransit : styles.recentDotPending}`} />
                <div className={styles.recentInfo}>
                  <p className={styles.recentOrderId}>Order #{order.orderId}</p>
                  <p className={styles.recentCustomer}>{order.customer?.username || "Unknown customer"}</p>
                </div>
                <span className={styles.recentTime}>{formatTime(order.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipperDashboard;