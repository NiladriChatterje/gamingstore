import React from 'react'
import Checkout from '../../../utils/Checkout';
import styles from './SubscriptionPlan.module.css';
import { useNavigate } from 'react-router-dom';
import { useAdminStateContext } from '../AdminStateContext';
import { useAuth } from '@clerk/clerk-react';
import { FaStore } from 'react-icons/fa6';

// Plan definitions — single source of truth for prices, features, validity and store count
const PLANS = [
    {
        price: Number(import.meta.env.VITE_SUBSCRIPTION_PLAN_1),
        validity: 175, // days
        storeAllotment: 1,
        features: [
            '5GB Storage',
            '3-months Validity',
            '1 Store Location',
            'Out-of-stock notification (email)',
            'SSL/TLS',
        ],
    },
    {
        price: Number(import.meta.env.VITE_SUBSCRIPTION_PLAN_2),
        validity: 365,
        storeAllotment: 3,
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
        price: 1299,
        validity: 365,
        storeAllotment: 10,
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
    const navigate = useNavigate();
    const { getToken } = useAuth();

    const handleCheckout = async (
        plan: typeof PLANS[number],
        _payment_id: string,
        _payment_signature: string,
        _order_id: string
    ) => {
        const response = await fetch('http://localhost:5000/seller-subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${await getToken()}`,
            },
            body: JSON.stringify({
                _id: admin?._id,
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
        <div id={styles['subscription-container']}>
            {PLANS.map((plan) => (
                <section key={plan.price} className={styles['subscription-plans']}>
                    <span>₹ {plan.price}</span>

                    {/* Store allotment badge */}
                    <div className={styles['store-badge']}>
                        <FaStore size={13} />
                        <span>{plan.storeAllotment} {plan.storeAllotment === 1 ? 'Store' : 'Stores'}</span>
                    </div>

                    <article className={styles['subscription-content']}>
                        <ul>
                            {plan.features.map((f) => (
                                <li key={f}>{f}</li>
                            ))}
                        </ul>
                    </article>
                    <Checkout
                        price={plan.price}
                        callback={async (_payment_id: string, _payment_signature: string, _order_id: string) =>
                            handleCheckout(plan, _payment_id, _payment_signature, _order_id)
                        }
                    />
                </section>
            ))}
        </div>
    );
};

export default SubscriptionPlan;