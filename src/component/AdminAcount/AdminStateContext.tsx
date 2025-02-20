import {
  createContext,
  ReactNode,
  useState,
  useContext,
  useEffect,
} from 'react'
import type { AdminContextType } from '@declarations/AdminContextType.ts'
import { ProductType } from '@/declarations/UserStateContextType.ts'
import toast from 'react-hot-toast'
import { AdminFieldsType } from '@/declarations/AdminType.ts'
import { useUser } from '@clerk/clerk-react'
import { IoCaretDownCircleSharp, IoLocation } from 'react-icons/io5'

const AdminContext = createContext<Partial<AdminContextType>>({})


export const AdminStateContext = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<any>({})
  const [isPlanActiveState, setIsPlanActive] = useState<boolean>(true)
  const [retry, setRetry] = useState<boolean>(true)
  const [editProductForm, setEditProductForm] = useState<ProductType | null>() // To fill up form fields when a product is about to edit
  const { user, isLoaded } = useUser()

  useEffect(() => {
    async function checkAdminEnrolled() {
      // const response: Response= await fetch(`http://localhost:5003/fetch-admin-data/${user?.id}`,{
      //   method:'GET'
      // });
      
      let userEnrolled:AdminFieldsType[] = [] as AdminFieldsType[] /* await response.json();*/
      let toastLoadingId:string | undefined;
      if (userEnrolled.length === 0) {
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
                ){
                  if(toastLoadingId)
                    toast.dismiss(toastLoadingId)
                  toastLoadingId = toast(
                    'Update phone number!',{
                      position:'bottom-left',style:{width:320,background:'white'}
                    }
                  )}
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
                console.log('reverse geocoding : ', placeResult);


                //creating admin document
                const res:Response = await fetch(`http://localhost:5003/create-admin`,{
                  method:'POST',
                  headers:{
                    'Content-Type':'application/json',
                    'Accept':'application/json'
                  },
                  body:JSON.stringify({
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
                });

                const result = await res.json();
                if(!res.ok)
                    throw new Error(result);

                
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
                    _id: result?._id??"",
                  },
                ]
              } catch (e: Error | any) {
                toast.error(e.message,{
                  position:'bottom-left',style:{width:320,background:'white'}
                });
                toast.loading(<div style={{display:'flex',alignItems:'center'}}>Retry creating account 
                <IoCaretDownCircleSharp 
                cursor={'pointer'}
                  size={20}
                  onClick={()=>{setRetry(prev=>!prev);toast.dismiss()}} /></div>,{duration:Infinity,
                    position:"bottom-right"
                  })
            }
            }

            await userOps()
          },
          (error:GeolocationPositionError)=>{
            const toastId = toast(<div><IoLocation /> allow location</div>,{
              position:'bottom-left',style:{width:320,background:'white'}
            })
            const toastIdForMsg = toast.error(error.message);

            setTimeout(()=>{ 
              toast.dismiss(toastId);
              toast.dismiss(toastIdForMsg)
              setRetry(prev=>!prev)},1000)
           
          }
        )
      }

      return userEnrolled
    }

    async function mainCheck() {
      // check from sanity if user has an existing
      // subscription plan or not
      try{
        const result = await checkAdminEnrolled()
        if(!result)
            return;
        console.log(result)
        if (result.length > 0 && result[0]?.SubscriptionPlan) {
          let lastPlan = result[0].SubscriptionPlan.at(-1)
          const today = new Date().getTime()
          const expirationDay = new Date(
            lastPlan?.planSchemeList?.expireDate || new Date(),
          ).getTime()
  
          if (expirationDay - today > 0) setIsPlanActive(true)
        }
      console.log(result[0])
        setAdmin(result[0])
      }catch(err){
        toast.error("Failed!");
      }
      
    }

    if (user && isLoaded) mainCheck()
  }, [user, isLoaded,retry])

  return (
    <AdminContext.Provider
      value={{
        editProductForm,
        setEditProductForm,
        isPlanActiveState,
        setIsPlanActive,
        admin,
        setAdmin,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export const useAdminStateContext = () => useContext(AdminContext)
