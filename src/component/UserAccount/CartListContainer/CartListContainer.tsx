import styles from "./CartListContainer.module.css";
import { AiOutlineArrowRight } from "react-icons/ai";
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
        <div className={styles[`slider`]}>
          <AiOutlineArrowRight
            onClick={() => {
              if (setSlide) setSlide(false);
            }}
            style={{
              position: "fixed",
              fontWeight: "900",
              left: 8,
              top: 10,
              color: "white",
              fontSize: 25,
              cursor: "pointer",
              zIndex: 20,
            }}
          />
          {cartData?.map((item, i) => (
            <CartProduct
              key={i}
              item={item}
            />
          ))}
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
        </div>
      </motion.div>
    </>
  );
};
export default CartListContainer;
