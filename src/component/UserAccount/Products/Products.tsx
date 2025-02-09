import styles from './Products.module.css';
import { data } from './data.js';
import ProductDetails from '../ProductDetails/ProductDetails.tsx';
import { useEffect, useRef } from 'react';
import { ProductType } from '../../../StateContext.tsx';

const Products = () => {
    const ProductRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        console.log(ProductRef.current)
    }, []);

    return (
        <div
            id={styles['pdt_container']}>
            {data.map((item: ProductType) => <ProductDetails
                key={item.id}
                ref={(el: HTMLDivElement) => { ProductRef.current?.push(el) }}
                item={item} />)}
        </div>
    );
}

export default Products;