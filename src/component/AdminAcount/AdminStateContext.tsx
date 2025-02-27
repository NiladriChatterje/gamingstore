/// <reference types="vite-plugin-svgr/client" />
import PreLoader from '@/PreLoader'
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
import { SignOutButton, useUser } from '@clerk/clerk-react'
import {  IoLocation, IoLogOutOutline } from 'react-icons/io5';
import  ServiceUnavailable from '@/assets/serviceUavailable.svg'
import { MdReplayCircleFilled } from 'react-icons/md'

const AdminContext = createContext<Partial<AdminContextType>>({})


export const AdminStateContext = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminFieldsType | unknown>(()=>undefined)
  const [isPlanActiveState, setIsPlanActive] = useState<boolean>(true)
  const [loadingState, setLoadingState] = useState<boolean>(true)
  const [retry, setRetry] = useState<boolean>(true)
  const [editProductForm, setEditProductForm] = useState<ProductType | null>() // To fill up form fields when a product is about to edit
  const { user, isLoaded } = useUser()


  async function checkAdminEnrolled() {
    const response: Response= await fetch(`http://localhost:5003/fetch-admin-data/${user?.id}`,{
      method:'GET'
    });
    
    let userEnrolled:AdminFieldsType[] =await response.json();
    let toastLoadingId:string | undefined;
    let placeResult: { properties: { postcode: string; county: string; state: string; country: string } };



    //userOps definition
    const userOps = async (latitude:number,longitude:number) => {
        if (
          !user?.phoneNumbers[0]?.phoneNumber &&
          !userEnrolled[0]?.phone
        ){
          if(toastLoadingId)
            toast.dismiss(toastLoadingId)

         
       
        const responseGeo = await fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${
            import.meta.env.VITE_GEOAPIFY_API
          }`,
          {
            method: 'GET',
          },
        )
        const { features } = await responseGeo.json()
         placeResult = features[0]
        console.log('reverse geocoding : ', placeResult);


        try{
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
            _id: user?.id,
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

        const result = await res.text();
        if(!res.ok)
            throw new Error(result); 
      }
      catch(err:Error|any){
        toast.dismiss();
        toast.error(err.message,{
          position:'bottom-left',style:{width:320,background:'white'}
        });
        toast.loading(<div style={{display:'flex',alignItems:'center'}}>Retry creating account</div>,{
          icon:<MdReplayCircleFilled 
          cursor={'pointer'}
            size={25}
            onClick={()=>{setRetry(prev=>!prev);toast.dismiss()}} />,
          duration:Infinity,
            position:"bottom-right"
          });
          setLoadingState(false);
          return;
      }

        toastLoadingId = toast(
          'Update phone number!',{
            position:'bottom-left',style:{width:320,background:'white'}
          }
        )}

        //if the document created successfully
        setAdmin({
          _type: 'admin',
          username: user?.firstName,
          _id: user?.id,
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
        });
    }
//userOps definition end


    if (userEnrolled.length === 0) {
      navigator.geolocation.getCurrentPosition(
        async ({
          coords: { latitude, longitude },
        }: {
          coords: { latitude: number; longitude: number }
        }) => {

          await userOps(latitude,longitude);
          console.log("<userEnrolled after calling userOps>");
        },
        (error:GeolocationPositionError)=>{
          const toastId = toast(<div>allow location</div>,{
            position:'bottom-left',style:{width:320,background:'white',fontSize:'small'},
            icon:<IoLocation size={25} />
          })
          const toastIdForMsg = toast.error(error.message,{
            position:'bottom-left',style:{width:320,background:'white',fontSize:'small'}
          });

          setTimeout(()=>{ 
            toast.dismiss(toastId);
            toast.dismiss(toastIdForMsg)
            setRetry(prev=>!prev)},4000)
         
        }
      )
    }
    setLoadingState(false);
    return userEnrolled
  }




  useEffect(() => {
    async function mainCheck() {
      // check from sanity if user has an existing
      // subscription plan or not
      try{
        const result:AdminFieldsType[] = await checkAdminEnrolled()
        
        if(result.length===0)
            return;
        if (result.length > 0 && result[0]?.SubscriptionPlan) {
          let lastPlan = result[0].SubscriptionPlan.at(-1)
          const today = new Date().getTime()
          const expirationDay = new Date(
            lastPlan?.planSchemeList?.expireDate || new Date(),
          ).getTime()
  
          if (expirationDay - today > 0) setIsPlanActive(true)
        }
        setAdmin(result[0]);     

      }catch(err:Error|any){
        setLoadingState(false)
        toast.dismiss();
        toast.error(err.message,{
          position:'bottom-left',style:{width:320,background:'white',fontSize:'small'}
        });
        toast.loading(<div style={{display:'flex',alignItems:'center',width:180,fontSize:'small'}}>Retry creating account</div>,{
          icon:<MdReplayCircleFilled 
          cursor={'pointer'}
            size={25}
            onClick={()=>{setRetry(prev=>!prev);toast.dismiss();setLoadingState(true)}} />,
          duration:Infinity,
            position:"bottom-right",
          })
      }
    }

    if (user && isLoaded) mainCheck()
  }, [user, isLoaded,retry]);


  if(loadingState)
    return (<PreLoader />)

  if(!admin){
    console.log("<admin> : ",admin)
    return (
      <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100dvh',
        display:'flex',alignItems:'center',justifyContent:'center', objectFit:'contain'
      }}>
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
        <img height={'100%'} src={ServiceUnavailable} alt="" />

      </div>
    );}


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
