import Payment from './PaymentPortal/Payment.tsx';
import Completion from './PaymentPortal/Completion.tsx'
import { Routes, Route, Navigate } from 'react-router-dom';
import {
    Body, About, Products,
    Details,
    CartListContainer,
    Navbar,
    Orders,
    ProfileUpdateUser
} from './components.ts';
import { UserStateContext } from './UserStateContext.tsx';
import NotFound from '../../NotFound.tsx';

const UserAccount = () => {

    return (
        <UserStateContext>
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
                <Route path={'/user/Product/Details/:id'} element={<Details />} />
                <Route path={'/user/completion/'} element={<Completion />} />
                <Route path="/admin/*" element={<Navigate to={'/user'} />} />
                <Route path="*" element={<><NotFound /></>} />
            </Routes>
        </UserStateContext>
    )
}


export default UserAccount