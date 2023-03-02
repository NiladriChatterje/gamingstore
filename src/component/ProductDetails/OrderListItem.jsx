import React, { useEffect } from 'react';
import './OrderListItem.css';
import {BsFillBagPlusFill} from 'react-icons/bs'
import {AiOutlineClose} from 'react-icons/ai';
import { motion } from 'framer-motion';
import { OrderList } from '../components';
import { useStateContext } from '../../StateContext';


const OrderListItem=()=>{
    const {data,slide,setSlide,totalPrice} = useStateContext();
   
    
    return <>
    <div className={`slider-container ${slide?'':'hide-slider'}`}>
    <div
            className= {`slider`} >
               <AiOutlineClose
                        onClick={()=>setSlide(false)}
                        style={{position:'fixed',fontWeight:"900",
                        right:8,top:7,color:'black',
                        fontSize:25,cursor:'pointer',
                        zIndex:20}} />
              {data?.map((item,i)=><OrderList key={i} id={item.id} image={item.image} price={item.price} count={item.count} />)}
              <motion.button
                onClick={()=>{
                 window.open('https://www.google.com');
                }}
                initial={{y:60}}
                animate={{y:0}}
                id={'payment'}>
                  <span>Place ORDER</span>
                  <span>Rs. {totalPrice}</span> 
              </motion.button>
          </div>
        </div>
        <BsFillBagPlusFill
          onClick={()=>setSlide(true)}
          style={{color:'white',zIndex:6,
                height:20,width:20,cursor:'pointer',top:'10',
                position:'fixed',right:90}} />
    </>
}
export default OrderListItem;