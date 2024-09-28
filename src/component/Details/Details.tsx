import { useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router';
import { useStateContext } from '../../StateContext';
import { data } from '../Products/data.ts'
import './Details.css';
import UpcomingData from '../Body/upcomingData';
import { OrderType } from '../../ProductContextType';
import toast from 'react-hot-toast';

const Details = () => {
  const [counter, setCounter] = useState(() => 1);
  const { id } = useParams<string>();
  const navigate = useNavigate();

  const [item] = useState(data?.find(i => id && i.id === parseInt(id)) || UpcomingData?.find(i => id && i.id === parseInt(id)))
  const ImgRef = useRef<any>();
  const { addItemToOrderList, setItemIDCount, oneItem } = useStateContext();

  return (
    <div id={'details__container'}>
      <img
        ref={ImgRef}
        onMouseMove={e => {
          ImgRef.current.style.transform = `translate(${e.movementX * 5}px,${e.movementY * 5}px)`;
        }}
        onMouseLeave={() => {
          ImgRef.current.style.transform = `translate(0px,0px)`;
        }}
        src={item?.image} alt={item?.name} />
      <section>
        <h1>{item?.name}</h1>
        <section>
          <article>{item?.desc}</article>
          <span>₹ {item?.price}</span>
          <div>
            {id && parseInt(id) < 100 && <section id={'counter_container'}>
              <button
                onClick={() => {
                  if (counter <= 1) return 1;
                  setCounter(prev => prev - 1)
                }}>-</button>
              <span>{counter}</span>
              <button
                onClick={() => setCounter(prev => prev + 1)}>+</button>
            </section>}
            {id && parseInt(id) < 100 && <button
              onClick={(e) => {
                e.stopPropagation();
                addItemToOrderList?.(item as OrderType)
                setItemIDCount?.({ count: item?.count, id: item?.id })
                toast(`Product added to cart Successfully ✅`)
              }}
            >ADD TO CART</button>}

            {id && parseInt(id) < 100 && <button
              onClick={(e) => {
                e.stopPropagation();
                if (oneItem !== undefined)
                  oneItem.current = true;
                localStorage.setItem('oneItem', 'true');
                const foundData = data?.find((item: OrderType) => item.id === parseInt(id));
                let oneProduct = { name: foundData?.name, price: foundData?.price, qty: counter }
                localStorage.setItem('oneProduct', JSON.stringify(oneProduct));
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