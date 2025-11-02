import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SignIn, useUser } from "@clerk/clerk-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { divIcon, LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./OrderDetailsPage.module.css";
import { OrderType } from "@declarations/OrderType";
import { UserType } from "@declarations/UserType";
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
    const { isSignedIn } = useUser();

    const [orderDetails, setOrderDetails] = useState<OrderType | null>(null);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>({ lat: 22.634117693411923, lng: 88.48388276892908 });
    const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
    const [loading, setLoading] = useState(true);
    const [locationError, setLocationError] = useState<string | null>(null);
    const locationWatchIdRef = useRef<number | null>(null);

    // Mock data - Replace with actual API call
    useEffect(() => {
        // Simulate fetching order details
        const mockOrderData: OrderType = {
            _id: orderId || "2001",
            customer: {
                _id: "user123",
                username: "Alice Johnson",
                email: "alice@example.com",
                geoPoint: {
                    lat: 22.6236,
                    lng: 88.4410
                },
                phone: "+1234567890",
                address: {
                    pincode: "110001",
                    county: "New Delhi",
                    country: "India",
                    state: "Delhi"
                },
                cart: []
            } as UserType,
            product: [],
            quantity: 5,
            transactionId: "TXN123456",
            orderId: orderId || "2001",
            paymentSignature: "SIG123456",
            amount: 2500,
            status: "shipping",
            createdAt: "2025-10-15T10:30:00Z",
            expectedDelivery: "Oct 20, 2025"
        };

        setOrderDetails(mockOrderData);
        setLoading(false);
    }, [orderId]);

    // Function to start watching location
    const startLocationWatch = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser");
            return;
        }

        // Clear any existing watch
        if (locationWatchIdRef.current !== null) {
            navigator.geolocation.clearWatch(locationWatchIdRef.current);
            locationWatchIdRef.current = null;
        }

        setLocationError(null);
        console.log("Requesting location access...");

        // First, try to get current position to establish initial location
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log("Got initial position:", position.coords);
                const { latitude, longitude } = position.coords;
                setCurrentLocation({
                    lat: latitude,
                    lng: longitude
                });
                setLocationError(null);

                // Now start watching for continuous updates
                const watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        console.log("Position update:", position.coords);
                        const { latitude, longitude } = position.coords;
                        setCurrentLocation({
                            lat: latitude,
                            lng: longitude
                        });
                        setLocationError(null);
                    },
                    (error) => {
                        console.error("Watch position error:", error);
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                setLocationError("Location permission denied. Please enable location access in your browser settings.");
                                break;
                            case error.POSITION_UNAVAILABLE:
                                setLocationError("Location information unavailable. Please check your device settings.");
                                break;
                            case error.TIMEOUT:
                                setLocationError("Location request timed out. Please try again.");
                                break;
                            default:
                                setLocationError(`Error getting location: ${error.message}`);
                        }
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 30000,
                        maximumAge: 5000
                    }
                );

                locationWatchIdRef.current = watchId;
                console.log("Started watching position with ID:", watchId);
            },
            (error) => {
                console.error("Initial position error:", error);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationError("Location permission denied. Please enable location access in your browser settings.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setLocationError("Location information unavailable. Please check your device settings.");
                        break;
                    case error.TIMEOUT:
                        setLocationError("Location request timed out. Please try again.");
                        break;
                    default:
                        setLocationError(`Error getting location: ${error.message}`);
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 5000
            }
        );
    };

    // Watch shipper's real-time GPS location
    useEffect(() => {
        startLocationWatch();

        return () => {
            if (locationWatchIdRef.current !== null) {
                console.log("Cleaning up watch position:", locationWatchIdRef.current);
                navigator.geolocation.clearWatch(locationWatchIdRef.current);
                locationWatchIdRef.current = null;
            }
        };
    }, []);

    // Fetch route coordinates from OSRM routing service
    useEffect(() => {
        const fetchRoute = async () => {
            if (!currentLocation || !orderDetails?.customer.geoPoint) {
                console.log('Missing location data:', { currentLocation, orderDetails: orderDetails?.customer.geoPoint });
                return;
            }

            try {
                const start = `${currentLocation.lng},${currentLocation.lat}`;
                const end = `${orderDetails.customer.geoPoint.lng},${orderDetails.customer.geoPoint.lat}`;

                console.log('Fetching route from:', start, 'to:', end);

                // Using OSRM public API for routing
                const response = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`
                );

                if (!response.ok) {
                    console.error('Failed to fetch route, status:', response.status);
                    return;
                }

                const data = await response.json();
                console.log('OSRM response:', data);

                if (data.routes && data.routes.length > 0) {
                    // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
                    const coordinates = data.routes[0].geometry.coordinates.map(
                        (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
                    );
                    console.log('Route coordinates count:', coordinates.length);
                    setRouteCoordinates(coordinates);
                } else {
                    console.error('No routes found in OSRM response');
                }
            } catch (error) {
                console.error('Error fetching route:', error);
                // Fallback to straight line if routing fails
                const fallbackRoute = [
                    [currentLocation.lat, currentLocation.lng],
                    [orderDetails.customer.geoPoint.lat, orderDetails.customer.geoPoint.lng]
                ];
                console.log('Using fallback straight line route:', fallbackRoute);
                setRouteCoordinates(fallbackRoute as [number, number][]);
            }
        };

        fetchRoute();
    }, [currentLocation, orderDetails]);

    // Debug: Log routeCoordinates whenever it changes
    useEffect(() => {
        console.log('Route coordinates updated:', {
            count: routeCoordinates.length,
            coordinates: routeCoordinates.slice(0, 3), // Log first 3 points
            currentLocation,
            destination: orderDetails?.customer.geoPoint
        });
    }, [routeCoordinates, currentLocation, orderDetails]);

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
    const destination = customer.geoPoint;

    if (!isSignedIn)
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
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <FaArrowsRotate
                            size={25}
                        />
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
            <div className={styles["map-section"]}>
                <div className={`${styles["map-container"]} ${styles["glowing-route-container"]}`}>
                    <MapContainer
                        center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [destination.lat, destination.lng]}
                        zoom={12}
                        className={styles["map"]}
                        style={{ height: "100%", width: "100%" }}
                        bounds={routeCoordinates.length > 0 ? routeCoordinates as LatLngBoundsExpression : undefined}
                    >
                        <TileLayer
                            // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png"
                        />

                        {/* Current delivery location marker */}
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

                        {/* Destination marker */}
                        <Marker
                            position={[destination.lat, destination.lng]}
                            icon={deliveryIcon}
                        >
                            <Popup>
                                <strong>Destination</strong>
                                <br />
                                {customer.username}
                                <br />
                                {customer.address.county}, {customer.address.state}
                            </Popup>
                        </Marker>

                        {/* Route line following actual roads with glow effect */}
                        {routeCoordinates.length > 0 ? (
                            <>
                                {/* Outer glow layer */}
                                <Polyline
                                    positions={routeCoordinates}
                                    pathOptions={{
                                        color: "#ff8c42",
                                        weight: 2,
                                        opacity: 0.3
                                    }}
                                />
                                {/* Middle glow layer */}
                                <Polyline
                                    positions={routeCoordinates}
                                    pathOptions={{
                                        color: "#ff8c42",
                                        weight: 4,
                                        opacity: 0.6
                                    }}
                                />
                                {/* Main line */}
                                <Polyline
                                    positions={routeCoordinates}
                                    pathOptions={{
                                        color: "#ffb84dff",
                                        weight: 0.5,
                                        opacity: 1
                                    }}
                                />
                            </>
                        ) : (
                            <div style={{
                                position: 'absolute',
                                top: 10,
                                left: 10,
                                background: 'rgba(255, 255, 255, 0.9)',
                                padding: '8px 12px',
                                borderRadius: '4px',
                                zIndex: 1000,
                                fontSize: '12px',
                                color: '#666'
                            }}>
                                Loading route...
                            </div>
                        )}
                    </MapContainer>
                </div>
            </div>

            {/* Order Information Grid */}
            <div className={styles["info-grid"]}>
                {/* Order Details Card */}
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
                            <span className={styles["value"]}>₹{orderDetails.amount.toLocaleString()}</span>
                        </div>
                        <div className={styles["info-row"]}>
                            <span className={styles["label"]}>Expected Delivery:</span>
                            <span className={styles["value"]}>{orderDetails.expectedDelivery}</span>
                        </div>
                    </div>
                </div>

                {/* Customer Details Card */}
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
                        <div className={styles["info-row"]}>
                            <span className={styles["label"]}>Address:</span>
                            <span className={styles["value"]}>
                                {customer.address.county}, {customer.address.state}
                                <br />
                                {customer.address.country} - {customer.address.pincode}
                            </span>
                        </div>
                        <div className={styles["info-row"]}>
                            <span className={styles["label"]}>Coordinates:</span>
                            <span className={styles["value"]}>
                                {customer.geoPoint.lat.toFixed(4)}, {customer.geoPoint.lng.toFixed(4)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className={styles["action-buttons"]}>
                <button
                    className={`${styles["action-button"]} ${styles["delivered"]}`}
                    onClick={() => {
                        // Add delivery confirmation logic here
                        alert("Order marked as delivered!");
                        navigate("/shipper/in-transit");
                    }}
                >
                    Mark as Delivered
                </button>
                <button
                    className={`${styles["action-button"]} ${styles["contact"]}`}
                    onClick={() => {
                        // Add customer contact logic here
                        window.location.href = `tel:${customer.phone}`;
                    }}
                >
                    Contact Customer
                </button>
                <button
                    className={`${styles["action-button"]} ${styles["report"]}`}
                    onClick={() => {
                        // Add issue reporting logic here
                        alert("Issue reporting functionality coming soon!");
                    }}
                >
                    Report Issue
                </button>
            </div>
        </div>
    );
};

export default OrderDetailsPage;