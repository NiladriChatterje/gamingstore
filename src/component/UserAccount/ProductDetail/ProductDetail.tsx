import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserStateContext } from "../UserStateContext";
import { useStateContext } from "../../../StateContext";
import styles from "./ProductDetail.module.css";
import { ProductType } from "@declarations/ProductContextType";
import toast from "react-hot-toast";


const ProductDetail = () => {
  const [counter, setCounter] = useState(() => 1);
  const { id } = useParams<string>();
  const navigate = useNavigate();

  const ImgRef = useRef<HTMLImageElement>(null);
  if (!id) {
    navigate(-1);
    return;
  }
  //user Context
  const { addItemToCart, setIsOneItem, singleProductDetail, setSingleProductDetail } =
    useUserStateContext();
  const { setDefaultLoginAdminOrUser } = useStateContext();

  useEffect(() => {
    async function getProductDetailsFromApi(id: string) {
      const result = await fetch(`http://localhost:5002/fetch-product-detail/:${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (result.status == 200)
        setSingleProductDetail?.(await result.json() as ProductType);
    }
    if (!singleProductDetail)
      getProductDetailsFromApi(id);
  }, [singleProductDetail])

  useEffect(() => {
    if (singleProductDetail)
      singleProductDetail.quantity = counter;

    return () => { toast.dismiss() }
  }, [counter])

  return (
    <div id={styles.details__container}>
      {singleProductDetail?.imagesBase64 && <img
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
        src={singleProductDetail?.imagesBase64[0].base64}
        alt={singleProductDetail?.productName}
      />}
      <section id={styles["product-ProductDetail"]}>
        <h1>{singleProductDetail?.productName}</h1>
        <section id={styles["product-infos"]}>
          <article>{singleProductDetail?.productDescription}</article>
          <span>₹ {singleProductDetail?.price?.pdtPrice}</span>
          <div>
            {singleProductDetail && singleProductDetail?.quantity > 0 && (
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
                  <button onClick={() => {
                    if (counter == singleProductDetail?.quantity) {
                      toast(`only ${counter} product(s) available!`);
                      return;
                    }
                    setCounter((prev) => prev + 1)
                  }}>
                    +
                  </button>
                </div>
              </section>
            )}
            <section id={styles.counter_container}>
              {singleProductDetail && singleProductDetail?.quantity > 0 && (
                <button
                  style={{ marginRight: 10 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addItemToCart?.(singleProductDetail as ProductType);
                    toast.success(`Product added to cart Successfully`);
                  }}
                >
                  Add to cart
                </button>
              )}

              {singleProductDetail && singleProductDetail?.quantity > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    localStorage.setItem("isOneItem", "true");
                    setIsOneItem?.(true);
                    setDefaultLoginAdminOrUser?.("user");

                    const oneProduct = {
                      _id: singleProductDetail?._id,
                      productName: singleProductDetail?.productName,
                      price: singleProductDetail?.price,
                      productDescription: singleProductDetail?.productDescription,
                      eanUpcNumber: singleProductDetail?.eanUpcNumber,
                      quantity: counter,
                      imagesBase64: singleProductDetail?.imagesBase64
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

export default ProductDetail;
