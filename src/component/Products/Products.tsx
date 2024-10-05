import './Products.css';
import { data } from './data.js';
import ProductDetails from '../ProductDetails/ProductDetails.tsx';
import { useEffect, useRef } from 'react';
import { OrderType } from '../../StateContext.tsx';

const Products = () => {
    const ProductRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        console.log(ProductRef.current)
    }, []);

    return (
        <div
            style={{
                marginLeft: 'auto',
                marginRight: 'auto',
                width: '80%',
                gap: 30,
                display: 'flex', flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: '7%'
            }}>
            {data.map((item: OrderType) => <ProductDetails
                key={item.id}
                ref={(el: HTMLDivElement) => { ProductRef.current?.push(el) }}
                item={item} />)}
        </div>
    );
}

export default Products;