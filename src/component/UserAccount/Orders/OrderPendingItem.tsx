import React, { useState } from 'react'
import styles from './Orders.module.css'
import { useUserStateContext } from '../UserStateContext';
import { ProductType } from '@/declarations/ProductContextType';


//order page list
const OrderPendingItem = ({ item }: { item: ProductType }) => {
  const [counter, setCounter] = useState<number>(() => 1);
  const { incDecQty } = useUserStateContext();

  React.useEffect(() => {
    incDecQty?.(counter, item._id)
  }, [counter]);

  React.useEffect(() => {
    setCounter(item.quantity ?? 0);
  }, [])

  return (
    <section
      className={styles['order-items']}>
      <figure>
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
      </section>
    </section>
  )
}

export default OrderPendingItem;