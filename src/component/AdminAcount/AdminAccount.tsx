import { Navigate, Route, Routes } from "react-router-dom"
import { ProfileManager, SideBar, Home } from "./component"
import styles from './AdminAccount.module.css';
import { IoLogOutOutline } from "react-icons/io5";
import { SignedIn, SignedOut, SignOutButton, useUser, useSignIn } from "@clerk/clerk-react";
import SubscriptionPlan from "./SubscriptionPlan/SubscriptionPlan";
import { useEffect, useState } from "react";


const AdminAccount = () => {
  const [isPlanActiveState, setIsPlanActive] = useState(false);

  const { isLoaded } = useSignIn();
  const { user } = useUser();

  useEffect(() => {
    if (isLoaded) {
      //check from sanity if user has an existing 
      //subscription plan or not
      // const {isPlanActive} = useSanity(user.id);
      // if(!isPlanActive)
      setIsPlanActive(false)
    }
  }, [isPlanActiveState])


  return (
    <>
      <SignedIn>
        <div
          id={styles['outer-container']}
        >
          {user?.imageUrl && <div id={styles['avatar-container']}><img src={user?.imageUrl}
            id={styles['avatar']}
            alt={'user profile'}
          /><span>{user.firstName}</span></div>}
          <SignOutButton>
            <IoLogOutOutline
              cursor={'pointer'}
              size={25}
              style={{ position: 'fixed', top: 30, right: 60 }}
            />
          </SignOutButton>
          <div
            id={styles['admin-container']}>
            {isPlanActiveState && <SideBar />}

            {isPlanActiveState ?
              <section id={styles['admin-routes']}>
                <Routes>
                  <Route index element={<Navigate to={'/admin'} />} />
                  <Route path="/admin" element={<Home />} />
                  <Route path="/admin/orders" element={<h1>Orders</h1>} />
                  <Route path="/admin/sales" element={<h1>Sales</h1>} />
                  <Route path="/admin/edit-profile" element={<ProfileManager />} />
                  <Route path="/admin/add-product" element={<h1>Add product</h1>} />
                  <Route path="/admin/edit-product/:id" element={<h1>Edit product</h1>} />
                  <Route path="/admin/edit-bank" element={<h1>Edit bank account</h1>} />
                  <Route path="*" element={'No such route'} />
                </Routes>
              </section> :
              <SubscriptionPlan />
            }


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