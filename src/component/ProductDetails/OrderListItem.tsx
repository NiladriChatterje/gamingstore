import { useState } from 'react';
import './OrderListItem.css';
import { BsFillBagPlusFill } from 'react-icons/bs'
import { AiOutlineArrowRight } from 'react-icons/ai';
import { motion } from 'framer-motion';
import { OrderList } from '../components';
import { useStateContext } from '../../StateContext';
import { useNavigate } from 'react-router';


const OrderListItem = () => {
  const [slide, setSlide] = useState(() => false);
  const { data, totalPrice, oneItem } = useStateContext();
  const navigate = useNavigate();

  return <>
    <motion.div
      className={`slider-container ${slide ? '' : 'hide-slider'}`}>
      <div
        className={`slider`} >
        <AiOutlineArrowRight
          onClick={() => setSlide(false)}
          style={{
            position: 'fixed', fontWeight: "900",
            left: 8, top: 10, color: 'black',
            fontSize: 25, cursor: 'pointer',
            zIndex: 20
          }} />
        {data?.map((item, i) => <OrderList key={i} id={item.id} image={item.image} price={item.price} count={item.count} />)}
        <motion.button
          onClick={() => {
            if (totalPrice !== 0) {
              navigate('/Payment');
              if (oneItem)
                oneItem.current = false;
              localStorage.setItem('oneItem', false.toString());
              setSlide(false);
            }
          }}
          initial={{ y: 60 }}
          animate={{ y: 0 }}
          id={'payment'}>
          <span>Place ORDER</span>
          <span
            style={{
              textAlign: 'right', backgroundColor: 'white', color: 'black',
              position: 'fixed', bottom: 15, right: 10, borderRadius: '10px'
            }}
          >₹ {totalPrice}</span>
        </motion.button>
      </div>
    </motion.div>
    <BsFillBagPlusFill
      onClick={() => setSlide(true)}
      id={'BsFillBagPlusFill'}
      style={{
        zIndex: 6,
        cursor: 'pointer', top: 12,
        position: 'fixed', right: 90
      }} />
  </>
}
export default OrderListItem;