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
import { SignOutButton, useUser } from '@clerk/clerk-react'
import SubscriptionPlan from './SubscriptionPlan/SubscriptionPlan'
import { useStateContext } from '../../StateContext'
import { useAdminStateContext } from './AdminStateContext'
import NotFound from '../../NotFound'

const AdminAccount = () => {
  const { defaultLoginAdminOrUser } = useStateContext()
  const {
    isPlanActiveState,
    setIsPlanActive,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    fetchFilteredStatistics
  } = useAdminStateContext()
  const { user } = useUser();

  // Handle date change and fetch filtered data
  const handleDateChange = async (type: 'from' | 'to', date: Date | null) => {
    if (type === 'from') {
      setFromDate?.(date);
    } else {
      setToDate?.(date);
    }

    // Fetch filtered statistics when both dates are available
    const updatedFromDate = type === 'from' ? date : fromDate;
    const updatedToDate = type === 'to' ? date : toDate;

    if (updatedFromDate && updatedToDate && fetchFilteredStatistics) {
      await fetchFilteredStatistics(updatedFromDate, updatedToDate);
    }
  };

  // Format date for input field
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };


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
                <section className={styles.dateSection}>
                  <div id={styles.fromDate}>
                    <label htmlFor="fromDate">From Date:</label>
                    <input
                      type="date"
                      id="fromDate"
                      value={formatDateForInput(fromDate || null)}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : null;
                        handleDateChange('from', date);
                      }}
                      max={formatDateForInput(toDate || new Date())}
                    />
                  </div>
                  <div id={styles.toDate}>
                    <label htmlFor="toDate">To Date:</label>
                    <input
                      type="date"
                      id="toDate"
                      value={formatDateForInput(toDate || null)}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : null;
                        handleDateChange('to', date);
                      }}
                      min={formatDateForInput(fromDate || null)}
                      max={formatDateForInput(new Date())}
                    />
                  </div>
                </section>
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
