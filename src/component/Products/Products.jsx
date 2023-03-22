import './Products.css';
import { FixedSizeList } from 'react-window';
import { data } from './data.js';
import ProductDetails from '../ProductDetails/ProductDetails';

const Products = () => {

    const Row = ({ index, style }) => {
        return <div style={{...style, left: '50%',width: '300px', transform: 'translateX(-50%)'}}>
            <ProductDetails style={style} item={data[index]} />
        </div>
    };
    return (    
            <FixedSizeList
                height={window.innerHeight - 70}
                width={window.innerWidth}
                itemCount={data.length}
                itemSize={500}>
                {Row}
            </FixedSizeList>          
    );
}

export default Products;