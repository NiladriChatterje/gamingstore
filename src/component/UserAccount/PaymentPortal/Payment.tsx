import { useState } from "react";
import styles from './Payment.module.css';
import Loader from "./Loader.tsx";
import { useUserStateContext } from "../UserStateContext.tsx";
import Checkout from "../../../utils/Checkout.tsx";
import { SignedIn, SignedOut, SignIn, useAuth, useSignIn } from "@clerk/clerk-react";
import { useStateContext } from "../../../StateContext.tsx";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AiFillCloseCircle } from "react-icons/ai";
import { RiMastercardFill, RiVisaFill } from "react-icons/ri";
import { BsClipboard } from "react-icons/bs";


function Payment() {
    const [oneProduct, _] = useState<{ _id: String; productName: string; quantity: number; price: number }>(JSON.parse(localStorage.getItem('oneProduct') ?? ''));
    const { isOneItem, cartData, totalPrice, userData, singleProductDetail, setSingleProductDetail } = useUserStateContext();
    const navigate = useNavigate();
    const { setDefaultLoginAdminOrUser } = useStateContext()
    const { getToken } = useAuth();


    if ((cartData?.length == 0) && (singleProductDetail == undefined)) {
        if (cartData?.length == 0)
            toast('cart is empty! Redirecting to homepage.');
        else
            toast('No product selected! Redirecting to homepage.');
        navigate('/');
        return;
    }

    const { isLoaded, signIn } = useSignIn();
    if (isLoaded && signIn) {
        localStorage.setItem('loginusertype', 'user')
        setDefaultLoginAdminOrUser?.('user')
        toast(
            <div>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}><AiFillCloseCircle

                    onClick={() => toast.dismiss()}
                /></div>
                <table id={styles['razorpay-testdata-info']}>
                    <thead>
                        <tr>
                            <th>Card Net.</th>
                            <th>Card No.</th>
                            <th>CVV</th>
                            <th>Expiration</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>MasterCard <RiMastercardFill /></td>
                            <td style={{
                                color: 'white', background: '#3b3b3b', padding: '2px 5px',
                                borderRadius: 5
                            }}>5267 3181 8797 5449 <BsClipboard
                                    cursor={'pointer'}
                                    onClick={() => {
                                        navigator.clipboard.writeText("5267318187975449");
                                        toast.success('Copied!')
                                    }} /></td>
                            <td>&lt; Any &gt;</td>
                            <td>&lt; Future date &gt;</td>
                        </tr>

                        <tr>
                            <td>Visa <RiVisaFill /></td>
                            <td style={{
                                color: 'white', background: '#3b3b3b', padding: '2px 5px',
                                borderRadius: 5
                            }}> 4386 2894 0766 0153 <BsClipboard
                                    cursor={'pointer'}
                                    onClick={() => {
                                        navigator.clipboard.writeText("4386289407660153");
                                        toast.success('Copied!')
                                    }} /></td>
                            <td>&lt; Any &gt;</td>
                            <td>&lt; Future date &gt;</td>
                        </tr>
                    </tbody>
                </table>
            </div>,
            {
                duration: 50000,
                position: 'bottom-right'
            })
    }
    return (

        <div id={styles['payment-container']}>
            <SignedIn>
                {false ? <Loader /> : (
                    <div id={styles['whole_wrapper']}>
                        <div id={styles['product-list']}>
                            {isOneItem ? <div id={styles['nam_price_container']}>
                                <section id={styles['nam_price']}>
                                    <span>{singleProductDetail?.productName}</span>
                                    <div className={styles['pdt-ProductDetail']}><span>Quantity: </span><span>{singleProductDetail?.quantity}</span></div>
                                    <div className={styles['pdt-ProductDetail']}><span>Unit Price: </span><span>₹ {singleProductDetail?.price?.pdtPrice}</span></div>
                                </section>
                                <div className={`${styles['pdt-ProductDetail']} ${styles['single-pdt-total']}`}>
                                    <Checkout price={singleProductDetail != undefined ?
                                        (singleProductDetail?.price?.pdtPrice * singleProductDetail?.quantity) : 0}
                                        callback={async (
                                            payment_id: string,
                                            razorpay_signature: string,
                                            razorpay_order_id: string,
                                        ) => {
                                            try {
                                                const token = await getToken()
                                                if (singleProductDetail) {
                                                    const response = await fetch(`http://localhost:5000/user-order`, {
                                                        method: 'PUT',
                                                        headers: {
                                                            'Content-Type': `application/json`,
                                                            Authorization: `Bearer ${token}`,
                                                            'x-user-id': userData?._id ?? ''
                                                        },
                                                        body: JSON.stringify({
                                                            customer: userData?._id,
                                                            customerEmail: userData?.email,
                                                            product: singleProductDetail?._id,
                                                            transactionId: payment_id,
                                                            orderId: razorpay_order_id,
                                                            pincode: userData?.address.pincode,
                                                            paymentSignature: razorpay_signature,
                                                            amount: singleProductDetail?.price?.pdtPrice * singleProductDetail?.quantity,
                                                            quantity: singleProductDetail?.quantity
                                                        })
                                                    });
                                                    console.log(await response.json())
                                                    if (response.ok) {
                                                        localStorage.removeItem('oneProduct')
                                                        setSingleProductDetail?.(undefined)
                                                    }

                                                }
                                                else {
                                                    toast('This Route is only accessible through proper workflow');
                                                    return;
                                                }
                                            } catch (e) {

                                            }

                                        }} />
                                    <span>Total: </span><span>₹ {
                                        singleProductDetail ?
                                            (singleProductDetail?.price?.pdtPrice * singleProductDetail?.quantity) : 0}</span></div>
                            </div> :
                                <section id={styles['table']}>
                                    <header>
                                        <th className={styles['first-column']}>Product</th>
                                        <th className={styles['second-column']}>QTY</th>
                                        <th className={styles['third-column']}>Price</th>
                                    </header>
                                    <div>
                                        {cartData?.map(item => (
                                            <div key={item._id} >
                                                <span className={styles['first-column']} >{item?.productName}</span>
                                                <span className={styles['second-column']}>{item?.quantity}</span>
                                                <span className={styles['third-column']}>₹{item?.price.pdtPrice * item?.quantity}</span>
                                            </div>))}
                                    </div>
                                    <footer className={styles['single-pdt-total']}>
                                        <Checkout price={isOneItem ? oneProduct.price * oneProduct.quantity : totalPrice || 0}
                                            callback={() => { }}
                                        />
                                        {/* <span className={styles['first-column']}>Amount: </span> */}
                                        <span className={styles['second-column']}>Amount: </span>
                                        <span className={styles['third-column']}>₹{totalPrice}</span>
                                    </footer>
                                </section>}
                        </div>
                    </div>)}
            </SignedIn>
            <SignedOut>
                <SignIn redirectUrl={'/user/payment'} afterSignInUrl={'/user/payment'} />
            </SignedOut>
        </div>
    );
}

export default Payment;