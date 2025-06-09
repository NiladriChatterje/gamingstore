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
import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';

const UserAccount = () => {

    //loading userData from Database if found or creating it
    const { setUserData } = useUserStateContext();
    const { user, isSignedIn } = useUser()
    useEffect(() => {
        if (isSignedIn) {
            //fetch user data and if not found then create
        }
    }, [isSignedIn])
    return (
        <>
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