import { Routes, Route, Navigate } from "react-router-dom";
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

const ShipperAccount = () => {
    const { user, isSignedIn } = useUser();
    const { getToken } = useAuth();

    useEffect(() => {
        if (isSignedIn && user != null) {
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
    }, [isSignedIn]);


    return (
        <>
            <ShipperNavbar />
            <ShipperSidebar />
            <Routes>
                <Route path={"/"} element={<ShipperDashboard />} />
                <Route index path={"/shipper"} element={<ShipperDashboard />} />
                <Route path={"/shipper/in-transit"} element={<InTransitOrders />} />
                <Route path={"/shipper/delivered"} element={<DeliveredOrders />} />
                <Route path={"/shipper/all-orders"} element={<ShipperDashboard />} />
                <Route
                    path={"/shipper/orders/:orderId"}
                    element={<OrderDetailsPage />}
                />
                <Route path="/user/*" element={<Navigate to={"/shipper"} />} />
                <Route path="/admin/*" element={<Navigate to={"/shipper"} />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
};

export default ShipperAccount;