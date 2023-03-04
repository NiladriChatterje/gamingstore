import React, {  useMemo, useState } from 'react'
import './Products.css';
import { motion } from 'framer-motion';
import {FixedSizeList} from 'react-window';
import {data} from './data.js';
import  toast,{Toaster}  from 'react-hot-toast'
const ProductDetails = React.lazy(()=>import('../ProductDetails/ProductDetails'));

let x=0;
const Products = () => {
    const [toastText,setToastText] = useState(false);

    useMemo(()=>{
        if(x===0) x++;
        else
        toast(`Product added to cart Successfully ✔`);
    },[toastText])
    
    const Row = ({index,style})=>{
        return <div style={{...style,left:'50%',
        width:'300px',position:'absolute',transform:'translateX(-50%)'}}>
            <React.Suspense fallback={<div className="loader"></div>}>
        <ProductDetails style={style} item={data[index]} setToastText={setToastText} /></React.Suspense>
        </div> }


  return (
    <motion.div
        id={'Product-container'}
        initial={{x:300}}
        animate={{x:0}}>
            <Toaster />
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