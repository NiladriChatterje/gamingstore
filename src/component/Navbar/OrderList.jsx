import React from 'react';
import './OrderList.css'
import {AiFillCloseCircle} from 'react-icons/ai'
import { useContext } from 'react';
import { ProductContext } from '../../App';

export default function OrderList({item,image,price}){
    const [counter,setCounter] = React.useState(()=> 1)
    const {data,setData} = useContext(ProductContext);

  

    return  <div
                id={'orderList-container'}>
                    <AiFillCloseCircle
                        onClick={()=>{
                             return null;
                        }}
                        style={{color:'white',position:'absolute',top:10,right:10,cursor:'pointer'}} />
                    <img src={image} alt = '' />
                    <span>Rs. {price}</span>
                    <div
                        id='count'>
                            
                    <button
                        onClick={()=>{
                            if(counter<=1) return 1;

                            setCounter(prev=>prev-1);
                        }}>-</button>
                    <h4>{counter}</h4>
                    <button
                        onClick={()=>setCounter(prev=>prev+1)}>+</button>
                    </div>
                    <hr />
            </div>
}