// import styles from './EditProduct.module.css';
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminStateContext } from '../AdminStateContext'
import { ProductType } from '@declarations/ProductContextType'
import { useAuth } from '@clerk/clerk-react'

const EditProduct = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<ProductType[]>(() => []);
  const { admin, setEditProductForm } = useAdminStateContext()
  const { getToken } = useAuth();

  useEffect(() => {
    async function getProductList() {
      const token = await getToken();
      fetch(`http://localhost:5002/${admin?._id}/fetch-products`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          "x-admin-id": admin?._id ?? ''
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
