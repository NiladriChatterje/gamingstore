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
import { SignedIn, SignOutButton, useSignIn, useUser } from '@clerk/clerk-react'
import SubscriptionPlan from './SubscriptionPlan/SubscriptionPlan'
import { useStateContext } from '../../StateContext'
import { useAdminStateContext } from './AdminStateContext'
import NotFound from '../../NotFound'
import { useEffect } from 'react'
import type { AdminFieldsType } from '@/declarations/AdminType'
import toast from 'react-hot-toast'

const AdminAccount = () => {
  const { defaultLoginAdminOrUser } = useStateContext()
  const { isPlanActiveState, setIsPlanActive, sanityClient, setAdmin } =
    useAdminStateContext()
  const { user } = useUser()
  const { isLoaded } = useSignIn()

  useEffect(() => {
    async function checkAdminEnrolled() {
      let userEnrolled: AdminFieldsType[] | any = await sanityClient?.fetch(
        `*[_type=='admin' && adminId=='${user?.id}']`,
      )

      if (userEnrolled?.length === 0) {
        toast('allowing location for inventory is important')
        navigator.geolocation.getCurrentPosition(
          async ({
            coords: { latitude, longitude },
          }: {
            coords: { latitude: number; longitude: number }
          }) => {
            const userOps = async () => {
              try {
                if (
                  !user?.phoneNumbers[0]?.phoneNumber &&
                  !userEnrolled[0]?.phone
                )
                  toast(
                    '! Fill up phone number for notifications in profile-manager tab',
                  )
                const response = await fetch(
                  `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${
                    import.meta.env.VITE_GEOAPIFY_API
                  }`,
                  {
                    method: 'GET',
                  },
                )
                const { features } = await response.json()
                const placeResult = features[0]
                console.log('reverse geocoding : ', placeResult)
                let result = await sanityClient?.create({
                  _type: 'admin',
                  username: user?.firstName,
                  adminId: user?.id,
                  email: user?.emailAddresses[0].emailAddress,
                  geoPoint: {
                    lat: latitude,
                    lng: longitude,
                  },
                  AddressObjectType: {
                    pinCode: placeResult?.properties?.postcode,
                    county: placeResult?.properties?.county,
                    state: placeResult?.properties?.state,
                    country: placeResult?.properties?.country,
                  },
                })

                console.log('document created : ', result)
                userEnrolled = [
                  {
                    username: user?.firstName,
                    adminId: user?.id,
                    email: user?.emailAddresses[0].emailAddress,
                    geoPoint: {
                      lat: latitude,
                      lng: longitude,
                    },
                    AddressObjectType: {
                      pinCode: placeResult?.properties?.postcode,
                      county: placeResult?.properties?.county,
                      state: placeResult?.properties?.state,
                      country: placeResult?.properties?.country,
                    },
                    _id: result?._id,
                  },
                ]
              } catch (e: Error | any) {
                toast.error(e.message)
              }
            }

            await userOps()
          },
        )
      }

      return userEnrolled
    }

    async function mainCheck() {
      if (isLoaded) {
        // check from sanity if user has an existing
        // subscription plan or not
        const result = await checkAdminEnrolled()
        console.log(result)
        if (result.length > 0 && result[0]?.SubscriptionPlan) {
          let lastPlan = result[0].SubscriptionPlan.at(-1)
          const today = new Date().getTime()
          const expirationDay = new Date(
            lastPlan?.planSchemeList?.expireDate || new Date(),
          ).getTime()

          if (expirationDay - today > 0) setIsPlanActive?.(true)
        }
        setAdmin?.(result[0])
      }
    }

    mainCheck()
  }, [])

  return (
    <>
      <SignedIn>
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
                      path='/admin/edit-product/:id'
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
      </SignedIn>
    </>
  )
}

export default AdminAccount
