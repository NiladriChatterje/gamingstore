import { useState } from "react";
import { FaStore, FaCheckCircle } from "react-icons/fa";
import { MdLocationPin } from "react-icons/md";
import { useAdminStateContext } from "../AdminStateContext";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import styles from "./StoreSetup.module.css";

interface StoreForm {
    pincode: string;
    county: string;
    state: string;
    country: string;
}

interface StoreSetupProps {
    storeCount: number;
    onComplete: () => void;  // called when all stores are configured
}

const emptyForm = (): StoreForm => ({ pincode: "", county: "", state: "", country: "" });

const StoreSetup = ({ storeCount, onComplete }: StoreSetupProps) => {
    const { admin, setAdmin } = useAdminStateContext();
    const { getToken } = useAuth();

    // Track which card the seller is currently filling
    const [activeCard, setActiveCard] = useState<number | null>(null);
    // Track submitted forms per card index
    const [submitted, setSubmitted] = useState<boolean[]>(Array(storeCount).fill(false));
    // Form state per card
    const [forms, setForms] = useState<StoreForm[]>(Array.from({ length: storeCount }, emptyForm));
    const [loading, setLoading] = useState<boolean>(false);

    const updateField = (cardIndex: number, field: keyof StoreForm, value: string) => {
        setForms(prev => {
            const next = [...prev];
            next[cardIndex] = { ...next[cardIndex], [field]: value };
            return next;
        });
    };

    const handleSave = async (cardIndex: number) => {
        const form = forms[cardIndex];
        if (!form.pincode || !form.county || !form.state || !form.country) {
            toast.error("Please fill all store fields.");
            return;
        }
        setLoading(true);
        try {
            const token = await getToken();
            const response = await fetch("http://localhost:5002/configure-store", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    sellerId: admin?._id,
                    ...form,
                }),
            });

            if (response.ok) {
                const updatedSubmitted = [...submitted];
                updatedSubmitted[cardIndex] = true;
                setSubmitted(updatedSubmitted);
                setActiveCard(null);
                toast.success(`Store ${cardIndex + 1} configured!`);

                // Update local admin stores state so context is fresh
                const newStore = { id: Date.now(), ...form, address: `${form.county}, ${form.state}` };
                setAdmin?.((prev: any) => ({
                    ...prev,
                    stores: [...(prev?.stores ?? []), newStore],
                }));

                // If all stores are done, unlock the dashboard
                if (updatedSubmitted.every(Boolean)) {
                    setTimeout(() => onComplete(), 600);
                }
            } else {
                const err = await response.json();
                toast.error(err?.error ?? "Failed to configure store.");
            }
        } catch (e) {
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const allDone = submitted.every(Boolean);

    return (
        <div className={styles["setup-container"]}>
            <div className={styles["setup-header"]}>
                <MdLocationPin size={38} className={styles["setup-header-icon"]} />
                <div>
                    <h1 className={styles["setup-title"]}>Configure Your Stores</h1>
                    <p className={styles["setup-subtitle"]}>
                        Your subscription plan includes <strong>{storeCount}</strong> store
                        {storeCount > 1 ? "s" : ""}. Please configure {storeCount > 1 ? "all of them" : "it"} before
                        accessing your dashboard.
                    </p>
                </div>
            </div>

            <div className={styles["cards-grid"]}>
                {Array.from({ length: storeCount }).map((_, idx) => {
                    const isDone = submitted[idx];
                    const isOpen = activeCard === idx;
                    const form = forms[idx];

                    return (
                        <div
                            key={idx}
                            className={`${styles["store-card"]} ${isDone ? styles["done"] : ""} ${isOpen ? styles["active"] : ""}`}
                        >
                            {/* Card Header */}
                            <div
                                className={styles["card-header"]}
                                onClick={() => !isDone && setActiveCard(isOpen ? null : idx)}
                            >
                                <div className={styles["card-icon"]}>
                                    {isDone
                                        ? <FaCheckCircle size={20} />
                                        : <FaStore size={20} />}
                                </div>
                                <div>
                                    <h3 className={styles["card-title"]}>
                                        Store {idx + 1}
                                        {isDone && <span className={styles["done-pill"]}>Configured</span>}
                                    </h3>
                                    {isDone ? (
                                        <p className={styles["card-summary"]}>
                                            {form.county}, {form.state} — {form.pincode}
                                        </p>
                                    ) : (
                                        <p className={styles["card-summary"]}>
                                            {isOpen ? "Fill in the details below" : "Click to configure"}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Expandable Form */}
                            {isOpen && !isDone && (
                                <div className={styles["card-form"]}>
                                    <div className={styles["field-row"]}>
                                        <div className={styles["field-group"]}>
                                            <label>County / City</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Kolkata"
                                                value={form.county}
                                                onChange={e => updateField(idx, "county", e.target.value)}
                                            />
                                        </div>
                                        <div className={styles["field-group"]}>
                                            <label>Pincode</label>
                                            <input
                                                type="text"
                                                maxLength={6}
                                                placeholder="e.g. 700001"
                                                value={form.pincode}
                                                onChange={e => updateField(idx, "pincode", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles["field-row"]}>
                                        <div className={styles["field-group"]}>
                                            <label>State</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. West Bengal"
                                                value={form.state}
                                                onChange={e => updateField(idx, "state", e.target.value)}
                                            />
                                        </div>
                                        <div className={styles["field-group"]}>
                                            <label>Country</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. India"
                                                value={form.country}
                                                onChange={e => updateField(idx, "country", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        className={styles["save-btn"]}
                                        onClick={() => handleSave(idx)}
                                        disabled={loading}
                                    >
                                        {loading ? "Saving..." : "Save Store"}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {allDone && (
                <p className={styles["all-done"]}>All stores configured! Redirecting to dashboard…</p>
            )}
        </div>
    );
};

export default StoreSetup;
