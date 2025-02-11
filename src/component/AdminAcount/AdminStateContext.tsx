import { createContext, ReactNode, useState, useContext, useEffect } from "react";
import type { AdminContextType } from './AdminContextType.d.ts';
import { createClient, SanityClient } from "@sanity/client";
import toast from "react-hot-toast";
import { useSignIn, useUser } from "@clerk/clerk-react";

const AdminContext = createContext<Partial<AdminContextType>>({});

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
    _id: string;
    username: string | null | undefined;
    geoPoint: {
        lat: number;
        lng: number;
    }
    phone?: number;
    adminId: string | null | undefined;
    email: string | null | undefined;
    SubscriptionPlan?: subscription[] | undefined | null;
    AddressObjectType: {
        pinCode: string;
        county: string;
        country: string;
        state: string;
    }
};

const sanityClient: SanityClient = createClient({
    projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
    token: import.meta.env.VITE_SANITY_TOKEN,
    dataset: 'production'
})

export const AdminStateContext = ({ children }: { children: ReactNode }) => {
    const [admin, setAdmin] = useState<any>({});
    const [isPlanActiveState, setIsPlanActive] = useState<boolean>(true);
    const { isLoaded } = useSignIn();
    const { user } = useUser();

    useEffect(() => {
        async function checkAdminEnrolled() {
            let userEnrolled: AdminFieldsType[] | any = await sanityClient?.fetch(`*[_type=='admin' && adminId=='${user?.id}']`);

            if (userEnrolled?.length === 0) {
                toast('allowing location for inventory is important');
                navigator.geolocation.getCurrentPosition(async ({ coords: { latitude, longitude } }: { coords: { latitude: number; longitude: number } }) => {
                    const userOps = async () => {
                        try {
                            if (!user?.phoneNumbers[0]?.phoneNumber && !userEnrolled[0]?.phone)
                                toast('! Fill up phone number for notifications in profile-manager tab')
                            const response = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${import.meta.env.VITE_GEOAPIFY_API}`, {
                                method: 'GET'
                            });
                            const { features } = await response.json();
                            const placeResult = features[0];
                            console.log("reverse geocoding : ", placeResult)
                            let result = await sanityClient?.create({
                                _type: 'admin',
                                username: user?.firstName,
                                adminId: user?.id,
                                email: user?.emailAddresses[0].emailAddress,
                                geoPoint: {
                                    lat: latitude,
                                    lng: longitude
                                },
                                AddressObjectType: {
                                    pinCode: placeResult?.properties?.postcode,
                                    county: placeResult?.properties?.county,
                                    state: placeResult?.properties?.state,
                                    country: placeResult?.properties?.country
                                }
                            });

                            console.log("document created : ", result)
                            userEnrolled = [{
                                username: user?.firstName, adminId: user?.id, email: user?.emailAddresses[0].emailAddress,
                                geoPoint: {
                                    lat: latitude,
                                    lng: longitude
                                },
                                AddressObjectType: {
                                    pinCode: placeResult?.properties?.postcode,
                                    county: placeResult?.properties?.county,
                                    state: placeResult?.properties?.state,
                                    country: placeResult?.properties?.country
                                },
                                _id: result?._id
                            }]
                        } catch (e: Error | any) {
                            toast.error(e.message)
                        }
                    }

                    await userOps();
                });
            }

            return userEnrolled
        }

        async function mainCheck() {
            if (isLoaded) {
                // check from sanity if user has an existing 
                // subscription plan or not
                const result = await checkAdminEnrolled();
                console.log(result)
                if (result.length > 0 && result[0]?.SubscriptionPlan) {
                    let lastPlan = result[0].SubscriptionPlan.at(-1);
                    const today = new Date().getTime();
                    const expirationDay = new Date(lastPlan?.planSchemeList?.expireDate || new Date()).getTime()

                    if (expirationDay - today > 0)
                        setIsPlanActive(true)
                }
                setAdmin?.(result[0]);
            }
        }

        mainCheck()


    }, []);

    return (
        <AdminContext.Provider value={{
            isPlanActiveState,
            setIsPlanActive,
            admin, setAdmin, sanityClient
        }}>
            {children}
        </AdminContext.Provider>
    )
}

export const useAdminStateContext = () => useContext(AdminContext);