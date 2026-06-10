import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminStateContext } from '../AdminStateContext'
import { ProductType } from '@declarations/ProductContextType'
import { useAuth } from '@clerk/clerk-react'
import styles from './EditProduct.module.css'

interface ShardGroup {
  shardHost: string;
  stores: {
    storeInfo: {
      id: number;
      store_number: number;
      pincode: string;
      shard_host?: string;
      county?: string;
      state?: string;
      country?: string;
    };
    products: ProductType[];
  }[];
  productCount: number;
}

const EditProduct = () => {
  const navigate = useNavigate()
  const [storeGroups, setStoreGroups] = useState<any[]>([]);
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
        console.log("store groups for current admin : ", data);
        setStoreGroups(data);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }

    getProductList();
  }, [admin, getToken]);

  // Group store groups by shard_host
  const shardSections = useMemo<ShardGroup[]>(() => {
    const shardMap = new Map<string, ShardGroup>();
    for (const group of storeGroups) {
      const shardHost = group.storeInfo?.shard_host || 'unknown';
      if (!shardMap.has(shardHost)) {
        shardMap.set(shardHost, { shardHost, stores: [], productCount: 0 });
      }
      const section = shardMap.get(shardHost)!;
      section.stores.push(group);
      section.productCount += (group.products?.length || 0);
    }
    // Sort shards by name (e.g. mysql1, mysql2, mysql3...)
    return Array.from(shardMap.values()).sort((a, b) => a.shardHost.localeCompare(b.shardHost));
  }, [storeGroups]);

  const totalProducts = useMemo(() =>
    shardSections.reduce((sum, s) => sum + s.productCount, 0),
    [shardSections]
  );

  function renderProductCard(item: ProductType) {
    return (
      <div
        key={item._id}
        className={styles.productCard}
        onClick={() => {
          navigate(`/admin/edit-product/${item._id}`)
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
            {item.price && (
              <span className={styles.price}>
                {item.price.currency} {item.price.pdtPrice}
              </span>
            )}
            <span className={styles.quantity}>Qty: {item.quantity}</span>
          </div>
          {item.price?.discountPercentage !== undefined && item.price.discountPercentage > 0 && (
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
    );
  }

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

  if (totalProducts === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p className={styles.emptyMessage}>No products found</p>
        <p className={styles.emptySubtext}>Start by adding your first product</p>
      </div>
    );
  }

  return (
    <div className={styles.productListContainer}>
      <h2 className={styles.title}>Your Products ({totalProducts})</h2>
      {shardSections.map(section => (
        <div key={section.shardHost} className={styles.shardSection}>
          <div className={styles.shardHeader}>
            <span className={styles.shardIcon}>☛</span>
            <span className={styles.shardName}>{section.shardHost}</span>
            <span className={styles.shardCount}>{section.productCount} product{section.productCount !== 1 ? 's' : ''}</span>
          </div>

          {section.stores.map((group, idx) => (
            <div key={idx} className={styles.storeSection}>
              <div className={styles.storeHeader}>
                <span className={styles.storeBadge}>Store #{group.storeInfo.store_number}</span>
                <span className={styles.storePincode}>pincode: {group.storeInfo.pincode}</span>
                {group.storeInfo.county && <span className={styles.storeCounty}>{group.storeInfo.county}</span>}
              </div>

              {group.products && group.products.length > 0 ? (
                <div className={styles.productGrid}>
                  {group.products.map(renderProductCard)}
                </div>
              ) : (
                <p className={styles.emptyStoreText}>No products in this store</p>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default EditProduct
