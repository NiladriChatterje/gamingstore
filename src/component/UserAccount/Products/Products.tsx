import styles from "./Products.module.css";
import ProductDetails from "../ProductDetails/ProductDetails.tsx";
import { useEffect, useRef, useState } from "react";
import { ProductType } from "@declarations/ProductContextType";
import { FaSearch } from "react-icons/fa";

const pdts: ProductType[] = [
  {
    _id: "1",
    productName: "xbox",
    category: "gaming",
    eanUpcIsbnGtinAsinType: "EAN",
    eanUpcNumber: "45645416",
    price: 3364.02,
    currency: "INR",
    imagesBase64: [{ size: 452, extension: "jpg", base64: "" }],

    modelNumber: "MADOL565G",
    productDescription: "best selling product",
    quantity: 45,
    keywords: ["gaming", "joystick", "pc", "gadgets"],
    discount: 10,
    seller: ["Nil"],
  },
  {
    _id: "2",
    productName: "xbox",
    category: "gaming",
    eanUpcIsbnGtinAsinType: "EAN",
    eanUpcNumber: "45645416",
    price: 3364.02,
    currency: "INR",
    imagesBase64: [{ size: 452, extension: "jpg", base64: "" }],
    modelNumber: "MADOL565G",
    productDescription: "best selling product",
    quantity: 45,
    keywords: ["gaming", "joystick", "pc", "gadgets"],
    discount: 10,
    seller: ["Nil"],
  },
];
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
    <section>
      <div>
        <input />
        <FaSearch size={25} />
      </div>
      <div id={styles["pdt_container"]}>
        {pdts.map((item: ProductType) => (
          <ProductDetails
            key={item._id}
            ref={(el: HTMLDivElement) => {
              ProductRef.current?.push(el);
            }}
            item={item}
          />
        ))}
      </div>
    </section>
  );
};

export default Products;
