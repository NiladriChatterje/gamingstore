import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserStateContext } from "../UserStateContext";
import { useStateContext } from "../../../StateContext";
import styles from "./ProductDetail.module.css";
import { ProductType } from "@declarations/ProductContextType";
import toast from "react-hot-toast";
import { AiFillLeftCircle, AiFillRightCircle } from "react-icons/ai";


const ProductDetail = () => {
  const [counter, setCounter] = useState(() => 1);
  const { id } = useParams<string>();
  const navigate = useNavigate();

  const ImgRef = useRef<HTMLImageElement[]>([]);
  if (!id) {
    navigate(-1);
    return;
  }
  const carouselContainerRef = useRef<HTMLDivElement>(null);
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
      const data = await result.json() as ProductType
      console.log("SingleProductDetails from api :", data);
      if (result.status == 200)
        setSingleProductDetail?.(data);
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
      {singleProductDetail?.imagesBase64 && <div
        style={{ display: 'flex', alignItems: 'center', alignContent: 'center', justifyContent: 'center', height: '80%' }}>
        <AiFillLeftCircle size={40} color={'rgb(43,43,43)'} cursor={'pointer'}
          onClick={() => {
            if (carouselContainerRef.current) {
              carouselContainerRef.current.scrollLeft -= ImgRef.current[0].width
              console.log(carouselContainerRef.current.scrollLeft)
            }
          }} />
        <div
          ref={carouselContainerRef}
          id={styles[`image-carousel`]}>
          {singleProductDetail?.imagesBase64?.map((item, i) => (
            <img key={i}
              style={{ objectFit: "contain", width: 300 }}
              ref={ele => { if (ele) ImgRef.current.push(ele) }}
              onMouseMove={(e) => {
                if (ImgRef.current[i])
                  ImgRef.current[i].style.transform = `translate(${e.movementX * 5}px,${e.movementY * 5}px)`;
              }}
              onMouseLeave={() => {
                if (ImgRef.current[i])
                  ImgRef.current[i].style.transform = `translate(0px,0px)`;
              }}
              src={item.base64}
              alt={singleProductDetail?.productName}
            />))}
        </div>
        <AiFillRightCircle size={40} color={'rgb(43,43,43)'} cursor={'pointer'}
          onClick={() => {
            if (carouselContainerRef.current)
              carouselContainerRef.current.scrollLeft += ImgRef.current[0].width
          }} />
      </div>
      }
      <section id={styles["product-ProductDetail"]}>

        <h1>{singleProductDetail?.productName}</h1>
        <section id={styles["product-infos"]}>
          <section
            id={styles['sub-productDetails-container']}
          >
            <article>{singleProductDetail?.productDescription}</article>
            <span>₹ {singleProductDetail?.price?.pdtPrice}</span>
          </section>
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
              {singleProductDetail && singleProductDetail?.quantity > 0 ? (
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
              ) : ''}

              {singleProductDetail && singleProductDetail?.quantity > 0 ? (
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
              ) :
                <button disabled={true}>
                  Out of Stock!
                </button>}
            </section>
          </div>
        </section>
      </section>
    </div>
  );
};

export default ProductDetail;
