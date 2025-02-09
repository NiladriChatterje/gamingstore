import { HiShoppingCart } from 'react-icons/hi';
import { useUserStateContext } from '../UserStateContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ProductType } from '@declarations/ProductContextType';
import { forwardRef, Ref } from 'react';
import styles from './ProductDetails.module.css';

const ProductDetails = ({ item }: {
  item: ProductType;
}, ref: Ref<HTMLDivElement>) => {
  const { addItemToOrderList, setItemIDCount } = useUserStateContext();
  const navigate = useNavigate();

  return (
    <div
      ref={ref}
      onClick={e => {
        e.stopPropagation();
        navigate(`/user/Product/Details/${item.id}`)
      }}
      style={{ position: 'relative', cursor: 'pointer' }}
      key={item.id}
      id={styles.card}>
      {item.image && <img
        src={item.image} alt='' />}
      <h3>{item?.name}</h3>
      <p>{item?.desc?.length > 30 ? item.desc.slice(0, 28) + '...' : item.desc}</p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          addItemToOrderList?.(item)
          setItemIDCount?.({ count: item.count, id: item.id });
          toast("Item added to Cart 🛒")
        }}>
        Add to Cart <HiShoppingCart />
      </button>
      <h2>₹{item?.price}</h2>
    </div>
  );
};

export default forwardRef(ProductDetails);