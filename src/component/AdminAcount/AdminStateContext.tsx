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
import { useUser, useAuth } from "@clerk/clerk-react";
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
      console.log("[AdminStateContext] fetch-admin-data status:", response.status, "ok:", response.ok);
      if (response.status === 404) {
        console.log('Server returned 404: Admin not enrolled — will be created on profile save');
        userEnrolled = undefined;
      } else if (response.ok) {
        userEnrolled = await response.json();
        console.log('Server returned 200: Admin enrolled:', userEnrolled)
      } else {
        console.log('Server returned error status:', response.status);
        userEnrolled = undefined;
      }
    } catch (err) {
      console.log('Fetch error during enrollment check:', err);
      console.log("[AdminStateContext] network error — will allow flow without admin data");
      userEnrolled = undefined;
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
      console.log("[AdminStateContext] mainCheck() start");
      try {
        const result: AdminFieldsType | undefined = await checkAdminEnrolled();
        console.log("[AdminStateContext] mainCheck() got result:", result);

        if (result == null) {
          // Admin not enrolled yet — that's fine, let SubscriptionPlan / ProfileManager handle onboarding
          return;
        }

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
