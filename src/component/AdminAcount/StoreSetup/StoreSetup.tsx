import { useState, useEffect } from "react";
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
    const existingStores = admin?.stores ?? [];

    // Track submitted forms per card index
    const [submitted, setSubmitted] = useState<boolean[]>([]);
    // Form state per card
    const [forms, setForms] = useState<StoreForm[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Keep arrays in sync if storeCount updates after initial mount
    useEffect(() => {
        setForms(prev => {
            if (prev.length === storeCount && existingStores.length === 0) return prev;
            return Array.from({ length: storeCount }, (_, i) => {
                const s = existingStores[i];
                if (s) {
                    return {
                        pincode: s.pincode ?? "",
                        county: s.county ?? "",
                        state: s.state ?? "",
                        country: s.country ?? "",
                    };
                }
                return prev[i] || emptyForm();
            });
        });

        setSubmitted(prev => {
            if (prev.length === storeCount && prev.filter(Boolean).length === existingStores.length) return prev;
            return Array.from({ length: storeCount }, (_, i) => i < existingStores.length);
        });
    }, [storeCount, existingStores.length]);

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

        const isDuplicateLocal = forms.some((f, idx) => idx !== cardIndex && submitted[idx] && f.pincode === form.pincode);
        if (isDuplicateLocal) {
            toast.error(`Pincode ${form.pincode} is already configured in another card.`);
            return;
        }

        setLoading(true);
        try {
            const token = await getToken();
            const response = await fetch("http://localhost:5003/configure-store", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    storeId: form.pincode,
                    sellerId: admin?._id,
                    ...form,
                }),
            });

            if (response.ok) {
                await response.json();
                const updatedSubmitted = [...submitted];
                updatedSubmitted[cardIndex] = true;
                setSubmitted(updatedSubmitted);
                setActiveCard(null);
                toast.success(`Store configured successfully!`);
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

    const allDone = storeCount > 0 && submitted.length === storeCount && submitted.every(Boolean);

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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                    <p className={styles["all-done"]}>All stores are successfully configured!</p>
                    <button
                        className={styles["save-btn"]}
                        disabled={loading}
                        onClick={async () => {
                            setLoading(true);
                            try {
                                const token = await getToken();
                                const adminId = admin?._id;
                                const response = await fetch(`http://localhost:5003/fetch-admin-data/${adminId}`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                if (response.ok) {
                                    const data = await response.json();
                                    const actualStores = data.stores || [];
                                    if (actualStores.length >= storeCount) {
                                        setAdmin?.(data);
                                        onComplete();
                                    } else {
                                        toast.error("Not all stores are verified in the database!");
                                        setForms(() => Array.from({ length: storeCount }, (_, i) => {
                                            const s = actualStores[i];
                                            if (s) {
                                                return {
                                                    pincode: s.pincode ?? "",
                                                    county: s.county ?? "",
                                                    state: s.state ?? "",
                                                    country: s.country ?? "",
                                                };
                                            }
                                            return emptyForm();
                                        }));

                                        setSubmitted(Array.from({ length: storeCount }, (_, i) => i < actualStores.length));
                                    }
                                } else {
                                    toast.error("Failed to fetch fresh store data.");
                                }
                            } catch (e) {
                                toast.error("Failed to verify store records.");
                            } finally {
                                setLoading(false);
                            }
                        }}
                        style={{ width: 'auto', padding: '0.75rem 2rem' }}
                    >
                        {loading ? "Verifying..." : "Go to Dashboard"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default StoreSetup;





