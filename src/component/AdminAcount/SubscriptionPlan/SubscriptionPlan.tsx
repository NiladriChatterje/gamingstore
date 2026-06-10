import React from 'react'
import Checkout from '../../../utils/Checkout';
import styles from './SubscriptionPlan.module.css';
import { useNavigate } from 'react-router-dom';
import { useAdminStateContext } from '../AdminStateContext';
import { useAuth, useUser } from '@clerk/clerk-react';
import { FaStore, FaCrown, FaCheckCircle } from 'react-icons/fa';

// Plan definitions — single source of truth for prices, features, validity and store count
const PLANS = [
    {
        label: 'Basic',
        price: Number(import.meta.env.VITE_SUBSCRIPTION_PLAN_1) || 599,
        validity: 175,
        validityLabel: '3 Months',
        storeAllotment: 1,
        highlighted: false,
        features: [
            '5GB Storage',
            '3-months Validity',
            '1 Store Location',
            'Out-of-stock notification (email)',
            'SSL/TLS',
        ],
    },
    {
        label: 'Standard',
        price: Number(import.meta.env.VITE_SUBSCRIPTION_PLAN_2) || 899,
        validity: 365,
        validityLabel: '6 Months',
        storeAllotment: 3,
        highlighted: true,
        features: [
            '10GB Storage',
            '6-months Validity',
            'Up to 3 Store Locations',
            'Out-of-stock notification (phone + email)',
            'SSL/TLS',
            'SSO',
            'Manual Cache Control',
        ],
    },
    {
        label: 'Premium',
        price: 1299,
        validity: 365,
        validityLabel: '12 Months',
        storeAllotment: 10,
        highlighted: false,
        features: [
            '25GB Storage',
            '12-months Validity',
            'Up to 10 Store Locations',
            'Out-of-stock notification (phone + email + SMS)',
            'SSL/TLS',
            'SSO',
            'Manual Cache Control',
            'Analytics Dashboard',
            'Priority Customer Support',
            'Custom Domain Support',
            'Advanced Inventory Management',
        ],
    },
];

const SubscriptionPlan = ({ setIsPlanActive }: { setIsPlanActive: React.Dispatch<boolean> }) => {
    const { admin } = useAdminStateContext();
    const { user } = useUser();
    const navigate = useNavigate();
    const { getToken } = useAuth();

    const handleCheckout = async (
        plan: typeof PLANS[number],
        _payment_id: string,
        _payment_signature: string,
        _order_id: string
    ) => {
        const sellerId = admin?._id ?? `seller-${user?.id}`;
        const response = await fetch('http://localhost:5000/seller-subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${await getToken()}`,
            },
            body: JSON.stringify({
                _id: sellerId,
                username: user?.firstName,
                email: user?.emailAddresses[0]?.emailAddress,
                subscriptionPlan: {
                    amount: plan.price,
                    storeAllotment: plan.storeAllotment,
                    _type: 'subscription',
                    transactionId: _payment_id,
                    orderId: _order_id,
                    paymentSignature: _payment_signature,
                    planSchemaList: {
                        activeDate: new Date(),
                        expireDate: new Date(new Date().getTime() + plan.validity * 24 * 60 * 60 * 1000),
                    },
                },
            }),
        });

        if (response.ok) {
            setIsPlanActive(true);
            navigate('/admin');
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.pageContent}>
                <div className={styles.header}>
                    <FaCrown size={32} className={styles.headerIcon} />
                    <div>
                        <h1 className={styles.title}>Choose Your Plan</h1>
                        <p className={styles.subtitle}>
                            Select a subscription plan that fits your business needs
                        </p>
                    </div>
                </div>

                <div className={styles.plansGrid}>
                    {PLANS.map((plan) => (
                        <section
                            key={plan.price}
                            className={`${styles.planCard} ${plan.highlighted ? styles.highlighted : ''}`}
                        >
                            {plan.highlighted && (
                                <span className={styles.popularBadge}>Most Popular</span>
                            )}

                            <div className={styles.planContent}>
                                <h3 className={styles.planLabel}>{plan.label}</h3>

                                <div className={styles.priceRow}>
                                    <span className={styles.priceSymbol}>₹</span>
                                    <span className={styles.priceAmount}>{plan.price}</span>
                                    <span className={styles.pricePeriod}>/{plan.validityLabel.toLowerCase()}</span>
                                </div>

                                <div className={styles.storeBadge}>
                                    <FaStore size={14} />
                                    <span>{plan.storeAllotment} {plan.storeAllotment === 1 ? 'Store' : 'Stores'}</span>
                                </div>
                            </div>

                            <ul className={styles.featureList}>
                                {plan.features.map((f) => (
                                    <li key={f}>
                                        <FaCheckCircle size={14} className={styles.checkIcon} />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className={styles.planFooter}>
                                <Checkout
                                    price={plan.price}
                                    callback={async (_payment_id: string, _payment_signature: string, _order_id: string) =>
                                        handleCheckout(plan, _payment_id, _payment_signature, _order_id)
                                    }
                                />
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPlan;