import React from 'react'
import './ProductDetails.css'
import { motion } from 'framer-motion'

const ProductDetails = ({item}) => {
  return (
    <motion.div
        key={item.id}
        id={'card'}
        initial={{y:20}}
        whileInView={{y:0}}>
            {item.image && <img
                src={item.image} alt='' />}
            <h3>{item?.name}</h3>
            <p>{item?.desc}</p>
            <h2>{item?.price}</h2>
    </motion.div>
  )
}

export default ProductDetails