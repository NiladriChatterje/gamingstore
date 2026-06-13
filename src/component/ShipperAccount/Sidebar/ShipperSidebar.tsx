import { Link, useLocation } from "react-router-dom";
import styles from "./ShipperSidebar.module.css";
import { MdDashboard, MdLocalShipping, MdCheckCircle, MdSettings } from "react-icons/md";
import { IoLogOutOutline } from "react-icons/io5";

interface ShipperSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  stats?: { pending: number; inTransit: number; delivered: number };
}

const navItems = [
  { icon: MdDashboard, label: "Dashboard", link: "/shipper" },
  { icon: MdLocalShipping, label: "In-Transit", link: "/shipper/in-transit" },
  { icon: MdCheckCircle, label: "Delivered", link: "/shipper/delivered" },
  { icon: MdSettings, label: "Profile", link: "/shipper/profile" },
];

const ShipperSidebar = ({ isOpen, onClose, stats }: ShipperSidebarProps) => {
  const location = useLocation();

  const getBadge = (link: string) => {
    if (!stats) return undefined;
    if (link === "/shipper/in-transit") return stats.inTransit;
    if (link === "/shipper/delivered") return stats.delivered;
    return undefined;
  };

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? "" : styles.hidden}`}
        onClick={onClose}
      />
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <div className={styles.sidebarBrand}>
          <span className={styles.sidebarBrandAccent}>XV</span>
          <span>Shipper Portal</span>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const badge = getBadge(item.link);
            const isActive =
              item.link === "/shipper"
                ? location.pathname === "/shipper"
                : location.pathname.startsWith(item.link);
            return (
              <Link
                key={item.link}
                to={item.link}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                onClick={onClose}
              >
                <span className={styles.navIcon}><Icon /></span>
                <span className={styles.navLabel}>{item.label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className={styles.navBadge}>{badge}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className={styles.sidebarFooter}>
          <Link to="/" className={styles.footerLink}>
            <IoLogOutOutline size={18} />
            Exit Portal
          </Link>
        </div>
      </aside>
    </>
  );
};

export default ShipperSidebar;