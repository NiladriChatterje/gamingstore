import React from 'react'
import './Products.css';
import { motion } from 'framer-motion';
import {FixedSizeList} from 'react-window';
import {data} from './data.js';
const ProductDetails = React.lazy(()=>import('../ProductDetails/ProductDetails'));

const Products = () => {
    
    const Row = ({index,style})=>{
        return <div style={{...style,left:'50%',
        width:'300px',position:'absolute',transform:'translateX(-50%)'}}>
            <React.Suspense fallback={<div className="loader"></div>}>
        <ProductDetails style={style} item={data[index]} /></React.Suspense>
        </div> }


  return (
    <motion.div
        id={'Product-container'}
        initial={{x:300}}
        animate={{x:0}}>
        <FixedSizeList
            height={window.innerHeight-70}
            width={window.innerWidth}
            itemCount={data.length}
            itemSize={500}
           
        >
        {Row}
        </FixedSizeList>
        
    </motion.div>
  )
}

export default Products