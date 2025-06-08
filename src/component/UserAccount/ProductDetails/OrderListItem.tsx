import styles from "./OrderListItem.module.css";
import { AiOutlineArrowRight } from "react-icons/ai";
import { motion } from "framer-motion";
import { OrderList } from "../components";
import { useUserStateContext } from "../UserStateContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useStateContext } from "../../../StateContext";

const OrderListItem = () => {
  const { data, totalPrice, slide, setSlide, setOneItem } =
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
              color: "black",
              fontSize: 25,
              cursor: "pointer",
              zIndex: 20,
            }}
          />
          {data?.map((item, i) => (
            <OrderList
              key={i}
              _id={item._id}
              images={item?.imagesBase64}
              price={item.price}
              count={item.quantity}
            />
          ))}
          <motion.button
            onClick={() => {
              setDefaultLoginAdminOrUser?.("user");
              if (totalPrice !== 0) {
                localStorage.setItem("isOneItem", "false");
                setOneItem?.(false);
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
export default OrderListItem;
