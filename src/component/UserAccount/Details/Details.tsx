import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserStateContext } from "../UserStateContext";
import { useStateContext } from "@/StateContext";
import styles from "./Details.module.css";
import UpcomingData from "../Body/upcomingData";
import { ProductType } from "@declarations/ProductContextType";
import toast from "react-hot-toast";

const data: ProductType[] = [];

const Details = () => {
  const [counter, setCounter] = useState(() => 1);
  const { id } = useParams<string>();
  const navigate = useNavigate();

  const [item] = useState(
    data?.find((i) => id && i._id === id) ||
    UpcomingData?.find((i) => id && i._id === id)
  );
  const ImgRef = useRef<HTMLImageElement>(null);
  const { addItemToOrderList, setItemIDCount, setOneItem } =
    useUserStateContext();
  const { setDefaultLoginAdminOrUser } = useStateContext();

  return (
    <div id={styles.details__container}>
      {item?.imagesBase64 && <img
        style={{ objectFit: "contain", width: 300 }}
        ref={ImgRef}
        onMouseMove={(e) => {
          if (ImgRef.current)
            ImgRef.current.style.transform = `translate(${e.movementX * 5}px,${e.movementY * 5
              }px)`;
        }}
        onMouseLeave={() => {
          if (ImgRef.current)
            ImgRef.current.style.transform = `translate(0px,0px)`;
        }}
        src={item?.imagesBase64[0].base64}
        alt={item?.productName}
      />}
      <section id={styles["product-details"]}>
        <h1>{item?.productName}</h1>
        <section id={styles["product-infos"]}>
          <article>{item?.productDescription}</article>
          <span>₹ {item?.price}</span>
          <div>
            {id && parseInt(id) < 100 && (
              <section id={styles.counter_container}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <button
                    onClick={() => {
                      if (counter <= 1) return 1;
                      setCounter((prev) => prev - 1);
                    }}
                  >
                    -
                  </button>
                  <span>{counter}</span>
                  <button onClick={() => setCounter((prev) => prev + 1)}>
                    +
                  </button>
                </div>
              </section>
            )}
            <section id={styles.counter_container}>
              {id && parseInt(id) < 100 && (
                <button
                  style={{ marginRight: 10 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addItemToOrderList?.(item as ProductType);
                    setItemIDCount?.({ count: item?.quantity, id: item?._id });
                    toast.success(`Product added to cart Successfully`);
                  }}
                >
                  Add to cart
                </button>
              )}

              {id && parseInt(id) < 100 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    localStorage.setItem("isOneItem", "true");
                    setOneItem?.(true);
                    setDefaultLoginAdminOrUser?.("user");
                    const foundData = data?.find(
                      (item: ProductType) => item._id === id
                    );
                    let oneProduct = {
                      name: foundData?.productName,
                      price: foundData?.price,
                      qty: counter,
                    };
                    localStorage.setItem(
                      "oneProduct",
                      JSON.stringify(oneProduct)
                    );
                    navigate("/user/Payment");
                  }}
                >
                  Buy now
                </button>
              )}
            </section>
          </div>
        </section>
      </section>
    </div>
  );
};

export default Details;
