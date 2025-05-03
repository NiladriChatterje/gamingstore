import React from "react";
import styles from "./OrderList.module.css";
import { AiFillCloseCircle } from "react-icons/ai";
import { useUserStateContext } from "../UserStateContext";

export default function OrderList({
  id,
  images,
  price,
  count,
}: {
  id: string;
  images: File[];
  price: number;
  count: number;
}) {
  const { data, setData, incDecQty, ItemIDCount } = useUserStateContext();
  const [counter, setCounter] = React.useState<number>(() => count);
  const [imageUrl, setImageUrl] = React.useState<string[]>(
    () => [] as string[]
  );
  React.useEffect(() => {
    incDecQty?.(counter, id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counter]);

  React.useEffect(() => {
    if (id === ItemIDCount?.id) setCounter(count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ItemIDCount]);

  React.useEffect(() => {
    images.map((image) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setImageUrl([...imageUrl, fileReader.result as string]);
      };
      fileReader.readAsDataURL(image);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles["orderList-container"]}>
      <AiFillCloseCircle
        onClick={() => {
          const temp = data?.filter((i) => i._id !== id);
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
        {imageUrl.map((imgUrl, i) => (
          <img src={imgUrl} key={i} alt={id} />
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
