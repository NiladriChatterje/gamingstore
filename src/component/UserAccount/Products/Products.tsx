import styles from "./Products.module.css";
import ProductDetails from "../ProductDetails/ProductDetails.tsx";
import { useEffect, useRef, useState } from "react";
import { ProductType } from "@declarations/ProductContextType";
import { FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";
import { FaSquareCaretLeft, FaSquareCaretRight } from "react-icons/fa6";
import { ProductCategories } from '@/enums/enums.ts'

const Products = () => {
  const [productData, setPdtData] = useState<ProductType[]>(() => []);
  const [page, setPage] = useState<number>(() => 1);
  const [category, setCategory] = useState<string>(() => ProductCategories.ALL);
  const ProductRef = useRef<HTMLDivElement[]>([]);
  const [search, setSearch] = useState<string>(() => '');

  useEffect(() => {
    fetch(`http://localhost:5002/fetch-products/${category}/${page}`)
      .then((res) => {
        if (!res.ok)
          throw new Error();
        return res.json()
      })
      .then((data) => {
        console.log(`data`, data);
        setPdtData(data);
      }).catch(err => console.log(err));
    // console.log(ProductRef.current);
  }, [page, category]);

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
        <section id={styles['category-list']}>
          <span onClick={() => { setCategory(ProductCategories.ALL) }}>All</span>
          <span onClick={() => { setCategory(ProductCategories.GROCERIES) }}>Groceries</span>
          <span onClick={() => { setCategory(ProductCategories.GADGETS) }}>Gadgets</span>
          <span onClick={() => { setCategory(ProductCategories.CLOTH) }}>Clothes</span>
          <span onClick={() => { setCategory(ProductCategories.TOYS) }}>Toys</span>
        </section>
      </div>
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
      <div id={styles['pagination']}>
        <FaSquareCaretLeft />
        <FaSquareCaretRight />
      </div>
    </section>
  );
};

export default Products;
