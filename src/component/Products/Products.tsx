import './Products.css';
import { FixedSizeList } from 'react-window';
import { data } from './data.js';
import ProductDetails from '../ProductDetails/ProductDetails.tsx';

const Products = () => {

    const Row = ({ index, style }: {
        index: number;
        style: any;
    }) => {
        return <div style={{ ...style, left: '50%', width: '300px', transform: 'translateX(-50%)' }}>
            <ProductDetails item={data[index]} />
        </div>
    };
    return (
        <FixedSizeList
            style={{ marginTop: window.innerWidth < 1200 ? '18%' : '0' }}
            height={window.innerHeight - 70}
            width={window.innerWidth}
            itemCount={data.length}
            itemSize={500}>
            {Row}
        </FixedSizeList>
    );
}

export default Products;