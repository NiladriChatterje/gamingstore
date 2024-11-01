import { Navigate, Route, Routes } from "react-router-dom"
import { SideBar } from "./component"
import styles from './AdminAccount.module.css';
import { IoLogOutOutline } from "react-icons/io5";
import { SignedIn, SignedOut, SignOutButton, useUser } from "@clerk/clerk-react";

const AdminAccount = () => {
  const { user } = useUser();

  return (
    <>
      <SignedIn>
        <div
          id={styles['outer-container']}
        >
          {user?.imageUrl && <img src={user?.imageUrl}
            id={styles['avatar']}
            alt={'user profile'}
          />}
          <SignOutButton>
            <IoLogOutOutline
              cursor={'pointer'}
              size={25}
              style={{ position: 'fixed', top: 30, right: 60 }}
            />
          </SignOutButton>
          <div
            id={styles['admin-container']}>
            <SideBar />
            <section id={styles['admin-routes']}>
              <Routes>
                <Route index element={<Navigate to={'/admin'} />} />
                <Route path="/admin" element={<h1>Hellooo Admin Page</h1>} />
                <Route path="/admin/orders" element={<h1>Orders</h1>} />
                <Route path="/admin/sales" element={<h1>Sales</h1>} />
                <Route path="/admin/edit-profile" element={<h1>Profile</h1>} />
                <Route path="/admin/add-product" element={<h1>Add product</h1>} />
                <Route path="/admin/edit-product/:id" element={<h1>Edit product</h1>} />
                <Route path="/admin/edit-bank" element={<h1>Edit bank account</h1>} />
                <Route path="*" element={'No such route'} />
              </Routes>
            </section>
          </div>

          <span>e-cart</span>

        </div>
      </SignedIn>
      <SignedOut>
        <Navigate to={'/'} />
      </SignedOut>
    </>
  )
}

export default AdminAccount