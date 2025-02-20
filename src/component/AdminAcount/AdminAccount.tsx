import { Navigate, Route, Routes } from 'react-router-dom'
import {
  ProfileManager,
  SideBar,
  Home,
  AddProduct,
  EditProduct,
  EditProductDetails,
} from './component'
import styles from './AdminAccount.module.css'
import { IoLogOutOutline } from 'react-icons/io5'
import {  SignOutButton, useUser } from '@clerk/clerk-react'
import SubscriptionPlan from './SubscriptionPlan/SubscriptionPlan'
import { useStateContext } from '@/StateContext'
import { useAdminStateContext } from './AdminStateContext'
import NotFound from '@/NotFound'

const AdminAccount = () => {
  const { defaultLoginAdminOrUser } = useStateContext()
  const { isPlanActiveState, setIsPlanActive } = useAdminStateContext()
  const { user } = useUser();

  
  return (
    <>
        {defaultLoginAdminOrUser === 'admin' && (
          <div id={styles['outer-container']}>
            {user?.imageUrl && (
              <div id={styles['avatar-container']}>
                <img
                  src={user?.imageUrl}
                  id={styles['avatar']}
                  alt={'user profile'}
                />
                <span>{user.firstName}</span>
              </div>
            )}
            <SignOutButton>
              <IoLogOutOutline
                onClick={() => {
                  localStorage.setItem('loginusertype', 'user')
                }}
                cursor={'pointer'}
                size={25}
                style={{ position: 'fixed', top: 30, right: 60 }}
              />
            </SignOutButton>
            <div id={styles['admin-container']}>
              {isPlanActiveState && <SideBar />}

              {isPlanActiveState ? (
                <section id={styles['admin-routes']}>
                  <Routes>
                    <Route index path='/' element={<Home />} />
                    <Route index path='/admin' element={<Home />} />
                    <Route path='/admin/sales' element={<h1>Sales</h1>} />
                    <Route
                      path='/admin/edit-profile'
                      element={<ProfileManager />}
                    />
                    <Route path='/admin/add-product' element={<AddProduct />} />
                    <Route
                      path='/admin/edit-product/'
                      element={<EditProduct />}
                    />
                    <Route
                      path='/admin/edit-product/:product_id'
                      element={<EditProductDetails />}
                    />
                    <Route
                      path='/admin/edit-bank'
                      element={<h1>Edit bank account</h1>}
                    />
                    <Route path='/admin/*' element={<NotFound />} />
                    <Route
                      path='*'
                      element={
                        <>
                          <Navigate to={'/admin'} />
                        </>
                      }
                    />
                  </Routes>
                </section>
              ) : (
                <SubscriptionPlan
                  setIsPlanActive={
                    setIsPlanActive as React.Dispatch<
                      React.SetStateAction<boolean>
                    >
                  }
                />
              )}
            </div>
            <span>e-cart</span>
          </div>
        )}
    </>
  )
}

export default AdminAccount
