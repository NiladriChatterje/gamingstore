import React from 'react';
import './OrderList.css'

export default function OrderList({image,price}){
    const [counter,setCounter] = React.useState(()=> 1)

    return  <div
                id={'orderList-container'}>
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