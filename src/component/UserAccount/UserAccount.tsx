import Payment from '../../PaymentPortal/Payment.tsx';
import Completion from '../../PaymentPortal/Completion.tsx'
import { Routes, Route, Navigate } from 'react-router-dom';
import {
    Body, About, Products,
    Details, PaymentPortal,
    OrderListItem,
    Navbar,
} from './components.ts';
import NotFound from '../../NotFound.tsx';
const UserAccount = () => {

    return (
        <>
            <OrderListItem />
            <Navbar />
            <Routes>
                <Route index element={<Navigate to={'/user'} />} />
                <Route path={'/user/'} element={<Body />} />
                <Route path={'/user/Payment'} element={<PaymentPortal />} />
                <Route path={'/user/About'} element={<About />} />
                <Route path={'/user/Product'} element={<Products />} />
                <Route path={'/user/Product/Details/:id'} element={<Details />} />
                <Route path={'/user/Checkout'} element={<Payment />} />
                <Route path={'/user/completion/:order_id/:payment_id/:signature'} element={<Completion />} />
                <Route path={'*'} element={<NotFound />} />
            </Routes>
        </>
    )
}

export default UserAccount