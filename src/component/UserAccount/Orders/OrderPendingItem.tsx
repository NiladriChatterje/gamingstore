import React, { useState } from 'react'
import styles from './Orders.module.css'
import { useUserStateContext } from '../UserStateContext';
import { ProductType } from '@/declarations/UserStateContextType';

const OrderPendingItem = ({ item }: { item: ProductType }) => {
  const [counter, setCounter] = useState<number>(() => 1);
  const { data, setData, incDecQty, ItemIDCount } = useUserStateContext();

  React.useEffect(() => {
    incDecQty?.(counter, item._id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counter]);

  React.useEffect(() => {
    if (item._id === ItemIDCount?.id)
      setCounter(item.quantity ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ItemIDCount])

  return (
    <section
      className={styles['order-items']}>
      <span>{item?.productName}</span>
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