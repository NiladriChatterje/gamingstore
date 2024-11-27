import styles from '../ProductDetails/ProductDetails.module.css'
import { useNavigate } from 'react-router-dom'

interface ItemType { id: number; image: string; desc: string; name: string; price: number }

const UpcomingDataMap = (item: ItemType) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/user/Product/Details/${item.id}`)
      }}
      style={{ position: 'relative', cursor: 'pointer' }}
      key={item.id}
      id={styles['card']}
    >

      {item.image && <img
        src={item.image} alt='' />}
      <h3>{item?.name}</h3>
      <p>{item?.desc?.length > 30 ? item.desc.slice(0, 32) + '...' : item.desc}</p>

      <h2>₹{item?.price}</h2>
    </div>
  )
}

export default UpcomingDataMap