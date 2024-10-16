import { PaymentElement } from "@stripe/react-stripe-js";
import { FormEvent, useState } from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import styles from './CheckoutForm.module.css';

export default function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements)
            return;
        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/completion`,
            },
        });

        if (error.type === "card_error" || error.type === "validation_error")
            setMessage(error.message ?? "");
        else
            setMessage("An unexpected error occurred.");
        setIsProcessing(false);
    };

    return (
        <form id={styles["payment-form"]} onSubmit={handleSubmit}>
            <PaymentElement id={styles["payment-element"]} />
            <button disabled={isProcessing || !stripe || !elements} id="submit">
                <span id={styles["button-text"]}>
                    {isProcessing ? "Processing ... " : "Pay now"}
                </span>
            </button>
            {message && <div id={styles["payment-message"]}>{message}</div>}
        </form>
    );
}