import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay";
import { CurrencyCode } from "react-razorpay/dist/constants/currency";
import { useNavigate } from "react-router-dom";


const Checkout = ({ price }: { price: number; }) => {
    const { error, Razorpay } = useRazorpay();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handlePayment = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const response: Response = await fetch('http://localhost:5000/razorpay', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ price: price * 100 })
        });
        const data: { id: string; currency: CurrencyCode; } = await response.json();

        const options: () => RazorpayOrderOptions = () => ({
            key: import.meta.env.VITE_RAZORPAY_API_KEY,
            amount: price * 100, // Amount in paise
            currency: data.currency,
            name: "XV Store",
            description: "Test Transaction",
            order_id: data.id, // Generate order_id on server
            redirect: true,
            handler: (response) => {
                console.log(response);
                setIsLoading(false);
                navigate(`/user/completion/${response.razorpay_order_id}/${response.razorpay_payment_id}/${response.razorpay_signature}`);
                toast.success("Payment Successful!");
            },
            prefill: {
                name: "John Doe",
                email: "cniladri415@gmail.com",
                contact: "9330038859",
            },
            theme: {
                color: "rgb(85, 88, 117)",
            },
            modal: {
                ondismiss: () => { setIsLoading(false) }
            }
        });

        const razorpayInstance = new Razorpay(options());
        razorpayInstance.open();
        razorpayInstance.on('payment.failed', () => {
            setIsLoading(false);
        })
    };

    return (
        <div>
            <h1>Payment Page</h1>
            <form onSubmit={handlePayment}>

                {isLoading && <p>Loading Razorpay...</p>}
                {error && <p>Error loading Razorpay: {error}</p>}
                <button disabled={isLoading}>
                    Pay Now
                </button>
            </form>
        </div>
    );
};

export default Checkout