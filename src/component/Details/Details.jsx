import React, { useRef, useState,useEffect } from 'react'
import { useParams, useNavigate } from 'react-router';
import { useStateContext } from '../../StateContext';
import { data } from '../Products/data'
import './Details.css';
import UpcomingData from '../Body/upcomingData';
import toast, { Toaster } from 'react-hot-toast';

const Details = () => {
  const [counter, setCounter] = useState(() => 1)
  const { id } = useParams();
  const navigate = useNavigate();

  const [item] = useState(data?.find(i => i.id === parseInt(id)) || UpcomingData?.find(i => i.id === parseInt(id)))
  const ImgRef = useRef();
  const { addItemToOrderList, setItemIDCount,oneItem, setOneItem, setOneProduct } = useStateContext();
  useEffect(()=>{
    localStorage.setItem("oneItem",oneItem);
  },[oneItem]);

  return (
    <div id={'details__container'}>
      <Toaster containerStyle={{fontSize:'0.7em',fontWeight:'900'}} />
      <img
        ref={ImgRef}
        onMouseMove={e => {
          ImgRef.current.style.transform = `translate(${e.movementX * 5}px,${e.movementY * 5}px)`;
        }}
        onMouseLeave={(e) => {
          ImgRef.current.style.transform = `translate(0px,0px)`;
        }}
        src={item?.image} alt={item?.name} />
      <section>
        <h1>{item?.name}</h1>
        <section>
          <article>{item?.desc}</article>
          <span>₹ {item?.price}</span>
          <div>
            {id < 100 && <section id={'counter_container'}>
              <button
                onClick={() => {
                  if (counter <= 1) return 1;
                  setCounter(prev => prev - 1)
                }}>-</button>
              <span>{counter}</span>
              <button
                onClick={() => setCounter(prev => prev + 1)}>+</button>
            </section>}
            {id < 100 && <button
              onClick={(e) => {
                e.stopPropagation();
                addItemToOrderList(item)
                setItemIDCount({ count: item.count, id: item.id })
                toast(`Product added to cart Successfully ✔`)
              }}
            >ADD TO CART</button>}

            {id < 100 && <button
              onClick={(e) => {
                e.stopPropagation();
                setOneItem(true);
                const foundData = data?.find(item => parseInt(item.id) === parseInt(id));
                setOneProduct({ name: foundData?.name, price: foundData?.price, qty: counter });
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