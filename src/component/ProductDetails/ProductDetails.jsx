import React from 'react'
import './ProductDetails.css'
import { motion } from 'framer-motion'
import {HiShoppingCart} from 'react-icons/hi'
import { useStateContext } from '../../StateContext'


const ProductDetails = ({item}) => {
  const {addItemToOrderList,setItemIDCount} = useStateContext();
 
  return (
    <motion.div
        style={{position:'relative'}}
        key={item.id}
        id={'card'}
        initial={{y:80}}
        whileInView={{y:0}}>
          
            {item.image && <img
                src={item.image} alt='' />}
            <h3>{item?.name}</h3>
            <p>{item?.desc?.length>30?item.desc.slice(0,32)+'...':item.desc}</p>
            <button
              onClick={()=>{
                addItemToOrderList(item)
                setItemIDCount({count:item.count,id:item.id})
                }}>
                  ADD TO CART <HiShoppingCart />
                </button>
            <h2>₹{item?.price}</h2>
    </motion.div>
  )
}

export default ProductDetails