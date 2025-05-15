import styles from "./Products.module.css";
import ProductDetails from "../ProductDetails/ProductDetails.tsx";
import { useEffect, useRef, useState } from "react";
import { ProductType } from "@declarations/ProductContextType";
import { FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";
import { v7 as uuid7 } from 'uuid'

const pdts: ProductType[] = [
  {
    _id: `product_${uuid7()}`,
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
  {
    _id: "3",
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
    _id: "4",
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
  const [search, setSearch] = useState<string>(() => '');

  useEffect(() => {
    // fetch(`http//localhost:5002/fetch-all-products`)
    //   .then((res) => res.json())
    //   .then((data) => {
    //     console.log(data);
    //     setPdtData(data);
    //   });
    // console.log(ProductRef.current);
  }, []);

  useEffect(() => {
    let timeoutId: number | string | NodeJS.Timeout | undefined;
    if (search.length > 3) {
      timeoutId = setTimeout(() => {
        fetch(`http://localhost:5005/search?s=${search}`, {
          method: "GET",
          headers: {
            "Content-Type": "text/plain"
          }
        });
        toast(search);
      }, 3000)


    }

    return () => { clearTimeout(timeoutId) }
  }, [search])

  return (
    <section id={styles['product-container-wrapper']}>
      <div id={styles['search-bar']}>
        <input
          placeholder="atleast 3 characters"
          onInput={e => setSearch(e.currentTarget.value)} type="text" />
        <FaSearch size={15} />
      </div>
      <div>
        <section>
          <span>All</span>
          <span>Groceries</span>
          <span>Gaming</span>
          <span>Clothes</span>
        </section>
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
