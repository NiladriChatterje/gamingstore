import { HiShoppingCart } from "react-icons/hi";
import { useUserStateContext } from "../UserStateContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ProductType } from "@declarations/ProductContextType";
import { forwardRef, Ref } from "react";
import styles from "./ProductDetails.module.css";

const ProductDetails = (
  {
    item,
  }: {
    item: ProductType;
  },
  ref: Ref<HTMLDivElement>
) => {
  const { addItemToOrderList, setItemIDCount } = useUserStateContext();
  const navigate = useNavigate();

  return (
    <div
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/user/Product/Details/${item._id}`);
      }}
      style={{ position: "relative", cursor: "pointer" }}
      key={item._id}
      id={styles.card}
    >
      {item.imagesBase64 && (
        <img src={item.imagesBase64[0]?.base64 ?? ""} alt="" />
      )}
      <h3>{item?.productName}</h3>
      <p>
        {item?.productDescription?.length > 30
          ? item.productDescription.slice(0, 28) + "..."
          : item.productDescription}
      </p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          addItemToOrderList?.(item);
          setItemIDCount?.({ count: item.quantity, id: item._id });
          toast("Item added to Cart 🛒");
        }}
      >
        Add to Cart <HiShoppingCart />
      </button>
      <h2>₹{item?.price}</h2>
    </div>
  );
};

export default forwardRef(ProductDetails);
