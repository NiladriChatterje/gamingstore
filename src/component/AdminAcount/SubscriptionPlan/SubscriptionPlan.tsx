import styles from './SubscriptionPlan.module.css';

const SubscriptionPlan = () => {
    return (
        <div id={styles['subscription-container']}>
            <section className={styles['subscription-plans']}>
                <span>₹ 200</span>
                <article className={styles['subscription-content']}>
                    <ul>
                        <li>10GB Storage</li>
                        <li>3-months Validity</li>
                    </ul>
                </article>
                <button className={styles['purchase-btn']}>Activate</button>
            </section>
            <section className={styles['subscription-plans']}>
                <span>₹ 400</span>
                <article className={styles['subscription-content']}>
                    <ul>
                        <li>10GB Storage</li>
                        <li>3-months Validity</li>
                    </ul>
                </article>
                <button className={styles['purchase-btn']}>Activate</button>
            </section>
        </div>
    )
}

export default SubscriptionPlan