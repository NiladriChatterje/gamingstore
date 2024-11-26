import { FormEvent } from "react";
import toast from "react-hot-toast";
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay";


const Checkout = ({ price }: { price: number; }) => {
    const { error, isLoading, Razorpay } = useRazorpay();


    const handlePayment = async (e: FormEvent) => {
        e.preventDefault();
        fetch('http://localhost:5000/razorpay', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ price })
        });

        const options: RazorpayOrderOptions = {
            key: import.meta.env.VITE_RAZORPAY_API_KEY,
            amount: price, // Amount in paise
            currency: "INR",
            name: "XV Store",
            description: "Test Transaction",
            order_id: "order_POlTlMsRI1yfq7", // Generate order_id on server
            handler: (response) => {
                console.log(response);
                // fetch('http://localhost:5000/razorpay', {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json'
                //     },
                //     body:
                // })
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
        };

        const razorpayInstance = new Razorpay(options);
        razorpayInstance.open();
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