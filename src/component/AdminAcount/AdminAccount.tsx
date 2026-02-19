import { useEffect, useMemo } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import {
  ProfileManager,
  SideBar,
  Home,
  AddProduct,
  EditProduct,
  EditProductDetails,
  Orders,
} from './component'
import styles from './AdminAccount.module.css'
import { IoLogOutOutline } from 'react-icons/io5'
import { SignOutButton, useUser } from '@clerk/clerk-react'
import SubscriptionPlan from './SubscriptionPlan/SubscriptionPlan'
import StoreSetup from './StoreSetup/StoreSetup'
import { useStateContext } from '../../StateContext'
import { useAdminStateContext } from './AdminStateContext'
import NotFound from '../../NotFound'

const AdminAccount = () => {
  const { defaultLoginAdminOrUser } = useStateContext()
  const { isPlanActiveState, setIsPlanActive, admin, setAdmin } = useAdminStateContext()
  const { user } = useUser();

  // How many stores the current subscription plan allots
  const allottedStoreCount = useMemo(() => {
    if (!admin?.subscriptionPlan?.length) return 0;
    // Take the max storeAllotment from all subscription records (stacking plans)
    return admin.subscriptionPlan.reduce(
      (max: number, plan: any) => Math.max(max, plan.storeAllotment ?? 1),
      0
    );
  }, [admin?.subscriptionPlan]);

  // Whether all allotted stores have been configured
  const storesConfigured = useMemo(() => {
    if (!isPlanActiveState) return false;
    if (allottedStoreCount === 0) return false;
    return (admin?.stores?.length ?? 0) >= allottedStoreCount;
  }, [isPlanActiveState, admin?.stores, allottedStoreCount]);

  useEffect(() => {
    if (!user?.id) return;

    console.log('[FRONTEND SSE] 🔌 Initializing EventSource for seller:', `seller-${user.id}`);
    const eventSource = new EventSource(`http://localhost:4000/events?sellerId=seller-${user.id}`);

    eventSource.onopen = () => {
      console.log('[FRONTEND SSE] Connection opened successfully');
    };

    eventSource.onerror = (error) => {
      console.error('[FRONTEND SSE] Connection error:', error);
      console.error('[FRONTEND SSE] ReadyState:', eventSource.readyState);
    };

    eventSource.onmessage = (event) => {
      console.log('[FRONTEND SSE] Raw event received:', event.data);

      try {
        const data = JSON.parse(event.data);
        console.log('[FRONTEND SSE] Parsed data:', JSON.stringify(data, null, 2));

        if (data.message === 'connected') {
          console.log('[FRONTEND SSE] Connection confirmation received');
          return;
        }

        if (data.topic === 'subscription-notifications') {
          console.log('[FRONTEND SSE] Subscription notification received');
          const { sellerId, status } = data.payload;
          console.log('[FRONTEND SSE] Checking - User ID:', `seller-${user.id}`, 'Payload sellerId:', sellerId, 'Status:', status);

          if (sellerId === `seller-${user.id}` && status === 'success') {
            console.log('[FRONTEND SSE] ✅ Seller ID matches and status is success - updating state');
            if (setIsPlanActive) {
              setIsPlanActive(true);
              console.log('[FRONTEND SSE] isPlanActive set to true');
            } else {
              console.warn('[FRONTEND SSE] setIsPlanActive is not available');
            }
          } else {
            console.log('[FRONTEND SSE] Condition not met - sellerId match:', sellerId === user.id, 'status success:', status === 'success');
          }
        } else {
          console.log('[FRONTEND SSE] Non-subscription notification:', data.topic);
        }
      } catch (error) {
        console.error('[FRONTEND SSE] Error parsing SSE message:', error);
        console.error('[FRONTEND SSE] Raw data:', event.data);
      }
    };

    return () => {
      console.log('[FRONTEND SSE] 🔌 Closing EventSource connection');
      eventSource.close();
    };
  }, [user?.id, setIsPlanActive]);

  const renderContent = () => {
    // 1. No active subscription → show plans
    if (!isPlanActiveState) {
      return (
        <SubscriptionPlan
          setIsPlanActive={setIsPlanActive as React.Dispatch<boolean>}
        />
      );
    }

    // 2. Subscription active but stores not configured yet → show store setup gate
    if (!storesConfigured) {
      return (
        <StoreSetup
          storeCount={allottedStoreCount}
          onComplete={() => {
            // Force a small re-render by touching admin state — stores were already
            // updated optimistically in StoreSetup; this triggers the gate re-check.
            setAdmin?.((prev: any) => ({ ...prev }));
          }}
        />
      );
    }

    // 3. Everything ready → show full admin dashboard
    return (
      <div id={styles['admin-container']}>
        <SideBar />
        <section id={styles['admin-routes']}>
          <Routes>
            <Route index path='/' element={<Home />} />
            <Route index path='/admin' element={<Home />} />
            <Route path='/admin/orders' element={<Orders />} />
            <Route path='/admin/sales' element={<h1>Sales</h1>} />
            <Route path='/admin/edit-profile' element={<ProfileManager />} />
            <Route path='/admin/add-product' element={<AddProduct />} />
            <Route path='/admin/edit-product/' element={<EditProduct />} />
            <Route path='/admin/edit-product/:product_id' element={<EditProductDetails />} />
            <Route path='/admin/edit-bank' element={<h1>Edit bank account</h1>} />
            <Route path='/admin/*' element={<NotFound />} />
            <Route path='*' element={<><Navigate to={'/admin'} /></>} />
          </Routes>
        </section>
      </div>
    );
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
          {renderContent()}
          <span>e-cart</span>
        </div>
      )}
    </>
  )
}

export default AdminAccount
