import React from 'react'
import Checkout from '../../../utils/Checkout';
import styles from './SubscriptionPlan.module.css';
import { useNavigate } from 'react-router-dom';
import { useAdminStateContext } from '../AdminStateContext';

const SubscriptionPlan = ({ setIsPlanActive }: { setIsPlanActive: React.Dispatch<boolean> }) => {
    const { admin } = useAdminStateContext()
    const navigate = useNavigate();

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
                        const response = await fetch('http://localhost:5000/save-subscription', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                _id: admin?._id,
                                plan: Number(import.meta.env.VITE_SUBSCRIPTION_PLAN_1),
                                _payment_id, _order_id, _payment_signature,
                                admin_document_id: admin?._id
                            }),
                        });
                        const data = await response.json()

                        if (data?.status == 200) {
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
                        <li>Multi-User support</li>
                        <li>Manual Cache Control</li>
                    </ul>
                </article>
                <Checkout
                    price={Number(import.meta.env.VITE_SUBSCRIPTION_PLAN_2)}
                    callback={async (_payment_id: string, _payment_signature: string, _order_id: string) => {
                        const response = await fetch('http://localhost:5000/save-subscription', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                _id: admin?._id,
                                plan: Number(import.meta.env.VITE_SUBSCRIPTION_PLAN_2),
                                _payment_id, _order_id, _payment_signature,
                                document_id: admin?._id
                            }),
                        });
                        const data = await response.json();

                        if (data?.status === 200) {
                            setIsPlanActive(true)
                            navigate('/admin')
                        }
                        return;
                    }}
                />
            </section>
        </div>
    )
}

export default SubscriptionPlan