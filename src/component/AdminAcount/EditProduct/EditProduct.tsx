// import styles from './EditProduct.module.css';
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminStateContext } from '../AdminStateContext'
import { ProductType } from '@declarations/ProductContextType'
import jwt from 'jsonwebtoken'

const EditProduct = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<ProductType[]>(() => []);
  const { admin, setEditProductForm } = useAdminStateContext()

  useEffect(() => {
    async function getProductList() {

      if (admin?._id)
        fetch(`http://localhost:5002/${admin?._id}/fetch-products`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwt.sign(admin?._id, import.meta.env.VITE_SECRET_KEY)}`
          }
        }).then(async (result: Response) => result.json()).then(data => {
          console.log("products of current admin : ", data)
          setProducts(data)
        })



    }
    if (admin?._id)
      getProductList()
  }, [admin])

  return (
    <>
      {products?.map(item => (
        <div
          key={item._id}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            navigate(`/${admin?._id}/fetch-product/${item._id}`)
            setEditProductForm?.(item)
          }}
        >
          EditProduct
        </div>
      ))}
    </>
  )
}

export default EditProduct
