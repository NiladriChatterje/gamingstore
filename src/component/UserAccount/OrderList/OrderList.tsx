import React from "react";
import styles from "./OrderList.module.css";
import { AiFillCloseCircle } from "react-icons/ai";
import { useUserStateContext } from "../UserStateContext";

export default function OrderList({
  _id,
  images,
  price,
  count,
}: {
  _id: string;
  images: { size: number; base64: string; extension: string }[] | undefined;
  price: number;
  count: number;
}) {
  const { data, setData, incDecQty, ItemIDCount } = useUserStateContext();
  const [counter, setCounter] = React.useState<number>(() => count);

  React.useEffect(() => {
    incDecQty?.(counter, _id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counter]);

  React.useEffect(() => {
    if (_id === ItemIDCount?.id) setCounter(count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ItemIDCount]);

  return (
    <div className={styles["orderList-container"]}>
      <AiFillCloseCircle
        onClick={() => {
          const temp = data?.filter((i) => i._id !== _id);
          setData?.(temp ? [...temp] : []);
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
        {images?.map((img, i) => (
          <img src={img?.base64} key={i} alt={_id} />
        ))}
      </div>

      <span>Rs. {price}</span>
      <div id={styles["count"]}>
        <button
          onClick={() => {
            if (counter <= 1) return 1;
            setCounter((prev) => prev - 1);
          }}
        >
          -
        </button>
        <h4>{counter}</h4>
        <button onClick={() => setCounter((prev) => prev + 1)}>+</button>
      </div>
      <hr />
    </div>
  );
}
