import React, { useState } from 'react'
import styles from './Orders.module.css'
import { useUserStateContext } from '../UserStateContext';
import { ProductType } from '@/declarations/ProductContextType';


//order page list
const OrderPendingItem = ({ item }: { item: ProductType }) => {
  const [counter, setCounter] = useState<number>(() => item.quantity);
  const { incDecQty, setCartData, cartData } = useUserStateContext();

  React.useEffect(() => {
    incDecQty?.(counter, item._id)
  }, [counter]);


  return (
    <section
      className={styles['order-items']}>
      <figure className={styles['order-items-figure']}>
        {item?.imagesBase64 && item.imagesBase64.length > 0 && <img width={30} src={item?.imagesBase64[0]?.base64} />}
        <span>{item?.productName}</span>
      </figure>
      <section
        style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
        <section id={styles.counter_container}>
          <div
            style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => {
                if (counter <= 1) return 1;
                setCounter(prev => prev - 1)
              }}>-</button>
            <span>{counter}</span>
            <button
              onClick={() => setCounter(prev => prev + 1)}>+</button>
          </div>
        </section>
        <button
          className={styles['button']}
          onClick={() => {
            localStorage.setItem("isOneItem", "true");
          }}
        >
          Buy
        </button>
        <button
          className={styles['button']}
          onClick={() => {
            if (cartData)
              setCartData?.(cartData?.filter(cartItem => cartItem._id !== item._id))
          }}
        >
          Delete
        </button>
      </section>
    </section>
  )
}

export default OrderPendingItem;