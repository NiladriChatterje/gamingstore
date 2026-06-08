import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
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

const ShipperAccount = () => {
    const { user, isSignedIn } = useUser();
    const { getToken } = useAuth();
    const location = useLocation();
    const { defaultLoginAdminOrUser } = useStateContext();

    // Check if we're on the login page
    const isLoginPage = location.pathname === "/shipper/login";


    useEffect(() => {
        if (isSignedIn && user != null && defaultLoginAdminOrUser === "shipper") {
            (async () => {
                const token = await getToken();

                try {
                    const response = await fetch(`http://localhost:5001/fetch-shipper-data/${user.id}`, {
                        headers: {
                            "Accept": "application/json",
                            "Authorization": `Bearer ${token}`
                        }
                    });

                    const data = await response.json();

                    if (data == null) {
                        // Create shipper account if it doesn"t exist
                        const shipperObj = {
                            _id: user.id,
                            username: user.firstName,
                            email: user.emailAddresses[0].emailAddress,
                        };

                        try {
                            const createResponse = await fetch(`http://localhost:5001/create-shipper/`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${token}`
                                },
                                body: JSON.stringify(shipperObj)
                            });

                            if (!createResponse.ok) {
                                toast.error("Failed to create shipper account");
                            }
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

    if (!isSignedIn)
        <Navigate to="/shipper/login" replace />;

    return (
        <>
            {/* Only show Navbar and Sidebar when not on login page */}
            {!isLoginPage && (
                <>
                    <ShipperNavbar />
                    <ShipperSidebar />
                </>
            )}
            <Routes>
                <Route path="/" element={<ShipperDashboard />} />
                <Route index path="/shipper" element={<ShipperDashboard />} />
                <Route path="/shipper/login" element={<ShipperLogin />} />
                <Route path="/shipper/in-transit" element={<InTransitOrders />} />
                <Route path="/shipper/delivered" element={<DeliveredOrders />} />
                <Route path="/shipper/all-orders" element={<ShipperDashboard />} />
                <Route
                    path="/shipper/orders/:orderId"
                    element={<OrderDetailsPage />}
                />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
};

export default ShipperAccount;