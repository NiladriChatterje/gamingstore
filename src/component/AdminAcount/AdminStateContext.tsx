/// <reference types="vite-plugin-svgr/client" />
import PreLoader from "@/PreLoader";
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
  const [isPlanActiveState, setIsPlanActive] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState<boolean>(true);
  const [retry, setRetry] = useState<boolean>(true);
  const [editProductForm, setEditProductForm] = useState<ProductType | null>();

  const [fromDate, setFromDate] = useState<Date | null>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [toDate, setToDate] = useState<Date | null>(() => new Date());

  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  // ✅ Promisified Geolocation API
  const getGeolocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  async function checkAdminEnrolled(): Promise<AdminFieldsType | undefined> {
    const token = await getToken()
    console.log("Auth token fetched for checkAdminEnrolled.");
    let userEnrolled: AdminFieldsType | undefined = undefined;
    try {
      const response: Response = await fetch(
        `http://localhost:5003/fetch-admin-data/${"seller-" + user?.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-admin-id": user?.id ? `seller-${user.id}` : ''
          }
        }
      );
      if (response.status === 404) {
        console.log('Server returned 404: Admin not enrolled');
        userEnrolled = undefined;
        throw new Error("admin not found!!. in catch block, creation will be encountered");
      } else if (response.ok) {
        userEnrolled = await response.json();
        console.log('Server returned 200: Admin enrolled:', userEnrolled)
      } else {
        console.log('Server returned error status:', response.status);
      }
    } catch (err) {
      console.log('Fetch error during enrollment check:', err);
      userEnrolled = undefined;

      console.log("Final userEnrolled state before potential creation:", userEnrolled);
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
        console.log("<adminCreateOperations called>");
        let token = await getToken();
        console.log("geolocation fetched: ", latitude, longitude);
        if (!user?.phoneNumbers[0]?.phoneNumber && !userEnrolled?.phone) {
          if (toastLoadingId) toast.dismiss(toastLoadingId);

          const responseGeo = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${import.meta.env.VITE_GEOAPIFY_API}`,
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
                  _type: "seller",
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
            return;
          }

          toastLoadingId = toast("Update phone number!", {
            position: "bottom-left",
            style: { width: 320, background: "white" },
          });
        }

        if (user?.id)
          setAdmin({
            _type: "admin",
            username: user?.firstName,
            _id: "seller-" + user?.id,
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

      // ✅ FIXED: Properly awaiting geolocation
      if (userEnrolled == null) {
        try {
          const coords = await getGeolocation();
          console.log("Geolocation retrieved:", coords);
          const { latitude, longitude } = coords ?? {
            latitude: 22.6230272,
            longitude: 88.4867072
          };
          await adminCreateOperations(latitude, longitude);
          console.log("adminCreateOperations execution finished.");
        } catch (error: GeolocationPositionError | any) {
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
      }

    }

    setLoadingState(false);
    return userEnrolled;
  }

  const fetchFilteredStatistics = async (fromDate: Date | null, toDate: Date | null) => {
    if (!user?.id || !fromDate || !toDate) {
      console.warn('Missing required parameters for fetching filtered statistics');
      return;
    }

    try {
      const token = await getToken();
      const adminId = `seller-${user.id}`;

      const fromDateISO = fromDate.toISOString();
      const toDateISO = toDate.toISOString();

      const response = await fetch(
        `http://localhost:5003/${adminId}/dashboard-metrics?fromDate=${fromDateISO}&toDate=${toDateISO}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-admin-id": adminId
          }
        }
      );

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      const filteredMetrics = await response.json();
      console.log('Filtered metrics received:', filteredMetrics);

    } catch (error: any) {
      console.error('Error fetching filtered statistics:', error);
      toast.error(`Failed to fetch statistics: ${error.message}`, {
        position: "bottom-left",
        style: { width: 320, background: "white" },
      });
    }
  };

  useEffect(() => {
    async function mainCheck() {
      try {
        const result: AdminFieldsType | undefined = await checkAdminEnrolled();

        if (result == null) return;

        console.log('subscription plan from server : ', result.isPlanActive);
        if (result.isPlanActive) {
          setIsPlanActive(true);
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
              margin: '0px 3px', borderRadius: 3, textWrap: 'nowrap'
            }}>Retry login</span>
            <span>OR</span>
            <span style={{
              color: 'white', padding: '1px 6px',
              fontWeight: 300,
              margin: '0px 3px', borderRadius: 3, textWrap: 'nowrap'
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
        fromDate,
        setFromDate,
        toDate,
        setToDate,
        fetchFilteredStatistics,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminStateContext = () => useContext(AdminContext);