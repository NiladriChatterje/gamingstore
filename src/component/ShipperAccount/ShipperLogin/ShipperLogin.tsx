import { SignedOut, SignIn } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../../../StateContext";
import { useUser } from "@clerk/clerk-react";
import styles from "./ShipperLogin.module.css";

const ShipperLogin = () => {
    const navigate = useNavigate();
    const { setDefaultLoginAdminOrUser } = useStateContext();
    const { isSignedIn } = useUser();

    // Set user type to shipper when component mounts (before sign-in)
    useEffect(() => {
        localStorage.setItem("loginusertype", "shipper");
        setDefaultLoginAdminOrUser?.("shipper");
    }, [setDefaultLoginAdminOrUser]);

    // Redirect if already signed in
    useEffect(() => {
        if (isSignedIn) {
            navigate("/shipper", { replace: true });
        }
    }, [isSignedIn, navigate]);

    return (
        <SignedOut>
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>
                            Shipper Portal
                        </h1>
                        <p className={styles.subtitle}>
                            Sign in to manage your deliveries
                        </p>
                    </div>

                    <SignIn
                        afterSignInUrl="/shipper"
                        redirectUrl="/shipper"

                    />

                    <div className={styles.footer}>
                        <p className={styles.footerText}>
                            Not a shipper?
                        </p>
                        <button
                            onClick={() => {
                                localStorage.removeItem("loginusertype");
                                navigate("/");
                            }}
                            className={styles.userLoginButton}
                        >
                            Go to User Login
                        </button>
                    </div>
                </div>
            </div>
        </SignedOut>
    );
};

export default ShipperLogin;