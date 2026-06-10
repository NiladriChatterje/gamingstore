import { useState } from 'react'
import { FaWallet, FaUniversity, FaCreditCard, FaCheckCircle } from 'react-icons/fa'
import styles from './Payout.module.css'

const Payout = () => {
  const [payoutMethod, setPayoutMethod] = useState<'bank' | 'upi'>('bank')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <FaWallet size={28} className={styles.headerIcon} />
        <div>
          <h2 className={styles.title}>Payout Settings</h2>
          <p className={styles.subtitle}>Manage how you receive payments from sales</p>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Payout Method</h3>
        <div className={styles.methodSelector}>
          <button
            className={`${styles.methodBtn} ${payoutMethod === 'bank' ? styles.methodActive : ''}`}
            onClick={() => setPayoutMethod('bank')}
          >
            <FaUniversity size={18} />
            <span>Bank Transfer</span>
          </button>
          <button
            className={`${styles.methodBtn} ${payoutMethod === 'upi' ? styles.methodActive : ''}`}
            onClick={() => setPayoutMethod('upi')}
          >
            <FaCreditCard size={18} />
            <span>UPI</span>
          </button>
        </div>

        {payoutMethod === 'bank' && (
          <div className={styles.fields}>
            <div className={styles.field}>
              <label>Account Holder Name</label>
              <input type="text" placeholder="Enter account holder name" />
            </div>
            <div className={styles.field}>
              <label>Account Number</label>
              <input type="text" placeholder="Enter account number" />
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label>IFSC Code</label>
                <input type="text" placeholder="e.g. SBIN0001234" />
              </div>
              <div className={styles.field}>
                <label>Bank Name</label>
                <input type="text" placeholder="Enter bank name" />
              </div>
            </div>
          </div>
        )}

        {payoutMethod === 'upi' && (
          <div className={styles.fields}>
            <div className={styles.field}>
              <label>UPI ID</label>
              <input type="text" placeholder="e.g. seller@upi" />
            </div>
          </div>
        )}

        <button className={styles.saveBtn} onClick={handleSave}>
          {saved ? (
            <>
              <FaCheckCircle size={16} />
              Saved!
            </>
          ) : (
            'Save Payout Details'
          )}
        </button>
      </div>

      <div className={styles.infoBox}>
        <h4>About Payouts</h4>
        <p>
          Payouts are processed automatically at the end of each billing cycle.
          Funds from completed orders are transferred to your registered payout
          method within 3-5 business days. Please ensure your payout details
          are accurate to avoid delays.
        </p>
      </div>
    </div>
  )
}

export default Payout
