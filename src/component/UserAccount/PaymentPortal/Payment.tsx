import { useState, useEffect } from "react";
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
    const [oneProduct, _] = useState<{ _id: String; productName: string; quantity: number; price: number }>(JSON.parse(localStorage.getItem('oneProduct') ?? '{}'));
    const { isOneItem, cartData, totalPrice, userData, singleProductDetail, setSingleProductDetail } = useUserStateContext();
    const navigate = useNavigate();
    const { setDefaultLoginAdminOrUser } = useStateContext()
    const { getToken } = useAuth();
    const { isLoaded, signIn } = useSignIn();

    // Show test card info in a useEffect to avoid rendering state updates
    useEffect(() => {
        if (isLoaded && signIn) {
            localStorage.setItem('loginusertype', 'user')
            setDefaultLoginAdminOrUser?.('user')
            toast(
                <div style={{ minWidth: '320px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                        paddingBottom: '8px',
                        borderBottom: '1px solid rgba(0,0,0,0.1)'
                    }}>
                        <h4 style={{
                            margin: 0,
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'rgb(30, 28, 41)'
                        }}>Test Card Details</h4>
                        <AiFillCloseCircle
                            cursor='pointer'
                            size={18}
                            color="rgb(30, 28, 41)"
                            onClick={() => toast.dismiss()}
                            style={{ opacity: 0.6, transition: 'opacity 150ms' }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                            { name: 'MasterCard', icon: <RiMastercardFill />, no: '5267 3181 8797 5449', clean: '5267318187975449' },
                            { name: 'Visa', icon: <RiVisaFill />, no: '4386 2894 0766 0153', clean: '4386289407660153' }
                        ].map(card => (
                            <div key={card.name} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: 'rgba(0,0,0,0.02)',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid rgba(0,0,0,0.05)',
                                transition: 'all 150ms'
                            }}>
                                <div style={{ fontSize: '24px', color: 'rgb(30, 28, 41)' }}>{card.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '2px' }}>{card.name}</div>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(30, 28, 41)' }}>{card.no}</div>
                                </div>
                                <BsClipboard
                                    cursor='pointer'
                                    size={16}
                                    color="rgb(30, 28, 41)"
                                    style={{ opacity: 0.5, transition: 'opacity 150ms' }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                                    onClick={() => {
                                        navigator.clipboard.writeText(card.clean);
                                        toast.success('Copied!', { duration: 1500 });
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>,
                {
                    duration: 15000,
                    position: 'bottom-right'
                }
            )
        }
    }, [isLoaded, signIn])

    // Check for empty cart
    useEffect(() => {
        if ((cartData?.length == 0) && (singleProductDetail == undefined)) {
            if (cartData?.length == 0)
                toast('cart is empty! Redirecting to homepage.');
            else
                toast('No product selected! Redirecting to homepage.');
            navigate('/');
        }
    }, [cartData, singleProductDetail, navigate])
    return (
        <div id={styles['payment-container']}>
            <SignedIn>
                {false ? <Loader /> : (
                    <div id={styles['whole_wrapper']}>
                        <div id={styles['product-list']}>
                            {isOneItem ? (
                                <div id={styles['nam_price_container']}>
                                    <section id={styles['nam_price']}>
                                        <span>{singleProductDetail?.productName}</span>
                                        <div className={styles['pdt-ProductDetail']}>
                                            <span>Quantity</span>
                                            <span>{singleProductDetail?.quantity}</span>
                                        </div>
                                        <div className={styles['pdt-ProductDetail']}>
                                            <span>Unit Price</span>
                                            <span>₹ {singleProductDetail?.price?.pdtPrice}</span>
                                        </div>
                                    </section>
                                    <div className={styles['single-pdt-total']}>
                                        <span>Total</span>
                                        <span>₹ {singleProductDetail ? (singleProductDetail?.price?.pdtPrice * (singleProductDetail?.quantity ?? 0)) : 0}</span>
                                        <Checkout
                                            price={singleProductDetail ? (singleProductDetail?.price?.pdtPrice * (singleProductDetail?.quantity ?? 0)) : 0}
                                            callback={async (payment_id: string, razorpay_signature: string, razorpay_order_id: string) => {
                                                try {
                                                    const token = await getToken();
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
                                                                amount: singleProductDetail?.price?.pdtPrice * (singleProductDetail?.quantity ?? 0),
                                                                quantity: singleProductDetail?.quantity
                                                            })
                                                        });
                                                        if (response.ok) {
                                                            localStorage.removeItem('oneProduct');
                                                            setSingleProductDetail?.(undefined);
                                                        }
                                                    } else {
                                                        toast('This Route is only accessible through proper workflow');
                                                    }
                                                } catch (e) {
                                                    console.error(e);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <section id={styles['table']}>
                                    <header>
                                        <span className={styles['first-column']}>Product</span>
                                        <span className={styles['second-column']}>QTY</span>
                                        <span className={styles['third-column']}>Price</span>
                                    </header>
                                    <div>
                                        {cartData?.map(item => (
                                            <div key={item._id}>
                                                <span className={styles['first-column']}>
                                                    {item.imagesBase64?.[0]?.base64 && (
                                                        <img
                                                            src={item.imagesBase64[0].base64}
                                                            alt={item.productName}
                                                            className={styles['product-thumb']}
                                                        />
                                                    )}
                                                    {item?.productName}
                                                </span>
                                                <span className={styles['second-column']}>{item?.quantity}</span>
                                                <span className={styles['third-column']}>₹{(item?.price?.pdtPrice ?? 0) * (item?.quantity ?? 0)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <footer>
                                        <span>Grand Total</span>
                                        <span>₹ {totalPrice}</span>
                                        <Checkout
                                            price={isOneItem ? oneProduct.price * oneProduct.quantity : totalPrice || 0}
                                            callback={() => { }}
                                        />
                                    </footer>
                                </section>
                            )}
                        </div>
                    </div>
                )}
            </SignedIn>
            <SignedOut>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh', width: '100vw' }}>
                    <SignIn forceRedirectUrl={'/user/payment'} />
                </div>
            </SignedOut>
        </div>
    );
}

export default Payment;