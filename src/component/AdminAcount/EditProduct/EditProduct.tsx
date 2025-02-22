// import styles from './EditProduct.module.css';
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminStateContext } from '../AdminStateContext'
import { ProductType } from '@declarations/UserStateContextType'

const EditProduct = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<ProductType[] >(() => []);
  const { admin, setEditProductForm } = useAdminStateContext()

  useEffect(() => {
    async function getProductList() {
   
        fetch(`http://localhost:5002/${admin.adminId}/fetch-products`, {
          method: 'GET',
        }).then(async (result:Response)=>result.json()).then(data=>{
          console.log("products of current admin : ",data)
          setProducts(data)
        })
       
        
      
    }
    if(admin?.adminId)
    getProductList()
  }, [admin])

  return (
    <>
      {products?.map(item => (
        <div
        key={item._id}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            navigate(`/${admin.adminId}/fetch-product/${item._id}`)
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
