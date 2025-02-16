// import styles from './EditProduct.module.css';
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminStateContext } from '../AdminStateContext'
import { ProductType } from '@/declarations/UserStateContextType'

const EditProduct = () => {
  const navigate = useNavigate()
  const [products, _setProducts] = useState<ProductType[] | any[]>(() => [
    1, 2, 3, 4, 5,
  ])
  const { admin, setEditProductForm } = useAdminStateContext()

  useEffect(() => {
    async function getProductList() {
      fetch(`http://localhost:5000/${admin._id}/fetch-products`, {
        method: 'GET',
        headers: {},
      })
    }
    getProductList()
  }, [])

  return (
    <>
      {products?.map(item => (
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => {
            navigate(`${item}`)
            setEditProductForm?.(item)
          }}
        >
          EditProduct {item}
        </div>
      ))}
    </>
  )
}

export default EditProduct
