import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import styles from "./ShipperSidebar.module.css";
import { MdDashboard, MdLocalShipping, MdClose, MdMenu } from "react-icons/md";
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
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(prev => !prev);
    };

    return (
        <>
            <button
                className={`${styles["menu-toggle"]} ${isOpen ? styles["hidden"] : ""}`}
                onClick={toggleSidebar}
                aria-label="Open Menu"
            >
                <MdMenu />
            </button>

            <aside className={`${styles["sidebar-container"]} ${isOpen ? styles["open"] : styles["closed"]}`}>
                <div className={styles["sidebar-header"]}>
                    <h3>Shipper Portal</h3>
                    <button
                        className={styles["close-button"]}
                        onClick={toggleSidebar}
                        aria-label="Close Menu"
                    >
                        <MdClose />
                    </button>
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
        </>
    );
};

export default ShipperSidebar;