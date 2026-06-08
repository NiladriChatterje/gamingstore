import styles from '../ProductsCard/ProductsCard.module.css'
import { useNavigate } from 'react-router-dom'

interface ItemType { _id: string; image: string; desc: string; name: string; price: number }

const UpcomingDataMap = (item: ItemType) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/user/Product/ProductDetail/${item._id}`)
      }}
      style={{ position: 'relative', cursor: 'pointer' }}
      key={item._id}
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