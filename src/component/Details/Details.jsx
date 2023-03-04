import React, { useRef, useState } from 'react'
import { useParams,useNavigate } from 'react-router';
import { useStateContext } from '../../StateContext';
import {data} from '../Products/data'
import './Details.css';
import UpcomingData from '../Body/upcomingData';
import toast,{Toaster} from 'react-hot-toast';
 
const Details = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  
  const [item]= useState(data?.find(i=>i.id===parseInt(id))||UpcomingData?.find(i=>i.id===parseInt(id)))
  const ImgRef=useRef();
  const {addItemToOrderList,setItemIDCount} = useStateContext();


  return (
    <div id={'details__container'}>
      <Toaster />
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
            <span>₹ {item?.price}</span>
            <div>
            {id<100 && <button
            onClick={(e)=>{
              e.stopPropagation();
              addItemToOrderList(item)
              setItemIDCount({count:item.count,id:item.id})
              toast(`Product added to cart Successfully ✔`)
              }}
            >ADD TO CART</button>}

            {id<100 && <button
            onClick={(e)=>{
              e.stopPropagation();
              navigate('/Payment');
              }}
            >Buy NOW</button>}

            </div>
         
          </section>
          
      </section>
    </div>
  )
}

export default Details