import styles from "./CartProduct.module.css";
import { MdClose } from "react-icons/md";
import { useUserStateContext } from "../UserStateContext";
import toast from "react-hot-toast";
import { ProductType } from "@/declarations/ProductContextType";

export default function CartProduct({
  item
}: {
  item: ProductType
}) {
  const { cartData, setCartData, incDecQty } = useUserStateContext();

  return (
    <div className={styles["CartProduct-container"]}>
      <MdClose
        size={24}
        onClick={() => {
          const newCartData = cartData?.filter((i) => i._id !== item._id) ?? []
          localStorage.setItem('cart', JSON.stringify(newCartData));
          setCartData?.(newCartData);
          toast.success('Removed from cart');
        }}
        style={{
          color: "rgb(30, 28, 41)",
          position: "absolute",
          top: 12,
          right: 12,
          cursor: "pointer",
          transition: 'all 150ms ease',
          padding: '4px',
          borderRadius: '6px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.06)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      />
      <div
        style={{
          overflowX: "auto",
          padding: 0,
          display: "flex",
          justifyContent: 'center'
        }}
      >
        {item.imagesBase64 && item.imagesBase64.length > 0 && <img src={item.imagesBase64[0].base64} alt={item._id} />}
      </div>

      <span>{item.productName}</span>
      <span style={{ fontSize: '14px', color: 'rgb(100, 100, 100)' }}>Rs. {item.price.pdtPrice}</span>
      <div id={styles["quantity"]}>
        <button
          onClick={() => {
            if (item.quantity && item.quantity <= 1) return;
            const newQuantity = (item.quantity ?? 0) - 1;
            incDecQty?.(newQuantity, item._id);
          }}
          title="Decrease quantity"
        >
          −
        </button>
        <h4>{item.quantity}</h4>
        <button onClick={async () => {
          try {
            const quantity_pdt = await fetch(`http://localhost:5002/fetch-product-quantity/${'700135'}/${item._id}`)
            const quantity_after = await quantity_pdt.json();

            //check product_service: endpoint in the url structure
            if (item.quantity && item.quantity >= quantity_after.quantity) {
              toast(`Only ${quantity_after.quantity} item(s) available!`);
              return;
            }
            const newQuantity = (item.quantity ?? 0) + 1;
            incDecQty?.(newQuantity, item._id);
          } catch (err) {
            toast.error('server issue. try later to add more!')
          }

        }}
          title="Increase quantity"
        >
          +
        </button>
      </div>
      <hr />
    </div>
  );
}
