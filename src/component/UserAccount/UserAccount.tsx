import Payment from './PaymentPortal/Payment.tsx';
import Completion from './PaymentPortal/Completion.tsx'
import { Routes, Route, Navigate } from 'react-router-dom';
import {
    Body, About, Products,
    ProductDetail,
    CartListContainer,
    Navbar,
    Orders,
    ProfileUpdateUser
} from './components.ts';
import { useUserStateContext } from './UserStateContext.tsx';
import NotFound from '../../NotFound.tsx';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const UserAccount = () => {
    const { setUserData, cartData } = useUserStateContext();
    const { user, isSignedIn } = useUser()
    const { getToken } = useAuth();

    useEffect(() => {
        if (isSignedIn && user != null) {
            (async () => {
                fetch(`http://localhost:5001/fetch-user-data/${user.id}`, {
                    headers: {
                        'Accept': "application/json",
                        'Authorization': `Bearer ${await getToken()}`
                    }
                })
                    .then(res => res.json())
                    .then(async data => {
                        if (data == null) {
                            navigator.geolocation
                                .getCurrentPosition(async ({ coords: { latitude, longitude } }) => {
                                    let placeResult: {
                                        properties: {
                                            postcode: string;
                                            county: string;
                                            state: string;
                                            country: string;
                                        };
                                    };
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

                                    const userObj = {
                                        _id: user.id,
                                        username: user.username,
                                        geoPoint: {
                                            lat: latitude,
                                            lng: longitude
                                        },
                                        email: user.emailAddresses[0].emailAddress,
                                        address: {
                                            pincode: placeResult?.properties?.postcode,
                                            county: placeResult?.properties?.county,
                                            state: placeResult?.properties?.state,
                                            country: placeResult?.properties?.country,
                                        },
                                        cart: cartData ?? []
                                    }
                                    try {
                                        const response = await fetch(`http://localhost:5001/create-user/`, {
                                            method: "POST",
                                            body: JSON.stringify(userObj)
                                        })

                                        if (response.ok)
                                            setUserData?.(userObj)
                                    } catch (err) {
                                        console.log("failed creating user account!");
                                        toast.error("Something went wrong! user-account-creation-failed");

                                    }

                                });

                        }

                    })
            }
            )()
        }
    }, [isSignedIn])
    return (
        <>
            <dialog>

            </dialog>
            <CartListContainer />
            <Navbar />
            <Routes>
                <Route path={'/'} element={<Body />} />
                <Route index path={'/user'} element={<Body />} />
                <Route path={'/user/Payment'} element={<Payment />} />
                <Route path={'/user/Orders'} element={<Orders />} />
                <Route path={'/user/About'} element={<About />} />
                <Route path={'/user/profile-update'} element={<ProfileUpdateUser />} />
                <Route path={'/user/Product'} element={<Products />} />
                <Route path={'/user/Product/ProductDetail/:id'} element={<ProductDetail />} />
                <Route path={'/user/completion/'} element={<Completion />} />
                <Route path="/admin/*" element={<Navigate to={'/user'} />} />
                <Route path="*" element={<><NotFound /></>} />
            </Routes>
        </>
    )
}


export default UserAccount