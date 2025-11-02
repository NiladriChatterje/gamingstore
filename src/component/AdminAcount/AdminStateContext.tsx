/// <reference types="vite-plugin-svgr/client" />
import PreLoader from "../../PreLoader";
import {
  createContext,
  ReactNode,
  useState,
  useContext,
  useEffect,
} from "react";
import type { AdminContextType } from "@declarations/AdminContextType.ts";
import { ProductType } from "../../declarations/ProductContextType";
import toast from "react-hot-toast";
import { AdminFieldsType } from "../../declarations/AdminType.ts";
import { SignOutButton, useUser, useAuth } from "@clerk/clerk-react";
import { IoLocation, IoLogOutOutline } from "react-icons/io5";
import ServiceUnavailable from "../../assets/serviceUavailable.svg";
import { MdReplayCircleFilled } from "react-icons/md";

const AdminContext = createContext<Partial<AdminContextType>>({});

export const AdminStateContext = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminFieldsType | undefined>(
    () => undefined
  );
  const [isPlanActiveState, setIsPlanActive] = useState<boolean>(true);
  const [loadingState, setLoadingState] = useState<boolean>(true);
  const [retry, setRetry] = useState<boolean>(true);
  const [editProductForm, setEditProductForm] = useState<ProductType | null>(); // To fill up form fields when a product is about to edit
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  async function checkAdminEnrolled(): Promise<AdminFieldsType | undefined> {
    const token = await getToken()
    console.log(token);
    const response: Response = await fetch(
      `http://localhost:5003/fetch-admin-data/${user?.id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-admin-id": admin?._id ?? ''
        }
      }
    );
    if (!response.ok)
      throw new Error(response.status + " : " + response.statusText);

    let userEnrolled: AdminFieldsType = await response.json();
    console.log('admin received : ', userEnrolled)
    let toastLoadingId: string | undefined;
    let placeResult: {
      properties: {
        postcode: string;
        county: string;
        state: string;
        country: string;
      };
    };

    //#region adminCreateOperations definition
    const adminCreateOperations = async (latitude: number, longitude: number) => {
      if (!user?.phoneNumbers[0]?.phoneNumber && !userEnrolled?.phone) {
        if (toastLoadingId) toast.dismiss(toastLoadingId);

        //address info fetch
        const responseGeo = await fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${import.meta.env.VITE_GEOAPIFY_API
          }`,
          {
            method: "GET",
            headers: {
              "Accept": "application/json"
            }
          }
        );
        const { features } = await responseGeo.json();
        placeResult = features[0];
        console.log("reverse geocoding : ", placeResult);

        try {
          //creating admin document if not found in sanity
          const res: Response = await fetch(
            `http://localhost:5003/create-admin`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                _type: "admin",
                username: user?.firstName,
                _id: user?.id,
                email: user?.emailAddresses[0].emailAddress,
                geoPoint: {
                  lat: latitude,
                  lng: longitude,
                },
                address: {
                  pincode: placeResult?.properties?.postcode,
                  county: placeResult?.properties?.county,
                  state: placeResult?.properties?.state,
                  country: placeResult?.properties?.country,
                },
              }),
            }
          );

          const result = await res.text();
          if (!res.ok) throw new Error(result);
        } catch (err: Error | any) {
          console.log("error in creating admin doc : ", err);
          toast.dismiss();
          toast.error(err.message, {
            position: "bottom-left",
            style: { width: 320, background: "white" },
          });
          toast.loading(
            <div style={{ display: "flex", alignItems: "center" }}>
              <span>Retry</span>
            </div>,
            {
              icon: (
                <MdReplayCircleFilled
                  cursor={"pointer"}
                  size={25}
                  onClick={() => {
                    setRetry((prev) => !prev);
                    toast.dismiss();
                  }}
                />
              ),
              duration: Infinity,
              position: "bottom-right",
            }
          );
          setLoadingState(false);
          return;
        }

        toastLoadingId = toast("Update phone number!", {
          position: "bottom-left",
          style: { width: 320, background: "white" },
        });
      }

      //if the document created successfully
      if (user?.id)
        setAdmin({
          _type: "admin",
          username: user?.firstName,
          _id: "admin-" + user?.id,
          email: user?.emailAddresses[0].emailAddress,
          geoPoint: {
            lat: latitude,
            lng: longitude,
          },
          address: {
            pincode: placeResult?.properties?.postcode,
            county: placeResult?.properties?.county,
            state: placeResult?.properties?.state,
            country: placeResult?.properties?.country,
          },
        });
    };
    //#endregion adminCreateOperations definition end

    if (userEnrolled == null) {
      navigator.geolocation.getCurrentPosition(
        async ({
          coords: { latitude, longitude },
        }: {
          coords: { latitude: number; longitude: number };
        }) => {
          await adminCreateOperations(latitude, longitude);
          console.log("<userEnrolled after calling adminCreateOperations>");
        },
        (error: GeolocationPositionError) => {
          const toastId = toast(<div>allow location</div>, {
            position: "bottom-left",
            style: { width: 320, background: "white", fontSize: "small" },
            icon: <IoLocation size={25} />,
          });
          const toastIdForMsg = toast.error(error.message, {
            position: "bottom-left",
            style: { width: 320, background: "white", fontSize: "small" },
          });

          setTimeout(() => {
            toast.dismiss(toastId);
            toast.dismiss(toastIdForMsg);
            setRetry((prev) => !prev);
          }, 4000);
        }
      );
    }
    setLoadingState(false);
    return userEnrolled;
  }

  useEffect(() => {
    async function mainCheck() {
      // check from sanity if user has an existing
      // subscription plan or not
      try {
        const result: AdminFieldsType | undefined = await checkAdminEnrolled();

        if (result == null) return;
        if (
          result != null &&
          result?.SubscriptionPlan &&
          result?.SubscriptionPlan?.length !== 0
        ) {
          let lastPlan = result.SubscriptionPlan?.at(-1);
          const today = new Date().getTime();
          const expirationDay = new Date(
            lastPlan?.planSchemeList?.expireDate || new Date()
          ).getTime();

          if (expirationDay - today > 0) setIsPlanActive(true);
        }
        setAdmin(result);
      } catch (err: Error | any) {
        setLoadingState(false);
        toast.dismiss();
        toast.error(err.message, {
          position: "bottom-left",
          style: { width: 450, background: "white", fontSize: "0.8em" },
        });
        toast.loading(
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: 200,
              fontSize: "small",
            }}
          >
            <span style={{
              color: 'white', padding: '1px 6px',
              fontWeight: 300,
              margin: '0px 3px', background: '#2e3547', borderRadius: 3, textWrap: 'nowrap'
            }}>Retry login</span>
            <span>OR</span>
            <span style={{
              color: 'white', padding: '1px 6px',
              fontWeight: 300,
              margin: '0px 3px', background: '#2e3547', borderRadius: 3, textWrap: 'nowrap'
            }}>creating account</span>
          </div>,
          {
            icon: (
              <MdReplayCircleFilled
                cursor={"pointer"}
                size={25}
                onClick={() => {
                  setRetry((prev) => !prev);
                  toast.dismiss();
                  setLoadingState(true);
                }}
              />
            ),
            duration: Infinity,
            position: "bottom-right",
          }
        );
      }
    }

    if (user !== null && isLoaded && isSignedIn) mainCheck();
  }, [user, isLoaded, retry, isSignedIn]);

  if (loadingState) return <PreLoader />;

  if (admin == null)
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          objectFit: "contain",
        }}
      >
        <SignOutButton>
          <IoLogOutOutline
            onClick={() => {
              localStorage.setItem("loginusertype", "user");
            }}
            cursor={"pointer"}
            size={25}
            style={{ position: "fixed", top: 30, right: 60 }}
          />
        </SignOutButton>
        <img height={"100%"} src={ServiceUnavailable} alt="" />
      </div>
    );


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
  );
};

export const useAdminStateContext = () => useContext(AdminContext);
