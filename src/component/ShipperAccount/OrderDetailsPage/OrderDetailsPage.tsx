import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { divIcon, LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";
import styles from "./OrderDetailsPage.module.css";
import { OrderType } from "@declarations/OrderType";
import { FaArrowLeft, FaMapMarkerAlt, FaTruck, FaPhone, FaExclamationTriangle } from "react-icons/fa";
import { MdGpsFixed, MdRefresh } from "react-icons/md";
import { IoCheckmarkCircle } from "react-icons/io5";

const shipperIcon = divIcon({
  className: "custom-marker-icon",
  html: `
    <div style="background-color: #1e1c29; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #6366f1; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
      <span style="font-size: 16px; color: white;">🚚</span>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

const deliveryIcon = divIcon({
  className: "custom-marker-icon",
  html: `
    <div style="background-color: #059669; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #34d399; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
      <span style="font-size: 16px; color: white;">📍</span>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

const OrderDetailsPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [orderDetails, setOrderDetails] = useState<OrderType | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationActive, setLocationActive] = useState(false);
  const [markingDelivered, setMarkingDelivered] = useState(false);
  const locationWatchIdRef = useRef<number | null>(null);
  const locationUpdateIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`http://localhost:5004/fetch-user-order/${orderId}`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data: OrderType = await response.json();
          setOrderDetails(data);
        } else {
          setOrderDetails(null);
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        toast.error("Failed to load order details");
        setOrderDetails(null);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrderDetails();
    else setLoading(false);
  }, [orderId, getToken]);

  const sendLocationUpdate = useCallback(async (lat: number, lng: number) => {
    if (!user) return;
    const token = await getToken();
    const shipperId = `shipper-${user.id}`;
    try {
      await fetch("http://localhost:5004/update-shipper-location", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shipperId, location: { lat, lng } }),
      });
    } catch (err) {
      console.error("Error sending location:", err);
    }
  }, [user, getToken]);

  // WebSocket connection for live location broadcasting
  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = useCallback((orderId: string, shipperId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    try {
      const ws = new WebSocket('ws://localhost:4000/ws');
      ws.onopen = () => {
        console.log('[WS] Shipper connected to live location service');
        ws.send(JSON.stringify({ type: 'shipper:register', shipperId, orderId }));
      };
      ws.onerror = (err) => console.error('[WS] Error:', err);
      ws.onclose = () => console.log('[WS] Shipper disconnected');
      wsRef.current = ws;
    } catch (err) {
      console.error('[WS] Failed to connect:', err);
    }
  }, []);

  const sendLocationViaWebSocket = useCallback((shipperId: string, orderId: string, lat: number, lng: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'shipper:location-update',
        shipperId,
        orderId,
        lat,
        lng,
      }));
    }
  }, []);

  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported by your browser");
      return;
    }
    if (!orderId) return;
    if (locationWatchIdRef.current !== null) navigator.geolocation.clearWatch(locationWatchIdRef.current);
    if (locationUpdateIntervalRef.current !== null) clearInterval(locationUpdateIntervalRef.current);
    setLocationError(null);
    setLocationActive(false);

    const shipperId = `shipper-${user?.id}`;

    // Open WebSocket connection for live location
    connectWebSocket(orderId, shipperId);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setLocationActive(true);
        setLocationError(null);
        sendLocationUpdate(latitude, longitude);
        sendLocationViaWebSocket(shipperId, orderId, latitude, longitude);

        const watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
            setLocationActive(true);
            setLocationError(null);
            sendLocationViaWebSocket(shipperId, orderId!, latitude, longitude);
          },
          (err) => {
            setLocationError(err.code === err.PERMISSION_DENIED ? "Location permission denied." : "Unable to get precise location.");
          },
          { enableHighAccuracy: true, timeout: 30000, maximumAge: 5000 }
        );
        locationWatchIdRef.current = watchId;
        locationUpdateIntervalRef.current = window.setInterval(() => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              sendLocationUpdate(latitude, longitude);
              sendLocationViaWebSocket(shipperId, orderId!, latitude, longitude);
            },
            () => {},
            { enableHighAccuracy: true, timeout: 15000 }
          );
        }, 30000);
      },
      (err) => {
        setLocationError(err.code === err.PERMISSION_DENIED ? "Location permission denied." : "Could not get current location.");
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 5000 }
    );
  }, [sendLocationUpdate]);

  useEffect(() => {
    startLocationTracking();
    return () => {
      if (locationWatchIdRef.current !== null) navigator.geolocation.clearWatch(locationWatchIdRef.current);
      if (locationUpdateIntervalRef.current !== null) clearInterval(locationUpdateIntervalRef.current);
      // Close WebSocket connection
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [startLocationTracking]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!currentLocation || !orderDetails?.customer?.geoPoint) return;
      try {
        const start = `${currentLocation.lng},${currentLocation.lat}`;
        const end = `${orderDetails.customer.geoPoint.lng},${orderDetails.customer.geoPoint.lat}`;
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`);
        if (!response.ok) return;
        const data = await response.json();
        if (data.routes?.length > 0) {
          setRouteCoordinates(data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]));
        }
      } catch {
        setRouteCoordinates([[currentLocation.lat, currentLocation.lng], [orderDetails!.customer!.geoPoint!.lat, orderDetails!.customer!.geoPoint!.lng]] as [number, number][]);
      }
    };
    fetchRoute();
  }, [currentLocation, orderDetails]);

  const handleMarkAsDelivered = async () => {
    if (!orderId) return;
    setMarkingDelivered(true);
    try {
      const token = await getToken();
      const response = await fetch("http://localhost:5004/update-order-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId, status: "shipped" }),
      });
      if (response.ok) {
        toast.success("Order marked as delivered!");
        navigate("/shipper/delivered");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to mark as delivered");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setMarkingDelivered(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className={styles.page}>
        <div className={styles.errorContainer}>
          <FaExclamationTriangle size={48} style={{ color: "#dc2626", opacity: 0.5 }} />
          <h2 className={styles.errorTitle}>Order not found</h2>
          <button className={styles.errorBtn} onClick={() => navigate("/shipper/in-transit")}>Back to Orders</button>
        </div>
      </div>
    );
  }

  const { customer } = orderDetails;
  const destination = customer?.geoPoint;

  const getStatusChipClass = (status: string) => {
    switch (status) {
      case "orderPlaced": return styles.statusChipOrderPlaced;
      case "dispatched": return styles.statusChipDispatched;
      case "shipping": return styles.statusChipShipping;
      case "shipped": return styles.statusChipShipped;
      default: return "";
    }
  };

  return (
    <div className={styles.page}>
      <button className={styles.backNav} onClick={() => navigate("/shipper/in-transit")}>
        <FaArrowLeft /> Back to Orders
      </button>

      <div className={styles.headerCard}>
        <div className={styles.headerRow}>
          <div className={styles.headerInfo}>
            <h1 className={styles.headerTitle}>Order #{orderDetails.orderId}</h1>
            <span className={styles.headerMeta}>
              Created on {new Date(orderDetails.createdAt || "").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
          <span className={`${styles.statusChip} ${getStatusChipClass(orderDetails.status)}`}>{orderDetails.status}</span>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        {locationError ? (
          <div className={`${styles.locationBanner} ${styles.locationBannerError}`}>
            <MdGpsFixed className={styles.locationBannerIcon} />
            <div className={styles.locationBannerText}>
              <p className={styles.locationBannerTitle}>Location Tracking Error</p>
              <p className={styles.locationBannerDesc}>{locationError}</p>
            </div>
            <button className={styles.locationRetryBtn} onClick={startLocationTracking}><MdRefresh style={{ marginRight: 4 }} /> Retry</button>
          </div>
        ) : locationActive ? (
          <div className={`${styles.locationBanner} ${styles.locationBannerActive}`}>
            <MdGpsFixed className={styles.locationBannerIcon} />
            <div className={styles.locationBannerText}>
              <p className={styles.locationBannerTitle}>Live Location Sharing Active</p>
              <p className={styles.locationBannerDesc}>Your location is being shared with the platform in real-time.</p>
            </div>
          </div>
        ) : (
          <div className={`${styles.locationBanner} ${styles.locationBannerLoading}`}>
            <MdGpsFixed className={styles.locationBannerIcon} />
            <div className={styles.locationBannerText}>
              <p className={styles.locationBannerTitle}>Getting GPS Location...</p>
              <p className={styles.locationBannerDesc}>Please ensure location permissions are enabled</p>
            </div>
          </div>
        )}
      </div>

      {destination && (
        <div className={styles.mapSection}>
          <div className={styles.mapHeader}>
            <h2 className={styles.mapTitle}><FaMapMarkerAlt style={{ color: "#059669" }} /> Live Tracking</h2>
            <span className={styles.mapCoords}>{currentLocation ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : "Locating..."}</span>
          </div>
          <div className={styles.mapContainer}>
            <MapContainer
              center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [destination.lat, destination.lng]}
              zoom={13} className={styles.map} style={{ height: "100%", width: "100%" }}
              bounds={routeCoordinates.length > 0 ? routeCoordinates as LatLngBoundsExpression : undefined}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
              {currentLocation && (
                <Marker position={[currentLocation.lat, currentLocation.lng]} icon={shipperIcon}>
                  <Popup><strong>Your Location</strong><br />Delivery in progress</Popup>
                </Marker>
              )}
              <Marker position={[destination.lat, destination.lng]} icon={deliveryIcon}>
                <Popup><strong>Destination</strong><br />{customer?.username}<br />{customer?.address?.county}, {customer?.address?.state}</Popup>
              </Marker>
              {routeCoordinates.length > 0 && (
                <Polyline positions={routeCoordinates} pathOptions={{ color: "#6366f1", weight: 4, opacity: 0.7 }} />
              )}
            </MapContainer>
          </div>
        </div>
      )}

      <div className={styles.infoGrid}>
        <div className={styles.infoCard}>
          <h2 className={styles.infoCardTitle}>Order Information</h2>
          <div className={styles.infoRows}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Order ID</span>
              <span className={styles.infoValue}>#{orderDetails.orderId}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Transaction</span>
              <span className={styles.infoValue} style={{ fontSize: "0.78rem" }}>{orderDetails.transactionId}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Status</span>
              <span className={styles.infoValue}>
                <span className={`${styles.statusChip} ${getStatusChipClass(orderDetails.status)}`} style={{ fontSize: "0.72rem", padding: "3px 10px" }}>{orderDetails.status}</span>
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Quantity</span>
              <span className={styles.infoValue}>{orderDetails.quantity} items</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Amount</span>
              <span className={styles.infoValue}>₹{orderDetails.amount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {customer && (
          <div className={styles.infoCard}>
            <h2 className={styles.infoCardTitle}>Customer Information</h2>
            <div className={styles.infoRows}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Name</span>
                <span className={styles.infoValue}>{customer.username}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoValue} style={{ fontSize: "0.8rem" }}>{customer.email}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Phone</span>
                <span className={styles.infoValue}>{customer.phone || "N/A"}</span>
              </div>
              {customer.address && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Address</span>
                  <span className={styles.infoValue}>{customer.address.county}, {customer.address.state}<br />{customer.address.country} - {customer.address.pincode}</span>
                </div>
              )}
              {customer.geoPoint && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Coordinates</span>
                  <span className={styles.infoValue}>{customer.geoPoint.lat.toFixed(4)}, {customer.geoPoint.lng.toFixed(4)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}
          onClick={handleMarkAsDelivered} disabled={markingDelivered || orderDetails.status === "shipped"}>
          <IoCheckmarkCircle size={18} /> {markingDelivered ? "Marking..." : "Mark as Delivered"}
        </button>
        {customer?.phone && (
          <a href={`tel:${customer.phone}`} className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} style={{ textDecoration: "none" }}>
            <FaPhone size={14} /> Contact Customer
          </a>
        )}
        <button className={`${styles.actionBtn} ${styles.actionBtnOutline}`} onClick={() => {
          navigator.geolocation.getCurrentPosition(
            (pos) => window.open(`https://www.google.com/maps/dir/${pos.coords.latitude},${pos.coords.longitude}/${destination?.lat},${destination?.lng}`, "_blank"),
            () => { if (destination) window.open(`https://www.google.com/maps/dir//${destination.lat},${destination.lng}`, "_blank"); }
          );
        }}>
          <FaTruck size={14} /> Open in Google Maps
        </button>
      </div>
    </div>
  );
};

export default OrderDetailsPage;