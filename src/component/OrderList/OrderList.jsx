import React from 'react';
import './OrderList.css'
import {AiFillCloseCircle} from 'react-icons/ai'
import { useStateContext } from '../../StateContext';


export default function OrderList({id,image,price,count}){
    const {data,setData,incDecQty,ItemIDCount} = useStateContext();
    const [counter,setCounter] = React.useState(()=>count)

    React.useEffect(()=>{
        incDecQty(counter,id)
    },[counter]);

    React.useEffect(()=>{
        if(id===ItemIDCount?.id)
            setCounter(count)
    },[ItemIDCount])

    return  <div
                className={'orderList-container'}>
                   
                    <AiFillCloseCircle
                        onClick={()=>{
                            setData([...data.filter(i=>i.id!==id)]);
                            setCounter(0);
                        }}
                        style={{color:'white',position:'absolute',top:40,right:10,cursor:'pointer'}} />
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
                        onClick={()=>setCounter(prev=>prev+1)}>
                            +
                            </button>
                    </div>
                    <hr />
            </div>
};