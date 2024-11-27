import Checkout from '../../../utils/Checkout';
import styles from './SubscriptionPlan.module.css';

const SubscriptionPlan = () => {

    return (
        <div id={styles['subscription-container']}>
            <section className={styles['subscription-plans']}>
                <span>₹ 299</span>
                <article className={styles['subscription-content']}>
                    <ul>
                        <li>10GB Storage</li>
                        <li>3-months Validity</li>
                    </ul>
                </article>
                <Checkout
                    price={299} />
            </section>
            <section className={styles['subscription-plans']}>
                <span>₹ 699</span>
                <article className={styles['subscription-content']}>
                    <ul>
                        <li>10GB Storage</li>
                        <li>3-months Validity</li>
                    </ul>
                </article>
                <Checkout
                    price={699} />
            </section>
        </div>
    )
}

export default SubscriptionPlan