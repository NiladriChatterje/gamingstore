import React from 'react'
import '../ProductDetails/ProductDetails.css'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router'


const UpcomingDataMap = (item) => {
  const navigate = useNavigate();

  return (
    <motion.div
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/Product/Details/${item.id}`)
      }}
      style={{ position: 'relative', cursor: 'pointer' }}
      key={item.id}
      id={'card'}
      initial={{ y: 80 }}
      whileInView={{ y: 0 }}>

      {item.image && <img
        src={item.image} alt='' />}
      <h3>{item?.name}</h3>
      <p>{item?.desc?.length > 30 ? item.desc.slice(0, 32) + '...' : item.desc}</p>

      <h2>₹{item?.price}</h2>
    </motion.div>
  )
}

export default UpcomingDataMap