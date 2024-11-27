import { useUser } from "@clerk/clerk-react";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay";
import { CurrencyCode } from "react-razorpay/dist/constants/currency";
import { useNavigate } from "react-router-dom";

const PayButtonStyle = {
    padding: '5px 20px',
    borderRadius: 5,
    cursor: 'pointer',
    width: 'max-content',
    outline: 'none',
    fontWeight: 600,
    borderStyle: 'none'
}

const Checkout = ({ price }: { price: number; }) => {
    const { error, Razorpay } = useRazorpay();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const { user } = useUser()

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
                name: user?.fullName || '',
                email: user?.emailAddresses[0].emailAddress,
                contact: "9330038859",
            },
            theme: {
                color: "rgb(85, 88, 117)",
            },
            readonly: {
                contact: false
            },
            modal: {
                animation: true,
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
        <form onSubmit={handlePayment}>
            {error && <p>Error loading Razorpay: {error}</p>}
            <input
                style={PayButtonStyle}
                type="submit"
                value={!isLoading ? "Pay Now" : "loading..."}
                disabled={isLoading} />
        </form>

    );
};

export default Checkout