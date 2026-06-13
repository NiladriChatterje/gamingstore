import { GiHamburgerMenu } from "react-icons/gi";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import styles from "./ShipperNavbar.module.css";

interface ShipperNavbarProps {
  onToggleSidebar?: () => void;
}

const ShipperNavbar = ({ onToggleSidebar }: ShipperNavbarProps) => {
  const { user } = useUser();

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <span className={styles.brandAccent}>XV</span>
        <span>Shipper Portal</span>
      </div>

      <div className={styles.rightSection}>
        <SignedOut>
          <SignInButton mode="modal">
            <button className={styles.signInBtn}>Sign In</button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <div className={styles.userBtn}>
            <span>{user?.firstName || "Shipper"}</span>
            <UserButton />
          </div>
        </SignedIn>
        {onToggleSidebar && (
          <button
            className={styles.hamburger}
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <GiHamburgerMenu size={22} />
          </button>
        )}
      </div>
    </nav>
  );
};

export default ShipperNavbar;