import styles from "./CartListContainer.module.css";
import { MdClose } from "react-icons/md";
import { motion } from "framer-motion";
import { CartProduct } from "../components";
import { useUserStateContext } from "../UserStateContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useStateContext } from "../../../StateContext";

const CartListContainer = () => {
  const { cartData, totalPrice, slide, setSlide, setIsOneItem } =
    useUserStateContext();
  const { setDefaultLoginAdminOrUser } = useStateContext();
  const navigate = useNavigate();

  return (
    <>
      <motion.div
        className={`${styles["slider-container"]} ${slide ? "" : styles["hide-slider"]
          }`}
      >
        <div className={styles["slider-header"]}>
          <h2 className={styles["cart-title"]}>Your Cart</h2>
          <MdClose
            size={28}
            onClick={() => {
              if (setSlide) setSlide(false);
            }}
            className={styles["close-button"]}
          />
        </div>
        <div className={styles[`slider`]}>
          {cartData && cartData.length > 0 ? (
            cartData.map((item, i) => (
              <CartProduct
                key={i}
                item={item}
              />
            ))
          ) : (
            <div className={styles["empty-cart"]}>
              <p>Your cart is empty</p>
            </div>
          )}
        </div>
        <motion.button
          onClick={() => {
            setDefaultLoginAdminOrUser?.("user");
            if (totalPrice !== 0) {
              localStorage.setItem("isOneItem", "false");
              setIsOneItem?.(false);
              navigate("/user/Payment");
              if (setSlide) setSlide(false);
            } else toast("Cart is empty!");
          }}
          initial={{ y: 60 }}
          animate={{ y: 0 }}
          id={styles["payment"]}
        >
          <span>Place Order</span>
          <span id={styles["total-price"]}>₹ {totalPrice}</span>
        </motion.button>
      </motion.div>
    </>
  );
};
export default CartListContainer;
