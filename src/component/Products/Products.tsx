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
                width: '100%',
                display: 'flex', flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: window.innerWidth < 1200 ? '18%' : '5%'
            }}>
            {data.map((item: OrderType) => <ProductDetails
                key={item.id}
                ref={(el: HTMLDivElement) => { ProductRef.current?.push(el) }}
                item={item} />)}
        </div>
    );
}

export default Products;