import styles from './OrderListItem.module.css';
import { AiOutlineArrowRight } from 'react-icons/ai';
import { motion } from 'framer-motion';
import { OrderList } from '../components';
import { useStateContext } from '../../StateContext';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';


const OrderListItem = () => {
  const { data, totalPrice, oneItem, slide, setSlide } = useStateContext();
  const navigate = useNavigate();

  return <>
    <motion.div
      className={`${styles['slider-container']} ${slide ? '' : styles['hide-slider']}`}>
      <div
        className={styles[`slider`]} >
        <AiOutlineArrowRight
          onClick={() => {
            if (setSlide)
              setSlide(false)
          }}
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
              if (setSlide)
                setSlide(false);
            }
            else toast("Cart is empty!");
          }}
          initial={{ y: 60 }}
          animate={{ y: 0 }}
          id={styles['payment']}>
          <span>Place Order</span>
          <span
            id={styles['total-price']}
          >₹ {totalPrice}</span>
        </motion.button>
      </div>
    </motion.div>
  </>
}
export default OrderListItem;