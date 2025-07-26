import styles from "./CartProduct.module.css";
import { AiFillCloseCircle } from "react-icons/ai";
import { useUserStateContext } from "../UserStateContext";
import toast from "react-hot-toast";
import { ProductType } from "@/declarations/ProductContextType";

export default function CartProduct({
  item
}: {
  item: ProductType
}) {
  const { cartData, setCartData, setRefreshApp } = useUserStateContext();

  return (
    <div className={styles["CartProduct-container"]}>
      <AiFillCloseCircle
        onClick={() => {
          const newCartData = cartData?.filter((i) => i._id !== item._id) ?? []
          localStorage.setItem('cart', JSON.stringify(newCartData));
          setCartData?.(newCartData);
        }}
        style={{
          color: "black",
          position: "absolute",
          top: 40,
          right: 10,
          cursor: "pointer",
        }}
      />
      <div
        style={{
          overflowX: "auto",
          padding: 2,
          display: "flex",
        }}
      >

        {item.imagesBase64 && item.imagesBase64.length > 0 && <img src={item.imagesBase64[0].base64} alt={item._id} />}
      </div>

      <span>Rs. {item.price.pdtPrice}</span>
      <div id={styles["quantity"]}>
        <button
          onClick={() => {
            if (item.quantity <= 1) return 1;
            item.quantity -= 1;
            setRefreshApp?.(prev => !prev)
            if (cartData)
              localStorage.setItem('cart', JSON.stringify(cartData))
          }}
        >
          -
        </button>
        <h4>{item.quantity}</h4>
        <button onClick={async () => {
          try {
            const quantity_pdt = await fetch(`http://localhost:5002/fetch-product-quantity/${'700135'}/${item._id}`)
            const quantity_after = await quantity_pdt.json();

            //check product_service: endpoint in the url structure
            if (item.quantity >= quantity_after.quantity) {
              toast(`Only ${item.quantity} items(s) available!`);
              return;
            }
            item.quantity += 1;
            setRefreshApp?.(prev => !prev)
            if (cartData)
              localStorage.setItem('cart', JSON.stringify(cartData))
          } catch (err) {
            toast.error('server issue. try later to add more!')
          }

        }}>+</button>
      </div>
      <hr />
    </div>
  );
}
