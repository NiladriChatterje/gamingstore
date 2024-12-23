import styles from './PaymentPortal.module.css';
import { useNavigate } from 'react-router-dom';
import { useUser, SignedOut, SignIn } from '@clerk/clerk-react';
import { useEffect } from 'react';


const PaymentPortal = () => {
    const navigate = useNavigate();
    const { isSignedIn } = useUser();

    useEffect(() => {
        if (isSignedIn)
            navigate('/user/Checkout');
    });

    return <>
        <div id={styles['form_container']}>
            <SignedOut>
                <SignIn path={'/user/Payment'} forceRedirectUrl={'/user/Checkout'} />
            </SignedOut>
        </div>
    </>
}
export default PaymentPortal;