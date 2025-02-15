import {
  createContext,
  ReactNode,
  useState,
  useContext,
  useEffect,
} from 'react'
import type { AdminContextType } from './AdminContextType.d.ts'
import { createClient, SanityClient } from '@sanity/client'
import { ProductType } from '@/declarations/UserStateContextType.js'
import toast from 'react-hot-toast'
import { AdminFieldsType } from '@/declarations/AdminType.js'
import { useUser } from '@clerk/clerk-react'

const AdminContext = createContext<Partial<AdminContextType>>({})

const sanityClient: SanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  token: import.meta.env.VITE_SANITY_TOKEN,
  dataset: 'production',
})

export const AdminStateContext = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<any>({})
  const [isPlanActiveState, setIsPlanActive] = useState<boolean>(true)
  const [editProductForm, setEditProductForm] = useState<ProductType | null>() // To fill up form fields when a product is about to edit
  const { user, isLoaded } = useUser()

  useEffect(() => {
    async function checkAdminEnrolled() {
      let userEnrolled: AdminFieldsType[] = await sanityClient?.fetch(
        `*[_type=='admin' && adminId=='${user?.id}']`,
      )

      if (userEnrolled && userEnrolled?.length === 0) {
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
                  address: {
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
                    address: {
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

        if (expirationDay - today > 0) setIsPlanActive(true)
      }
      setAdmin(result[0])
    }

    if (user && isLoaded) mainCheck()
  }, [user, isLoaded])

  return (
    <AdminContext.Provider
      value={{
        editProductForm,
        setEditProductForm,
        isPlanActiveState,
        setIsPlanActive,
        admin,
        setAdmin,
        sanityClient,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export const useAdminStateContext = () => useContext(AdminContext)
