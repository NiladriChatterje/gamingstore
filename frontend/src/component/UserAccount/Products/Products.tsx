import styles from "./Products.module.css";
import ProductsCard from "../ProductsCard/ProductsCard.tsx";
import { useEffect, useState } from "react";
import { ProductType } from "@declarations/ProductContextType";
import { FaSearch } from "react-icons/fa";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { ProductCategories } from '../../../enums/enums.ts'

const Products = () => {
  const [productData, setPdtData] = useState<ProductType[]>(() => []);
  const [page, setPage] = useState<number>(() => 1);
  const [category, setCategory] = useState<string>(() => ProductCategories.ALL);
  const [search, setSearch] = useState<string>(() => '');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const PINCODE = '700135';
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5002/fetch-products/${PINCODE}/${category}/${page}`)
      .then((res) => {
        if (!res.ok)
          throw new Error(`API Error: ${res.status}`);
        return res.json()
      })
      .then((data) => {
        console.log(`Fetched data for page ${page}:`, data);
        setPdtData(data || []);
        // Check if we got less than ITEMS_PER_PAGE items, meaning no more pages
        setHasMore(data && data.length >= ITEMS_PER_PAGE);
      }).catch(err => {
        console.error('Error fetching products:', err);
        setPdtData([]);
        setHasMore(false);
      }).finally(() => {
        setLoading(false);
      });
  }, [page, category]);

  useEffect(() => {
    let timeoutId: number | string | NodeJS.Timeout | undefined;
    if (search.length > 3) {
      setLoading(true);
      timeoutId = setTimeout(() => {
        fetch(`http://localhost:5005/search?s=${search}`, {
          method: "GET",
          headers: {
            "Content-Type": "text/plain"
          }
        }).then(res => res.json())
          .then(data => {
            console.log(`data from search : `, data);
            setPdtData(data || []);
            setHasMore(false); // Search results don't paginate
          })
          .catch(err => {
            console.error('Search error:', err);
            setPdtData([]);
          })
          .finally(() => {
            setLoading(false);
          });
      }, 1000);
    } else if (search.length === 0) {
      // Reset to category view when search is cleared
      setPage(1);
    }

    return () => { clearTimeout(timeoutId) }
  }, [search])

  return (
    <section id={styles['product-container-wrapper']}>
      <div id={styles['search-bar']}>
        <input
          placeholder="atleast 3 characters"
          onInput={e => setSearch(e.currentTarget.value)}
          type="text"
        />
        <FaSearch size={15} />
      </div>
      <div>
        <section id={styles['category-list']}>
          <span
            onClick={() => {
              setPage(1);
              setCategory(ProductCategories.ALL)
            }}
          >
            All
          </span>
          <span
            onClick={() => {
              setPage(1);
              setCategory(ProductCategories.GROCERIES)
            }}
          >
            Groceries
          </span>
          <span
            onClick={() => {
              setPage(1);
              setCategory(ProductCategories.GADGETS)
            }}
          >
            Gadgets
          </span>
          <span
            onClick={() => {
              setPage(1);
              setCategory(ProductCategories.CLOTH)
            }}
          >
            Clothes
          </span>
          <span
            onClick={() => {
              setPage(1);
              setCategory(ProductCategories.TOYS)
            }}
          >
            Toys
          </span>
        </section>
      </div>
      <div id={styles["pdt_container"]}>
        {loading ? (
          <div className={styles.loader}></div>
        ) : productData.length > 0 ? (
          productData.map((item: ProductType) => (
            <ProductsCard
              key={item._id}
              item={item}
            />
          ))
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <p>No products found</p>
          </div>
        )}
      </div>
      <div id={styles['pagination']}>
        <MdNavigateBefore
          size={28}
          onClick={() => {
            if (page <= 1) return;
            setPage(prev => prev - 1);
          }}
          className={styles['pagination-btn']}
          style={{
            opacity: page <= 1 ? 0.5 : 1,
            cursor: page <= 1 ? 'not-allowed' : 'pointer'
          }}
        />

        <span className={styles['page-number']}>
          {page}
        </span>

        <MdNavigateNext
          size={28}
          onClick={() => {
            if (!hasMore || loading) return;
            setPage(prev => prev + 1);
          }}
          className={styles['pagination-btn']}
          style={{
            opacity: !hasMore || loading ? 0.5 : 1,
            cursor: !hasMore || loading ? 'not-allowed' : 'pointer'
          }}
        />
      </div>
    </section>
  );
};

export default Products;
