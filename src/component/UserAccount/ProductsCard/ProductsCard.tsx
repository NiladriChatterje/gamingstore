import { HiShoppingCart } from "react-icons/hi";
import { useUserStateContext } from "../UserStateContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ProductType } from "@declarations/ProductContextType";
import { forwardRef, Ref } from "react";
import styles from "./ProductsCard.module.css";

const ProductsCard = (
  {
    item,
  }: {
    item: ProductType;
  },
  ref: Ref<HTMLDivElement>
) => {
  const { addItemToCart, setSingleProductDetail } = useUserStateContext();
  const navigate = useNavigate();

  return (
    <div
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        setSingleProductDetail?.(item);
        navigate(`/user/Product/ProductDetail/${item._id}`);
      }}
      style={{ position: "relative", cursor: "pointer" }}
      key={item._id}
      id={styles.card}
    >
      {item.imagesBase64 && (
        <img src={item.imagesBase64[0]?.base64 ?? ""} alt={item.productName} />
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
          addItemToCart?.(item);
          toast("Item added to Cart 🛒");
        }}
      >
        Add to Cart <HiShoppingCart />
      </button>
      <h2>₹{item?.price?.pdtPrice}</h2>
    </div>
  );
};

export default forwardRef(ProductsCard);
