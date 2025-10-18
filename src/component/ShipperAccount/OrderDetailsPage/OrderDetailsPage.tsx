import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { Icon, LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./OrderDetailsPage.module.css";
import { OrderType } from "@declarations/OrderType";
import { UserType } from "@declarations/UserType";



// Custom marker icons for shipper and delivery location
const shipperIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const deliveryIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const OrderDetailsPage = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [orderDetails, setOrderDetails] = useState<OrderType | null>(null);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [loading, setLoading] = useState(true);

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
                    lat: 28.6139,
                    lng: 77.2090
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
        // Simulate current delivery location (slightly offset from destination)
        setCurrentLocation({
            lat: mockOrderData.customer.geoPoint.lat - 0.05,
            lng: mockOrderData.customer.geoPoint.lng - 0.05
        });
        setLoading(false);

        // Simulate real-time location updates
        const interval = setInterval(() => {
            setCurrentLocation(prev => {
                if (!prev || !mockOrderData.customer.geoPoint) return prev;

                // Move slightly closer to destination
                const latDiff = mockOrderData.customer.geoPoint.lat - prev.lat;
                const lngDiff = mockOrderData.customer.geoPoint.lng - prev.lng;

                return {
                    lat: prev.lat + latDiff * 0.05,
                    lng: prev.lng + lngDiff * 0.05
                };
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [orderId]);

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

    // Calculate route line between current location and destination
    const routePositions: [number, number][] = currentLocation && destination
        ? [[currentLocation.lat, currentLocation.lng], [destination.lat, destination.lng]]
        : [];

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

            {/* Real-time Map Section */}
            <div className={styles["map-section"]}>
                <h2>Real-time Tracking</h2>
                <div className={styles["map-container"]}>
                    <MapContainer
                        center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [destination.lat, destination.lng]}
                        zoom={12}
                        className={styles["map"]}
                        style={{ height: "400px", width: "100%" }}
                        bounds={routePositions.length > 0 ? routePositions as LatLngBoundsExpression : undefined}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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

                        {/* Route line */}
                        {routePositions.length > 0 && (
                            <Polyline
                                positions={routePositions}
                                color="blue"
                                weight={3}
                                dashArray="10, 10"
                            />
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