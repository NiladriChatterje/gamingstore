import Payment from '../../PaymentPortal/Payment.tsx';
import Completion from '../../PaymentPortal/Completion.tsx'
import { Routes, Route, Navigate } from 'react-router-dom';
import {
    Body, About, Products,
    Details, PaymentPortal,
    OrderListItem,
    Navbar,
} from './components.ts';
const UserAccount = () => {

    return (
        <>
            <OrderListItem />
            <Navbar />
            <Routes>
                <Route index element={<Navigate to={'/user'} />} />
                <Route path={'/user'} element={<Body />} />
                <Route path={'/user/Payment'} element={<PaymentPortal />} />
                <Route path={'/user/About'} element={<About />} />
                <Route path={'/user/Product'} element={<Products />} />
                <Route path={'/user/Product/Details/:id'} element={<Details />} />
                <Route path={'/user/Checkout'} element={<Payment />} />
                <Route path={'/user/completion'} element={<Completion />} />
                <Route path={'*'} element={<h1>404 | No such Route</h1>} />
            </Routes>
        </>
    )
}

export default UserAccount