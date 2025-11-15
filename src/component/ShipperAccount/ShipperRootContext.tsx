import ShipperAccount from "./ShipperAccount";
import { useRouteTracker } from "../../hooks/useRouteTracker";

const ShipperRootContext = () => {
    // Track route changes and update localStorage
    useRouteTracker();

    return <ShipperAccount />;
};

export default ShipperRootContext;