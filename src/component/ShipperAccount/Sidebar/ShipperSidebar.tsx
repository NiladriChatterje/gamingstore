import { Link, useLocation } from "react-router-dom";
import styles from "./ShipperSidebar.module.css";
import { MdDashboard, MdLocalShipping } from "react-icons/md";
import { FaBoxOpen, FaCheckCircle } from "react-icons/fa";

const sidebarItems = [
    {
        icon: MdDashboard,
        name: "Dashboard",
        link: "/shipper"
    },
    {
        icon: MdLocalShipping,
        name: "In-Transit",
        link: "/shipper/in-transit"
    },
    {
        icon: FaCheckCircle,
        name: "Delivered",
        link: "/shipper/delivered"
    },
    {
        icon: FaBoxOpen,
        name: "All Orders",
        link: "/shipper/all-orders"
    },
];

const ShipperSidebar = () => {
    const location = useLocation();

    return (
        <aside className={styles["sidebar-container"]}>
            <div className={styles["sidebar-header"]}>
                <h3>Shipper Portal</h3>
            </div>
            <nav className={styles["sidebar-nav"]}>
                {sidebarItems.map((item, index) => (
                    <Link
                        key={index}
                        to={item.link}
                        className={`${styles["sidebar-item"]} ${location.pathname === item.link ? styles["active"] : ""
                            }`}
                    >
                        <item.icon className={styles["sidebar-icon"]} />
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
};

export default ShipperSidebar;