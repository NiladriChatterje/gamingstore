import styles from "./Products.module.css";
import ProductDetails from "../ProductDetails/ProductDetails.tsx";
import { useEffect, useRef, useState } from "react";
import { ProductType } from "@declarations/UserStateContextType";

const Products = () => {
  const [productData, setPdtData] = useState<ProductType[]>(() => []);
  const ProductRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    fetch(`http//localhost:5002/fetch-all-products`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setPdtData(data);
      });
    console.log(ProductRef.current);
  }, []);

  return (
    <div id={styles["pdt_container"]}>
      {productData.map((item: ProductType) => (
        <ProductDetails
          key={item._id}
          ref={(el: HTMLDivElement) => {
            ProductRef.current?.push(el);
          }}
          item={item}
        />
      ))}
    </div>
  );
};

export default Products;
