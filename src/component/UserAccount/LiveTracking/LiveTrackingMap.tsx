import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { divIcon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./LiveTrackingMap.module.css";

interface LiveTrackingMapProps {
  orderId: string;
  customerLocation?: { lat: number; lng: number };
  wsUrl?: string;
}

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

const LiveTrackingMap = ({ orderId, customerLocation, wsUrl = "ws://localhost:4000/ws" }: LiveTrackingMapProps) => {
  const [shipperLocation, setShipperLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!orderId) return;

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      try {
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setConnected(true);
          console.log(`[LiveTracking] Connected, subscribing to order ${orderId}`);
          ws?.send(JSON.stringify({ type: "user:subscribe-order", orderId }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "shipper:location-update" && data.orderId === orderId) {
              setShipperLocation({ lat: data.lat, lng: data.lng });
            }
          } catch (e) {
            console.error("[LiveTracking] Error parsing message:", e);
          }
        };

        ws.onclose = () => {
          setConnected(false);
          console.log("[LiveTracking] Disconnected, will retry in 5s");
          reconnectTimer = setTimeout(connect, 5000);
        };

        ws.onerror = (err) => {
          console.error("[LiveTracking] WebSocket error:", err);
          ws?.close();
        };
      } catch (err) {
        console.error("[LiveTracking] Failed to create WebSocket:", err);
        reconnectTimer = setTimeout(connect, 5000);
      }
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null; // prevent reconnect on intentional close
        ws.close();
        wsRef.current = null;
      }
      setConnected(false);
    };
  }, [orderId, wsUrl]);

  const center: LatLngExpression = shipperLocation
    ? [shipperLocation.lat, shipperLocation.lng]
    : customerLocation
      ? [customerLocation.lat, customerLocation.lng]
      : [20.5937, 78.9629]; // default: India center

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>🚚 Live Tracking</h3>
        <span className={`${styles.status} ${connected ? styles.statusConnected : styles.statusDisconnected}`}>
          {connected ? "● Live" : "○ Disconnected"}
        </span>
      </div>

      {shipperLocation && (
        <div className={styles.coords}>
          Shipper: {shipperLocation.lat.toFixed(4)}, {shipperLocation.lng.toFixed(4)}
        </div>
      )}

      <div className={styles.mapWrapper}>
        <MapContainer
          center={center}
          zoom={13}
          className={styles.map}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {shipperLocation && (
            <Marker position={[shipperLocation.lat, shipperLocation.lng]} icon={shipperIcon}>
              <Popup>
                <strong>Shipper Location</strong>
                <br />
                Last updated: {new Date().toLocaleTimeString()}
              </Popup>
            </Marker>
          )}

          {customerLocation && (
            <Marker position={[customerLocation.lat, customerLocation.lng]} icon={deliveryIcon}>
              <Popup>
                <strong>Delivery Destination</strong>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {!connected && (
        <div className={styles.reconnecting}>
          Connecting to live tracking...
        </div>
      )}
    </div>
  );
};

export default LiveTrackingMap;
