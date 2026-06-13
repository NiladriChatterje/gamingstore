import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import NotFound from "../../NotFound.tsx";
import ShipperNavbar from "./Navbar/ShipperNavbar.tsx";
import ShipperSidebar from "./Sidebar/ShipperSidebar.tsx";
import ShipperDashboard from "./Dashboard/ShipperDashboard.tsx";
import DeliveredOrders from "./DeliveredOrders/DeliveredOrders.tsx";
import InTransitOrders from "./InTransitOrders/InTransitOrders.tsx";
import OrderDetailsPage from "./OrderDetailsPage/OrderDetailsPage.tsx";
import ShipperLogin from "./ShipperLogin/ShipperLogin.tsx";
import { useStateContext } from "../../StateContext.tsx";

interface DashboardStats {
  pending: number;
  inTransit: number;
  delivered: number;
}

const ShipperAccount = () => {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const location = useLocation();
  const { defaultLoginAdminOrUser } = useStateContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({ pending: 0, inTransit: 0, delivered: 0 });

  const isLoginPage = location.pathname === "/shipper/login";

  // Fetch dashboard stats for sidebar badges
  useEffect(() => {
    if (!isSignedIn || !user || isLoginPage) return;
    const fetchStats = async () => {
      try {
        const token = await getToken();
        const shipperId = `shipper-${user.id}`;
        const response = await fetch(`http://localhost:5004/shipper-dashboard-stats/${shipperId}`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data: DashboardStats = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [isSignedIn, user, getToken, isLoginPage]);

  useEffect(() => {
    if (isSignedIn && user != null && defaultLoginAdminOrUser === "shipper") {
      (async () => {
        const token = await getToken();
        try {
          const response = await fetch(`http://localhost:5001/fetch-shipper-data/shipper-${user.id}`, {
            headers: { Accept: "application/json", Authorization: `Bearer ${token}` }
          });
          const data = await response.json();
          if (data == null) {
            const shipperObj = {
              _id: `shipper-${user.id}`,
              username: user.firstName,
              email: user.emailAddresses[0].emailAddress,
            };
            try {
              const createResponse = await fetch(`http://localhost:5001/create-shipper/`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(shipperObj)
              });
              if (!createResponse.ok) toast.error("Failed to create shipper account");
            } catch (err) {
              console.log("Failed creating shipper account!");
              toast.error("Something went wrong! shipper-account-creation-failed");
            }
          }
        } catch (err) {
          console.error("Error fetching shipper data:", err);
        }
      })();
    }
  }, [isSignedIn, user]);

  if (!isSignedIn) {
    return <Navigate to="/shipper/login" replace />;
  }

  return (
    <>
      {!isLoginPage && (
        <>
          <ShipperNavbar onToggleSidebar={() => setSidebarOpen((p) => !p)} />
          <ShipperSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} stats={stats} />
        </>
      )}
      <main style={{
        marginLeft: isLoginPage ? "0" : "260px",
        marginTop: "60px",
        minHeight: "calc(100vh - 60px)",
        transition: "margin-left 0.3s ease",
      }}>
        <Routes>
          <Route path="/" element={<ShipperDashboard />} />
          <Route path="/shipper" element={<ShipperDashboard />} />
          <Route path="/shipper/login" element={<ShipperLogin />} />
          <Route path="/shipper/in-transit" element={<InTransitOrders />} />
          <Route path="/shipper/delivered" element={<DeliveredOrders />} />
          <Route path="/shipper/all-orders" element={<ShipperDashboard />} />
          <Route path="/shipper/orders/:orderId" element={<OrderDetailsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
};

export default ShipperAccount;