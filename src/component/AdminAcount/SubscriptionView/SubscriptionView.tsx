import { useMemo } from 'react'
import { FaCrown, FaStore, FaCalendarAlt, FaCheckCircle, FaArrowRight } from 'react-icons/fa'
import { useAdminStateContext } from '../AdminStateContext'
import { useNavigate } from 'react-router-dom'
import styles from './SubscriptionView.module.css'

const PLANS = [
  {
    price: 599,
    label: 'Basic',
    validity: '3 Months',
    storeAllotment: 1,
    features: ['5GB Storage', '1 Store Location', 'Email Notification', 'SSL/TLS'],
  },
  {
    price: 899,
    label: 'Standard',
    validity: '6 Months',
    storeAllotment: 3,
    features: ['10GB Storage', 'Up to 3 Stores', 'Email + Phone Notification', 'SSL/TLS', 'SSO', 'Manual Cache Control'],
  },
  {
    price: 1299,
    label: 'Premium',
    validity: '12 Months',
    storeAllotment: 10,
    features: ['25GB Storage', 'Up to 10 Stores', 'Email + Phone + SMS', 'SSL/TLS', 'SSO', 'Analytics Dashboard', 'Priority Support', 'Custom Domain'],
  },
]

const SubscriptionView = () => {
  const { admin } = useAdminStateContext()
  const navigate = useNavigate()

  const currentPlan = useMemo(() => {
    if (!admin?.subscriptionPlan?.length) return null
    const sub = admin.subscriptionPlan[0]
    const storeCount = sub.storeAllotment ?? 1
    const planMeta = PLANS.find(p => p.storeAllotment === storeCount) || PLANS[PLANS.length - 1]
    return {
      ...planMeta,
      transactionId: sub.transactionId,
      activeDate: sub.planSchemaList?.activeDate,
      expireDate: sub.planSchemaList?.expireDate,
    }
  }, [admin])

  const daysLeft = useMemo(() => {
    if (!currentPlan?.expireDate) return null
    const now = new Date().getTime()
    const expire = new Date(currentPlan.expireDate).getTime()
    return Math.max(0, Math.ceil((expire - now) / (1000 * 60 * 60 * 24)))
  }, [currentPlan])

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <FaCrown size={28} className={styles.headerIcon} />
        <div>
          <h2 className={styles.title}>Subscription Plan</h2>
          <p className={styles.subtitle}>Your current plan and available upgrades</p>
        </div>
      </div>

      {currentPlan ? (
        <div className={styles.currentPlan}>
          <div className={styles.planBadge}>
            <FaCrown size={16} />
            <span>Current Plan — {currentPlan.label}</span>
          </div>
          <div className={styles.planMeta}>
            <div className={styles.metaItem}>
              <FaStore size={14} />
              <span>{currentPlan.storeAllotment} Store{currentPlan.storeAllotment !== 1 ? 's' : ''}</span>
            </div>
            <div className={styles.metaItem}>
              <FaCalendarAlt size={14} />
              <span>{daysLeft !== null ? `${daysLeft} days remaining` : 'Active'}</span>
            </div>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: daysLeft !== null && currentPlan?.validity ? `${Math.min(100, (daysLeft / 365) * 100)}%` : '50%' }}
            ></div>
          </div>
          <ul className={styles.featureList}>
            {currentPlan.features.map((f: string) => (
              <li key={f}>
                <FaCheckCircle size={14} className={styles.checkIcon} />
                {f}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className={styles.noPlan}>
          <p>No active subscription plan found.</p>
        </div>
      )}

      <h3 className={styles.upgradeTitle}>Available Plans</h3>
      <div className={styles.plansGrid}>
        {PLANS.map(plan => {
          const isCurrent = currentPlan?.storeAllotment === plan.storeAllotment
          return (
            <div
              key={plan.price}
              className={`${styles.planCard} ${isCurrent ? styles.currentCard : ''}`}
            >
              <h4 className={styles.planLabel}>{plan.label}</h4>
              <div className={styles.planPrice}>
                <span className={styles.priceAmount}>₹{plan.price}</span>
                <span className={styles.pricePeriod}>/{plan.validity.toLowerCase()}</span>
              </div>
              <div className={styles.planStores}>
                <FaStore size={14} />
                <span>{plan.storeAllotment} Store{plan.storeAllotment !== 1 ? 's' : ''}</span>
              </div>
              <ul className={styles.planFeatures}>
                {plan.features.map(f => (
                  <li key={f}>
                    <FaCheckCircle size={12} className={styles.checkIcon} />
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <span className={styles.currentLabel}>Current Plan</span>
              ) : (
                <button
                  className={styles.upgradeBtn}
                  onClick={() => navigate('/admin/add-product')}
                >
                  Upgrade <FaArrowRight size={12} />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SubscriptionView
