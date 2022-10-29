import React from 'react'
import './ProductDetails.css'
import { motion } from 'framer-motion'
import {HiShoppingCart} from 'react-icons/hi'
import { ProductContext } from '../../App'

var i =0;
const ProductDetails = ({item}) => {
  const {setData,data} = React.useContext(ProductContext);

  React.useEffect(()=>{
    localStorage.setItem('orders',JSON.stringify(data));
  },[data])

  function OrderList(){
    let flag=0;
              console.log(item.id)
                if(i === 0)
                  setData([...data,item]);

                for(let i of data){
                  console.log(i)
                  if(i.id === item.id)
                    {
                    flag = 1;
                      break;
                    }
                  }
                  
                  if(flag === 0)
                    {
                      setData([...data,item]);
                      i=1;
                    }
                
  }
   
  
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
                OrderList();
                }}>
                  ADD TO CART <HiShoppingCart />
                </button>
            <h2>₹{item?.price}</h2>
    </motion.div>
  )
}

export default ProductDetails