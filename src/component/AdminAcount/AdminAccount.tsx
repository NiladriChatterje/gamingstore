import { Navigate, Route, Routes } from "react-router-dom"
import { ProfileManager, SideBar, Home } from "./component"
import styles from './AdminAccount.module.css';
import { IoLogOutOutline } from "react-icons/io5";
import { SignedIn, SignedOut, SignOutButton, useUser, useSignIn } from "@clerk/clerk-react";
import SubscriptionPlan from "./SubscriptionPlan/SubscriptionPlan";
import { useEffect, useState } from "react";
import NotFound from "../../NotFound";
import { createClient, SanityClient } from '@sanity/client'
import toast from "react-hot-toast";
import { useStateContext } from "../../StateContext";
import { useAdminStateContext } from "./AdminStateContext";

const sanityClient: SanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  token: import.meta.env.VITE_SANITY_TOKEN,
  dataset: 'production'
})

interface planSchemeList {
  activeDate: Date;
  expireDate: Date;
}

type subscription = {
  transactionId: string;
  orderId: string;
  paymentSignature: string;
  activePlan: number;
  planSchemeList: planSchemeList;
}

interface AdminFieldsType {
  username: string;
  phone?: number;
  email: string;
  SubscriptionPlan: subscription[];
};
const AdminAccount = () => {
  const [isPlanActiveState, setIsPlanActive] = useState<boolean>(false);
  const { isLoaded } = useSignIn();
  const { user } = useUser();
  const { defaultLoginAdminOrUser } = useStateContext()
  const { setAdmin } = useAdminStateContext()

  useEffect(() => {
    async function checkAdminEnrolled() {
      const userEnrolled: AdminFieldsType[] = await sanityClient.fetch(`*[_type=='admin' && adminId=='${user?.id}']`);

      if (userEnrolled?.length === 0) {
        toast('allowing location for inventory is important');
        navigator.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }: { coords: { latitude: number; longitude: number } }) => {
          (async () => {
            try {
              if (!user?.phoneNumbers[0]?.phoneNumber && !userEnrolled[0]?.phone)
                toast('! Fill up phone number for notifications in profile-manager tab')
              const response = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${import.meta.env.VITE_GEOAPIFY_API}`, {
                method: 'GET'
              });
              const { features } = await response.json();
              const placeResult = features[0];
              console.log("reverse geocoding : ", placeResult)
              // let result = await sanityClient.create({
              //   _type: 'admin',
              //   username: user?.firstName,
              //   adminId: user?.id,
              //   email: user?.emailAddresses[0].emailAddress,
              //   geoPoint: {
              //     lat: latitude,
              //     lng: longitude
              //   },
              //pinCode:placeResult?.properties?.postcode
              //county:placeResult?.properties?.county
              //state:placeResult?.properties?.state
              //country:placeResult?.properties?.country
              // });

              // console.log("document created : ", result)
            } catch (e: Error | any) {
              toast.error(e.message)
            }
          })()
        });
      }
      else {

      }
      return userEnrolled
    }
    if (isLoaded) {
      // check from sanity if user has an existing 
      // subscription plan or not
      checkAdminEnrolled().then(result => {
        console.log(result)
        if (result.length > 0 && result[0]?.SubscriptionPlan) {
          let lastPlan = result[0].SubscriptionPlan.at(-1);
          const today = new Date().getTime();
          const expirationDay = new Date(lastPlan?.planSchemeList?.expireDate || new Date()).getTime()

          if (expirationDay - today > 0)
            setIsPlanActive(true)
        }
        setAdmin?.(result[0]);
      })
    }
  }, []);


  return (
    <>
      <SignedIn>
        {defaultLoginAdminOrUser === 'admin' && <div
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
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </section> :
              <SubscriptionPlan
                setIsPlanActive={setIsPlanActive} />
            }
          </div>
          <span>e-cart</span>
        </div>}
      </SignedIn>
      <SignedOut>
        <Navigate to={'/admin'} />
      </SignedOut>
    </>
  )
}

export default AdminAccount