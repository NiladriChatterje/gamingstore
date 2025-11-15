import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminStateContext } from '../AdminStateContext'
import { ProductType } from '@declarations/ProductContextType'
import { useAuth } from '@clerk/clerk-react'
import styles from './EditProduct.module.css'

const EditProduct = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<ProductType[]>(() => []);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { admin, setEditProductForm } = useAdminStateContext()
  const { getToken } = useAuth();

  useEffect(() => {
    async function getProductList() {
      if (!admin?._id) return;

      setLoading(true);
      setError('');

      try {
        const token = await getToken();
        const response = await fetch(`http://localhost:5003/${admin._id}/fetch-products`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            "x-admin-id": admin._id
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("products of current admin : ", data);
        setProducts(data);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }

    getProductList();
  }, [admin, getToken]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>Error: {error}</p>
        <button
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p className={styles.emptyMessage}>No products found</p>
        <p className={styles.emptySubtext}>Start by adding your first product</p>
      </div>
    );
  }

  return (
    <div className={styles.productListContainer}>
      <h2 className={styles.title}>Your Products ({products.length})</h2>
      <div className={styles.productGrid}>
        {products.map(item => (
          <div
            key={item._id}
            className={styles.productCard}
            onClick={() => {
              navigate(`/${admin?._id}/fetch-product/${item._id}`)
              setEditProductForm?.(item)
            }}
          >
            <div className={styles.productImage}>
              {item.imagesBase64 && item.imagesBase64.length > 0 ? (
                <img
                  src={item.imagesBase64[0].base64}
                  alt={item.productName}
                  className={styles.image}
                />
              ) : (
                <div className={styles.noImage}>No Image</div>
              )}
            </div>

            <div className={styles.productInfo}>
              <h3 className={styles.productName}>{item.productName}</h3>
              <p className={styles.category}>{item.category}</p>
              <div className={styles.priceQuantity}>
                <span className={styles.price}>
                  {item.price.currency} {item.price.pdtPrice}
                </span>
                <span className={styles.quantity}>Qty: {item.quantity}</span>
              </div>
              {item.price.discountPercentage > 0 && (
                <span className={styles.discount}>
                  {item.price.discountPercentage}% OFF
                </span>
              )}
            </div>

            <div className={styles.productActions}>
              <button className={styles.editButton}>
                Edit Product
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EditProduct
