import React from 'react';
import styles from './OrderList.module.css'
import { AiFillCloseCircle } from 'react-icons/ai'
import { useUserStateContext } from '../UserStateContext';

export default function OrderList({ id, image, price, count }: { id: number; image: string; price: number; count: number }) {
    const { data, setData, incDecQty, ItemIDCount } = useUserStateContext();
    const [counter, setCounter] = React.useState<number>(() => count)

    React.useEffect(() => {
        incDecQty?.(counter, id)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [counter]);

    React.useEffect(() => {
        if (id === ItemIDCount?.id)
            setCounter(count);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ItemIDCount])

    return <div
        className={styles['orderList-container']}>

        <AiFillCloseCircle
            onClick={() => {
                const temp = data?.filter(i => i.id !== id)
                setData?.(temp ? [...temp] : [])
            }}
            style={{ color: 'black', position: 'absolute', top: 40, right: 10, cursor: 'pointer' }} />
        <img src={image} alt='' />
        <span>Rs. {price}</span>
        <div
            id={styles['count']}>
            <button
                onClick={() => {
                    if (counter <= 1) return 1;
                    setCounter(prev => prev - 1);
                }}>-</button>
            <h4>{counter}</h4>
            <button
                onClick={() => setCounter(prev => prev + 1)}>
                +
            </button>
        </div>
        <hr />
    </div>
};