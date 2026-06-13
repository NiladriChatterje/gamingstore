import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { FaBell, FaCheck, FaSpinner, FaXmark } from "react-icons/fa6";
import styles from "./ShipperNotificationBell.module.css";

interface Notification {
  id: string;
  type: string;
  sellerOrderId: string;
  orderId: string;
  sellerId: string;
  pincode: string;
  amount: number;
  products?: Array<{ productId: string; quantity: number; productName?: string }>;
  readStatus?: string;
  claimStatus?: string;
  claimed?: boolean;
  claimedBy?: string | null;
  createdAt: string;
}

const ShipperNotificationBell = () => {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const shipperId = `shipper-${user?.id}`;

  // Fetch unread count via REST (fallback/polling)
  const fetchUnreadCount = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:5004/shipper/unread-count/${shipperId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch {
      // SSE will handle real-time updates
    }
  }, [isSignedIn, shipperId, getToken]);

  // Fetch full notification list
  const fetchNotifications = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:5004/shipper/notifications/${shipperId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data || []);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, [isSignedIn, shipperId, getToken]);

  // SSE connection for real-time notifications
  useEffect(() => {
    if (!isSignedIn || !user) return;

    const eventSource = new EventSource(
      `http://localhost:4000/shipper-notifications?shipperId=${shipperId}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "new_notification" && data.data) {
          // Add new notification to the top
          setNotifications((prev) => [data.data, ...prev]);
          setUnreadCount((prev) => prev + 1);
          // Play subtle notification sound (optional)
        }
      } catch (e) {
        console.error("[NotificationBell] SSE parse error:", e);
      }
    };

    eventSource.onerror = () => {
      // Will auto-reconnect
    };

    // Initial fetch
    fetchNotifications();
    fetchUnreadCount();

    return () => {
      eventSource.close();
    };
  }, [isSignedIn, user, shipperId, fetchNotifications, fetchUnreadCount]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
    if (!dropdownOpen && unreadCount > 0) {
      // Reset unread count when opening (will be refetched)
      setUnreadCount(0);
    }
  };

  // Accept delivery claim
  const handleAcceptDelivery = async (notification: Notification) => {
    if (!notification.products?.length) {
      toast.error("Cannot claim: no products in this delivery");
      return;
    }

    setClaimingId(notification.id);
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:5004/shipper/accept-delivery`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shipperId,
          sellerOrderId: notification.sellerOrderId,
          sellerId: notification.sellerId,
          orderId: notification.orderId,
          pincode: notification.pincode,
          products: notification.products.map((p) => ({
            productId: p.productId,
            quantity: p.quantity,
          })),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Delivery claimed successfully!");
        // Update the notification locally
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id
              ? { ...n, claimed: true, claimedBy: shipperId, readStatus: "claimed" }
              : n
          )
        );
      } else if (response.status === 409) {
        const error = await response.json();
        toast.error(error.message || "Already claimed by another shipper");
        // Mark as expired locally
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, readStatus: "expired" } : n
          )
        );
      } else {
        const error = await response.text();
        toast.error("Failed to claim delivery");
        console.error("Claim error:", error);
      }
    } catch (err) {
      console.error("Error claiming delivery:", err);
      toast.error("Network error while claiming delivery");
    } finally {
      setClaimingId(null);
    }
  };

  const timeAgo = (dateStr: string): string => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (!isSignedIn) return null;

  return (
    <div className={styles.bellContainer} ref={dropdownRef}>
      <button className={styles.bellButton} onClick={toggleDropdown} aria-label="Notifications">
        <FaBell size={18} />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </button>

      {dropdownOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h3>Notifications</h3>
            <span className={styles.count}>{notifications.length}</span>
          </div>

          <div className={styles.notificationList}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>No notifications</div>
            ) : (
              notifications.slice(0, 20).map((notification) => (
                <div
                  key={notification.id}
                  className={`${styles.notificationItem} ${
                    notification.readStatus === "unread" ? styles.unread : ""
                  } ${notification.claimed ? styles.claimed : ""} ${
                    notification.readStatus === "expired" ? styles.expired : ""
                  }`}
                >
                  <div className={styles.notifContent}>
                    <div className={styles.notifTop}>
                      <span className={styles.notifType}>New Delivery</span>
                      <span className={styles.notifTime}>
                        {timeAgo(notification.createdAt)}
                      </span>
                    </div>
                    <div className={styles.notifDetails}>
                      <span>Pincode: <strong>{notification.pincode}</strong></span>
                      <span>Amount: <strong>₹{notification.amount?.toFixed(2)}</strong></span>
                      <span>Items: <strong>{notification.products?.length || 0}</strong></span>
                    </div>
                  </div>

                  {!notification.claimed && notification.readStatus !== "expired" && (
                    <button
                      className={styles.acceptBtn}
                      onClick={() => handleAcceptDelivery(notification)}
                      disabled={claimingId === notification.id}
                    >
                      {claimingId === notification.id ? (
                        <><FaSpinner className={styles.spinner} /> Claiming...</>
                      ) : (
                        <><FaCheck size={12} /> Accept</>
                      )}
                    </button>
                  )}

                  {notification.claimed && (
                    <div className={styles.claimedBadge}>
                      <FaCheck size={12} /> Claimed
                    </div>
                  )}

                  {notification.readStatus === "expired" && !notification.claimed && (
                    <div className={styles.expiredBadge}>
                      <FaXmark size={12} /> Taken
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipperNotificationBell;
