import React from 'react'
import './ProductDetails.css';
import { HiShoppingCart } from 'react-icons/hi';
import { useStateContext } from '../../StateContext';
import { useNavigate } from 'react-router';

const ProductDetails = ({ item }) => {
  const { addItemToOrderList, setItemIDCount } = useStateContext();
  const navigate = useNavigate();

  return (
    <div
      onClick={e => {
        e.stopPropagation();
        navigate(`/Product/Details/${item.id}`)
      }}
      style={{ position: 'relative', cursor: 'pointer' }}
      key={item.id}
      id={'card'}>
      {item.image && <img
        src={item.image} alt='' />}
      <h3>{item?.name}</h3>
      <p>{item?.desc?.length > 30 ? item.desc.slice(0, 28) + '...' : item.desc}</p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          addItemToOrderList(item)
          setItemIDCount({ count: item.count, id: item.id });          
        }}>
        ADD TO CART <HiShoppingCart />
      </button>
      <h2>₹{item?.price}</h2>
    </div>
  );
};

export default ProductDetails;