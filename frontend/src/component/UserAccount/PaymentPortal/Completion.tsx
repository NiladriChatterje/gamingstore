import { useEffect } from "react";
import { runFireworks } from './utils.tsx';
import { useUserStateContext } from "../UserStateContext.tsx";
import { BsBagCheckFill } from 'react-icons/bs'
import { useNavigate, useParams } from 'react-router-dom';
import styles from './Completion.module.css';
import { ProductType } from "@declarations/ProductContextType";

function Completion() {
    const navigate = useNavigate();
    const { setCartData, setTotalPrice, isOneItem } = useUserStateContext();
    const params = useParams();

    useEffect(() => {
        try {
            console.log(params)
            if (!isOneItem) {
                localStorage.removeItem("cart");
                setTotalPrice?.(0);
                setCartData?.([] as ProductType[]);
            };
            (function () {
                document.onkeydown = function (e: KeyboardEvent) {
                    return (e.which || e.keyCode) !== 116;
                };
            })();

            runFireworks();
        } catch (e: Error | any) {
            navigate('/error');
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={styles["success-wrapper"]}>
            <div className={styles["success"]}>
                <p className={styles["icon"]}>
                    <BsBagCheckFill />
                </p>
                <h2>Thank you for your order!</h2>
                <p className={styles["description"]}>
                    If you have any questions, please email
                    <a className={styles["email"]} href="mailto:cniladri415@gmail.com">
                        cniladri415@gmail.com
                    </a>
                </p>

                <button
                    onClick={() => navigate('/')}
                    type="button" style={{ width: "300px" }} className="btn">
                    Continue Shopping
                </button>
            </div>
        </div>
    );
}

export default Completion;