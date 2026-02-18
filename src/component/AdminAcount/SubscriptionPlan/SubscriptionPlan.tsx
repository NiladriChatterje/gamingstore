import React from 'react'
import Checkout from '../../../utils/Checkout';
import styles from './SubscriptionPlan.module.css';
import { useNavigate } from 'react-router-dom';
import { useAdminStateContext } from '../AdminStateContext';
import { useAuth } from '@clerk/clerk-react';

const SubscriptionPlan = ({ setIsPlanActive }: { setIsPlanActive: React.Dispatch<boolean> }) => {
    const { admin } = useAdminStateContext()
    const navigate = useNavigate();
    const { getToken } = useAuth();

    return (
        <div id={styles['subscription-container']}>
            <section className={styles['subscription-plans']}>
                <span>₹ 299</span>
                <article className={styles['subscription-content']}>
                    <ul>
                        <li>5GB Storage</li>
                        <li>3-months Validity</li>
                        <li>Out-of-stock notification (email)</li>
                        <li>SSL/TLS</li>
                    </ul>
                </article>
                <Checkout
                    price={Number(import.meta.env.VITE_SUBSCRIPTION_PLAN_1)}
                    callback={async (_payment_id: string, _payment_signature: string, _order_id: string) => {
                        const response = await fetch('http://localhost:5000/seller-subscription', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${await getToken()}`
                            },
                            body: JSON.stringify({
                                _id: admin?._id,
                                subscriptionPlan: {
                                    amount: Number(import.meta.env.VITE_SUBSCRIPTION_PLAN_1),
                                    _type: "subscription",
                                    transactionId: _payment_id,
                                    orderId: _order_id,
                                    paymentSignature: _payment_signature,
                                    planSchemaList: {
                                        activeDate: new Date(),
                                        expireDate: new Date(new Date().getTime() + 175 * 24 * 60 * 60 * 1000)
                                    }
                                },
                            }),
                        });
                        //check payment_service
                        // const data = await response.text()

                        if (response.ok) {
                            setIsPlanActive(true);
                            navigate('/admin');
                        }
                        return;
                    }} />
            </section>
            <section className={styles['subscription-plans']}>
                <span>₹ 699</span>
                <article className={styles['subscription-content']}>
                    <ul>
                        <li>10GB Storage</li>
                        <li>6-months Validity</li>
                        <li>Out-of-stock notification (phone+email)</li>
                        <li>SSL/TLS</li>
                        <li>SSO</li>
                        <li>Manual Cache Control</li>
                    </ul>
                </article>
                <Checkout
                    price={Number(import.meta.env.VITE_SUBSCRIPTION_PLAN_2)}
                    callback={async (_payment_id: string, _payment_signature: string, _order_id: string) => {
                        const response = await fetch('http://localhost:5000/seller-subscription', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                "Authorization": `Bearer ${await getToken()}`
                            },
                            body: JSON.stringify({
                                _id: admin?._id,
                                subscriptionPlan: {
                                    amount: Number(import.meta.env.VITE_SUBSCRIPTION_PLAN_2),
                                    _type: "subscription",
                                    transactionId: _payment_id,
                                    orderId: _order_id,
                                    paymentSignature: _payment_signature,
                                    planSchemaList: {
                                        activeDate: new Date(),
                                        expireDate: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000)
                                    }
                                },
                            }),
                        });

                        //check payment_service
                        // const data = await response.text();

                        if (response.ok) {
                            setIsPlanActive(true)
                            navigate('/admin')
                        }
                        return;
                    }}
                />
            </section>
            <section className={styles['subscription-plans']}>
                <span>₹ 1299</span>
                <article className={styles['subscription-content']}>
                    <ul>
                        <li>25GB Storage</li>
                        <li>12-months Validity</li>
                        <li>Out-of-stock notification (phone+email+SMS)</li>
                        <li>SSL/TLS</li>
                        <li>SSO</li>
                        <li>Manual Cache Control</li>
                        <li>Analytics Dashboard</li>
                        <li>Priority Customer Support</li>
                        <li>Custom Domain Support</li>
                        <li>Advanced Inventory Management</li>
                    </ul>
                </article>
                <Checkout
                    price={1299}
                    callback={async (_payment_id: string, _payment_signature: string, _order_id: string) => {
                        const response = await fetch('http://localhost:5000/seller-subscription', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${await getToken()}`
                            },
                            body: JSON.stringify({
                                _id: admin?._id,
                                subscriptionPlan: {
                                    amount: 1299,
                                    _type: "subscription",
                                    transactionId: _payment_id,
                                    orderId: _order_id,
                                    paymentSignature: _payment_signature,
                                    planSchemaList: {
                                        activeDate: new Date(),
                                        expireDate: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000)
                                    }
                                },
                            }),
                        });

                        //check payment_service
                        // const data = await response.text()

                        if (response.ok) {
                            setIsPlanActive(true);
                            navigate('/admin');
                        }
                        return;
                    }} />
            </section>
        </div>
    )
}

export default SubscriptionPlan