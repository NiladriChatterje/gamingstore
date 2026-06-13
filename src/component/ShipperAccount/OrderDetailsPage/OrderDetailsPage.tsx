import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SignIn, useUser, useAuth } from "@clerk/clerk-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { divIcon, LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";
import styles from "./OrderDetailsPage.module.css";
import { OrderType } from "@declarations/OrderType";
import { FaArrowsRotate } from "react-icons/fa6";

// Custom marker icons using divIcon for better React compatibility
const shipperIcon = divIcon({
    className: 'custom-marker-icon',
    html: `
        <div style="
            background-color: #202020ff;
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <span style="
                transform: rotate(45deg);
                font-size: 18px;
                color: white;
            ">🚚</span>
        </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const deliveryIcon = divIcon({
    className: 'custom-marker-icon',
    html: `
        <div style="
            background-color: #e3a366ff;
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <span style="
                transform: rotate(45deg);
                font-size: 18px;
                color: white;
            ">📍</span>
        </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const OrderDetailsPage = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { isSignedIn, user } = useUser();

    const [orderDetails, setOrderDetails] = useState<OrderType | null>(null);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
    const [loading, setLoading] = useState(true);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [markingDelivered, setMarkingDelivered] = useState(false);
    const locationWatchIdRef = useRef<number | null>(null);
    const locationUpdateIntervalRef = useRef<number | null>(null);
    const { getToken } = useAuth();

    // Fetch real order data from backend
    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const token = await getToken();
                const response = await fetch(`http://localhost:5004/fetch-user-order/${orderId}`, {
                    headers: {
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data: OrderType = await response.json();
                    setOrderDetails(data);
                } else {
                    console.error('Failed to fetch order details, status:', response.status);
                    setOrderDetails(null);
                }
            } catch (err) {
                console.error('Error fetching order details:', err);
                toast.error('Failed to load order details');
                setOrderDetails(null);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetails();
        } else {
            setLoading(false);
        }
    }, [orderId, getToken]);

    // Function to send location update to backend
    const sendLocationUpdate = useCallback(async (lat: number, lng: number) => {
        if (!user) return;
        
        const token = await getToken();
        const shipperId = `shipper-${user.id}`;
        try {
            await fetch('http://localhost:5004/update-shipper-location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    shipperId,
                    location: { lat, lng }
                })
            });
        } catch (err) {
            console.error('Error sending location update:', err);
        }
    }, [user, getToken]);

    // Function to start watching location
    const startLocationWatch = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser");
            return;
        }

        // Clear any existing watch
        if (locationWatchIdRef.current !== null) {
            navigator.geolocation.clearWatch(locationWatchIdRef.current);
            locationWatchIdRef.current = null;
        }
        if (locationUpdateIntervalRef.current !== null) {
            clearInterval(locationUpdateIntervalRef.current);
            locationUpdateIntervalRef.current = null;
        }

        setLocationError(null);

        // First, try to get current position to establish initial location
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentLocation({ lat: latitude, lng: longitude });
                setLocationError(null);
                
                // Send initial location to backend
                sendLocationUpdate(latitude, longitude);

                // Now start watching for continuous updates
                const watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setCurrentLocation({ lat: latitude, lng: longitude });
                        setLocationError(null);
                    },
                    (error) => {
                        console.error("Watch position error:", error);
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                setLocationError("Location permission denied.");
                                break;
                            case error.POSITION_UNAVAILABLE:
                                setLocationError("Location unavailable.");
                                break;
                            case error.TIMEOUT:
                                setLocationError("Location request timed out.");
                                break;
                            default:
                                setLocationError(`Error: ${error.message}`);
                        }
                    },
                    { enableHighAccuracy: true, timeout: 30000, maximumAge: 5000 }
                );
                locationWatchIdRef.current = watchId;

                // Send location updates to backend every 30 seconds
                locationUpdateIntervalRef.current = window.setInterval(() => {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => sendLocationUpdate(pos.coords.latitude, pos.coords.longitude),
                        () => {},
                        { enableHighAccuracy: true, timeout: 15000 }
                    );
                }, 30000);
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationError("Location permission denied.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setLocationError("Location unavailable.");
                        break;
                    case error.TIMEOUT:
                        setLocationError("Location request timed out.");
                        break;
                    default:
                        setLocationError(`Error: ${error.message}`);
                }
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 5000 }
        );
    }, [sendLocationUpdate]);

    // Watch shipper's real-time GPS location
    useEffect(() => {
        startLocationWatch();

        return () => {
            if (locationWatchIdRef.current !== null) {
                navigator.geolocation.clearWatch(locationWatchIdRef.current);
                locationWatchIdRef.current = null;
            }
            if (locationUpdateIntervalRef.current !== null) {
                clearInterval(locationUpdateIntervalRef.current);
                locationUpdateIntervalRef.current = null;
            }
        };
    }, [startLocationWatch]);

    // Fetch route coordinates from OSRM routing service
    useEffect(() => {
        const fetchRoute = async () => {
            if (!currentLocation || !orderDetails?.customer?.geoPoint) {
                return;
            }

            try {
                const start = `${currentLocation.lng},${currentLocation.lat}`;
                const end = `${orderDetails.customer.geoPoint.lng},${orderDetails.customer.geoPoint.lat}`;

                const response = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`
                );

                if (!response.ok) return;

                const data = await response.json();

                if (data.routes && data.routes.length > 0) {
                    const coordinates = data.routes[0].geometry.coordinates.map(
                        (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
                    );
                    setRouteCoordinates(coordinates);
                }
            } catch (error) {
                console.error('Error fetching route:', error);
                // Fallback to straight line
                const fallbackRoute = [
                    [currentLocation.lat, currentLocation.lng],
                    [orderDetails.customer.geoPoint.lat, orderDetails.customer.geoPoint.lng]
                ];
                setRouteCoordinates(fallbackRoute as [number, number][]);
            }
        };

        fetchRoute();
    }, [currentLocation, orderDetails]);

    // Handle Mark as Delivered
    const handleMarkAsDelivered = async () => {
        if (!orderId) return;
        
        setMarkingDelivered(true);
        try {
            const token = await getToken();
            const response = await fetch('http://localhost:5004/update-order-status', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    orderId,
                    status: 'shipped'
                })
            });

            if (response.ok) {
                toast.success('Order marked as delivered!');
                navigate('/shipper/delivered');
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to mark as delivered');
            }
        } catch (err) {
            console.error('Error marking as delivered:', err);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setMarkingDelivered(false);
        }
    };

    if (!isSignedIn) {
        return (
            <section
                style={{
                    width: '100%', height: '90dvh',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}
            >
                <SignIn redirectUrl={'/shipper/in-transit'} />
            </section>
        );
    }

    if (loading) {
        return (
            <div className={styles["loading-container"]}>
                <div className={styles["spinner"]}></div>
                <p>Loading order details...</p>
            </div>
        );
    }

    if (!orderDetails) {
        return (
            <div className={styles["error-container"]}>
                <h2>Order not found</h2>
                <button onClick={() => navigate("/shipper/in-transit")}>
                    Back to Orders
                </button>
            </div>
        );
    }

    const { customer } = orderDetails;
    const destination = customer?.geoPoint;

    return (
        <div className={styles["details-container"]}>
            <div className={styles["header"]}>
                <button
                    className={styles["back-button"]}
                    onClick={() => navigate("/shipper/in-transit")}
                >
                    ← Back to Orders
                </button>
                <h1>Order Details - #{orderDetails.orderId}</h1>
                <span className={styles[`status-${orderDetails.status}`]}>
                    {orderDetails.status.toUpperCase()}
                </span>
            </div>

            {/* Location Status Banner */}
            {locationError ? (
                <div className={styles["location-error-banner"]} style={{
                    backgroundColor: '#9574744f',
                    border: '2px dashed #b63c3cff',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    margin: '16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div>
                            <strong style={{ color: '#991b1b' }}>Location Tracking Error</strong>
                            <p style={{ margin: '4px 0 0 0', color: '#991b1b' }}>{locationError}</p>
                        </div>
                    </div>
                    <button
                        onClick={startLocationWatch}
                        style={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <FaArrowsRotate size={25} />
                    </button>
                </div>
            ) : !currentLocation && (
                <div className={styles["location-loading-banner"]} style={{
                    backgroundColor: '#fef3c77e',
                    border: '2px dashed #f59e0b',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    margin: '16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div>
                        <strong style={{ color: '#92400e' }}>Getting GPS Location...</strong>
                        <p style={{ margin: '4px 0 0 0', color: '#92400e' }}>Please ensure location permissions are enabled</p>
                    </div>
                </div>
            )}

            {/* Real-time Map Section */}
            {destination && (
                <div className={styles["map-section"]}>
                    <div className={`${styles["map-container"]} ${styles["glowing-route-container"]}`}>
                        <MapContainer
                            center={
                                currentLocation
                                    ? [currentLocation.lat, currentLocation.lng]
                                    : [destination.lat, destination.lng]
                            }
                            zoom={12}
                            className={styles["map"]}
                            style={{ height: "100%", width: "100%" }}
                            bounds={routeCoordinates.length > 0 ? routeCoordinates as LatLngBoundsExpression : undefined}
                        >
                            <TileLayer url="https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png" />

                            {currentLocation && (
                                <Marker
                                    position={[currentLocation.lat, currentLocation.lng]}
                                    icon={shipperIcon}
                                >
                                    <Popup>
                                        <strong>Current Location</strong>
                                        <br />
                                        Delivery in progress
                                    </Popup>
                                </Marker>
                            )}

                            <Marker
                                position={[destination.lat, destination.lng]}
                                icon={deliveryIcon}
                            >
                                <Popup>
                                    <strong>Destination</strong>
                                    <br />
                                    {customer?.username}
                                    <br />
                                    {customer?.address?.county}, {customer?.address?.state}
                                </Popup>
                            </Marker>

                            {routeCoordinates.length > 0 ? (
                                <>
                                    <Polyline
                                        positions={routeCoordinates}
                                        pathOptions={{ color: "#ff8c42", weight: 2, opacity: 0.3 }}
                                    />
                                    <Polyline
                                        positions={routeCoordinates}
                                        pathOptions={{ color: "#ff8c42", weight: 4, opacity: 0.6 }}
                                    />
                                    <Polyline
                                        positions={routeCoordinates}
                                        pathOptions={{ color: "#ffb84dff", weight: 0.5, opacity: 1 }}
                                    />
                                </>
                            ) : (
                                <div style={{
                                    position: 'absolute', top: 10, left: 10,
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    padding: '8px 12px', borderRadius: '4px',
                                    zIndex: 1000, fontSize: '12px', color: '#666'
                                }}>
                                    Loading route...
                                </div>
                            )}
                        </MapContainer>
                    </div>
                </div>
            )}

            {/* Order Information Grid */}
            <div className={styles["info-grid"]}>
                <div className={styles["info-card"]}>
                    <h2>Order Information</h2>
                    <div className={styles["info-content"]}>
                        <div className={styles["info-row"]}>
                            <span className={styles["label"]}>Order ID:</span>
                            <span className={styles["value"]}>#{orderDetails.orderId}</span>
                        </div>
                        <div className={styles["info-row"]}>
                            <span className={styles["label"]}>Transaction ID:</span>
                            <span className={styles["value"]}>{orderDetails.transactionId}</span>
                        </div>
                        <div className={styles["info-row"]}>
                            <span className={styles["label"]}>Status:</span>
                            <span className={styles["value"]}>
                                <span className={styles[`badge-${orderDetails.status}`]}>
                                    {orderDetails.status}
                                </span>
                            </span>
                        </div>
                        <div className={styles["info-row"]}>
                            <span className={styles["label"]}>Quantity:</span>
                            <span className={styles["value"]}>{orderDetails.quantity} items</span>
                        </div>
                        <div className={styles["info-row"]}>
                            <span className={styles["label"]}>Amount:</span>
                            <span className={styles["value"]}>₹{orderDetails.amount?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {customer && (
                    <div className={styles["info-card"]}>
                        <h2>Customer Information</h2>
                        <div className={styles["info-content"]}>
                            <div className={styles["info-row"]}>
                                <span className={styles["label"]}>Name:</span>
                                <span className={styles["value"]}>{customer.username}</span>
                            </div>
                            <div className={styles["info-row"]}>
                                <span className={styles["label"]}>Email:</span>
                                <span className={styles["value"]}>{customer.email}</span>
                            </div>
                            <div className={styles["info-row"]}>
                                <span className={styles["label"]}>Phone:</span>
                                <span className={styles["value"]}>{customer.phone || "N/A"}</span>
                            </div>
                            {customer.address && (
                                <div className={styles["info-row"]}>
                                    <span className={styles["label"]}>Address:</span>
                                    <span className={styles["value"]}>
                                        {customer.address.county}, {customer.address.state}
                                        <br />
                                        {customer.address.country} - {customer.address.pincode}
                                    </span>
                                </div>
                            )}
                            {customer.geoPoint && (
                                <div className={styles["info-row"]}>
                                    <span className={styles["label"]}>Coordinates:</span>
                                    <span className={styles["value"]}>
                                        {customer.geoPoint.lat.toFixed(4)}, {customer.geoPoint.lng.toFixed(4)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className={styles["action-buttons"]}>
                <button
                    className={`${styles["action-button"]} ${styles["delivered"]}`}
                    onClick={handleMarkAsDelivered}
                    disabled={markingDelivered}
                    style={markingDelivered ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                >
                    {markingDelivered ? 'Marking...' : 'Mark as Delivered'}
                </button>
                {customer?.phone && (
                    <button
                        className={`${styles["action-button"]} ${styles["contact"]}`}
                        onClick={() => { window.location.href = `tel:${customer.phone}`; }}
                    >
                        Contact Customer
                    </button>
                )}
                <button
                    className={`${styles["action-button"]} ${styles["report"]}`}
                    onClick={() => {
                        toast.error("Issue reporting coming soon!");
                    }}
                >
                    Report Issue
                </button>
            </div>
        </div>
    );
};

export default OrderDetailsPage;