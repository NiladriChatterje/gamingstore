import React, { useRef, useState } from 'react'
import { useParams } from 'react-router';
import { useStateContext } from '../../StateContext';
import {data} from '../Products/data'
import './Details.css';

const Details = () => {
  const {id} = useParams();
  
  const [item]= useState(data?.find(i=>i.id===parseInt(id)))
  const ImgRef=useRef();
  const {addItemToOrderList,setItemIDCount} = useStateContext();


  return (
    <div id={'details__container'}>
      <img 
      ref={ImgRef}
      onMouseMove={e=>{
        ImgRef.current.style.transform=`translate(${e.movementX*5}px,${e.movementY*5}px)`;
      }}
      onMouseLeave={(e)=>{
        ImgRef.current.style.transform=`translate(0px,0px)`;
      }}
      src={item?.image} alt={item?.name} />
      <section>
          <h1>{item?.name}</h1>
          <section>
          <article>{item?.desc}</article>
          <button
          onClick={(e)=>{
            e.stopPropagation();
            addItemToOrderList(item)
            setItemIDCount({count:item.count,id:item.id})
            }}
          >ADD TO CART</button>
          </section>
          
      </section>
    </div>
  )
}

export default Details