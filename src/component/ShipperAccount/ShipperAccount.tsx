import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import NotFound from "../../NotFound.tsx";
import ShipperNavbar from "./Navbar/ShipperNavbar.tsx";
import ShipperSidebar from "./Sidebar/ShipperSidebar.tsx";
import ShipperDashboard from "./Dashboard/ShipperDashboard.tsx";
import DeliveredOrders from "./DeliveredOrders/DeliveredOrders.tsx";
import InTransitOrders from "./InTransitOrders/InTransitOrders.tsx";
import OrderDetailsPage from "./OrderDetailsPage/OrderDetailsPage.tsx";
import ShipperLogin from "./ShipperLogin/ShipperLogin.tsx";
import ProfileManager from "./ProfileManager/ProfileManager.tsx";
import { useStateContext } from "../../StateContext.tsx";

interface DashboardStats {
  pending: number;
  inTransit: number;
  delivered: number;
}

interface ShipperData {
  _id: string;
  shippername: string;
  email: string;
  phone: number;
  address: {
    pincode: string;
    county: string;
    country: string;
    state: string;
  } | null;
}

/** Determine whether the shipper has completed their full profile */
function isProfileComplete(data: ShipperData | null): boolean {
  if (!data) return false;
  // phone must not be the placeholder 0; address must be fully filled
  const phoneOk = data.phone !== 0 && data.phone != null;
  const addressOk =
    data.address != null &&
    data.address.pincode?.trim().length > 0 &&
    data.address.county?.trim().length > 0 &&
    data.address.country?.trim().length > 0 &&
    data.address.state?.trim().length > 0;
  return phoneOk && addressOk;
}

const ShipperAccount = () => {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const location = useLocation();
  const { defaultLoginAdminOrUser, setDefaultLoginAdminOrUser } = useStateContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({ pending: 0, inTransit: 0, delivered: 0 });
  /** null = not yet determined, true/false = profile complete check result */
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);

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

  // Check shipper existence + profile completeness
  const checkShipperProfile = useCallback(async () => {
    if (!isSignedIn || !user) return;
    const token = await getToken();
    try {
      const response = await fetch(`http://localhost:5001/fetch-shipper-data/shipper-${user.id}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` }
      });
      const data: ShipperData | null = await response.json();

      if (data == null) {
        // First-time sign-in: create a temporary shipper entry
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
        // New shipper — profile is definitely incomplete
        setProfileComplete(false);
      } else {
        setProfileComplete(isProfileComplete(data));
      }
    } catch (err) {
      console.error("Error fetching shipper data:", err);
      // Fallback: treat as incomplete so the user gets routed to the profile page
      setProfileComplete(false);
    }
  }, [isSignedIn, user, getToken]);

  useEffect(() => {
    if (isSignedIn && user != null && defaultLoginAdminOrUser === "shipper") {
      checkShipperProfile();
    }
  }, [isSignedIn, user, defaultLoginAdminOrUser, checkShipperProfile]);

  if (!isSignedIn) {
    localStorage.setItem('loginusertype', 'user');
    setDefaultLoginAdminOrUser?.('user');
    return <Navigate to="/" replace />;
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
          <Route path="/shipper/login" element={<ShipperLogin />} />

          {/* When profile completion hasn't been determined yet, show a loading state */}
          <Route path="/" element={
            profileComplete === null ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>
                <p>Checking profile...</p>
              </div>
            ) : profileComplete ? (
              <ShipperDashboard />
            ) : (
              <Navigate to="/shipper/profile" replace />
            )
          } />
          <Route path="/shipper" element={
            profileComplete === null ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>
                <p>Checking profile...</p>
              </div>
            ) : profileComplete ? (
              <ShipperDashboard />
            ) : (
              <Navigate to="/shipper/profile" replace />
            )
          } />

          {/* Profile always accessible regardless of completion status */}
          <Route path="/shipper/profile" element={
            profileComplete === false ? (
              <div>
                <div style={{
                  background: "linear-gradient(135deg, #ff6b35, #f7931e)",
                  color: "#fff",
                  padding: "14px 24px",
                  margin: "16px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "15px",
                  fontWeight: 500,
                  boxShadow: "0 4px 12px rgba(255, 107, 53, 0.3)"
                }}>
                  <span style={{ fontSize: "20px" }}>⚠️</span>
                  <span>
                    Please complete your profile to access the full shipper portal.
                    Fill in all required fields and save.
                  </span>
                </div>
                <ProfileManager onProfileSaved={() => {
                  // Re-check profile after save
                  checkShipperProfile();
                }} />
              </div>
            ) : (
              <ProfileManager onProfileSaved={checkShipperProfile} />
            )
          } />

          {/* Protected routes — require complete profile */}
          <Route path="/shipper/in-transit" element={
            profileComplete ? <InTransitOrders /> : <Navigate to="/shipper/profile" replace />
          } />
          <Route path="/shipper/delivered" element={
            profileComplete ? <DeliveredOrders /> : <Navigate to="/shipper/profile" replace />
          } />
          <Route path="/shipper/all-orders" element={
            profileComplete ? <ShipperDashboard /> : <Navigate to="/shipper/profile" replace />
          } />
          <Route path="/shipper/orders/:orderId" element={
            profileComplete ? <OrderDetailsPage /> : <Navigate to="/shipper/profile" replace />
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
};

export default ShipperAccount;