import React from "react";
import styles from "./CartProduct.module.css";
import { AiFillCloseCircle } from "react-icons/ai";
import { useUserStateContext } from "../UserStateContext";
import toast from "react-hot-toast";

export default function CartProduct({
  _id,
  images,
  price,
  quantity,
}: {
  _id: string;
  images: { size: number; base64: string; extension: string }[] | undefined;
  price: number;
  quantity: number;
}) {
  const { cartData, setCartData, incDecQty } = useUserStateContext();
  const [counter, setCounter] = React.useState<number>(() => quantity);

  React.useEffect(() => {
    incDecQty?.(counter, _id);
  }, [counter]);

  return (
    <div className={styles["CartProduct-container"]}>
      <AiFillCloseCircle
        onClick={() => {
          setCartData?.(cartData?.filter((i) => i._id !== _id) ?? []);
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

        {images && images.length > 0 && <img src={images[0].base64} alt={_id} />}
      </div>

      <span>Rs. {price}</span>
      <div id={styles["quantity"]}>
        <button
          onClick={() => {
            if (counter <= 1) return 1;
            setCounter((prev) => prev - 1);
          }}
        >
          -
        </button>
        <h4>{counter}</h4>
        <button onClick={async () => {
          try {
            const quantity_pdt = await fetch(`http://localhost:5002/fetch-product-quantity/${'700135'}/${_id}`)
            const quantity_after = await quantity_pdt.json();

            //check product_service: endpoint in the url structure
            if (counter >= quantity_after.quantity) {
              toast(`Only ${quantity} items(s) available!`);
              return;
            }
            setCounter((prev) => prev + 1)
          } catch (err) {
            toast.error('server issue. try later to add more!')
          }

        }}>+</button>
      </div>
      <hr />
    </div>
  );
}
