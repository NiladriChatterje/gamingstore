import { useState, useMemo } from 'react'
import { FaStore, FaDatabase, FaMapMarkerAlt, FaPlus, FaCrown, FaArrowRight } from 'react-icons/fa'
import { useAdminStateContext } from '../AdminStateContext'
import { useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import styles from './StoreManagement.module.css'

const StoreManagement = () => {
  const { admin, setAdmin } = useAdminStateContext()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [newStore, setNewStore] = useState({
    store_name: '',
    address_line1: '',
    address_line2: '',
    pincode: '',
    county: '',
    state: '',
    country: '',
  })

  const stores = admin?.stores ?? []

  // Compute the max store allotment from subscription plan
  const storeAllotment = useMemo(() => {
    if (!admin?.subscriptionPlan?.length) return 0;
    return admin.subscriptionPlan.reduce(
      (max: number, plan: any) => Math.max(max, plan.storeAllotment ?? 1),
      0
    );
  }, [admin?.subscriptionPlan]);

  const canAddStore = stores.length < storeAllotment;

  const handleAddStore = async () => {
    if (!newStore.store_name || !newStore.address_line1 || !newStore.pincode || !newStore.county || !newStore.state || !newStore.country) {
      toast.error('Please fill all required fields')
      return
    }

    setSaving(true)
    try {
      const token = await getToken()
      const response = await fetch('http://localhost:5003/configure-store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          storeId: newStore.pincode,
          sellerId: admin?._id,
          ...newStore,
        }),
      })

      if (response.ok) {
        toast.success('Store added successfully!')
        setShowForm(false)
        setNewStore({ store_name: '', address_line1: '', address_line2: '', pincode: '', county: '', state: '', country: '' })
        // Refresh admin data to get updated stores
        const token2 = await getToken()
        const refresh = await fetch(`http://localhost:5003/fetch-admin-data/${admin?._id}`, {
          headers: { Authorization: `Bearer ${token2}` }
        })
        if (refresh.ok) {
          const data = await refresh.json()
          setAdmin?.(data)
        }
      } else {
        const err = await response.json()
        toast.error(err?.error || 'Failed to add store')
      }
    } catch (e) {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <FaStore size={28} className={styles.headerIcon} />
        <div>
          <h2 className={styles.title}>Store Management</h2>
          <p className={styles.subtitle}>{stores.length} store{stores.length !== 1 ? 's' : ''} configured</p>
        </div>
      </div>

      <div className={styles.storeList}>
        {stores.map((store: any, idx: number) => (
          <div key={idx} className={styles.storeCard}>
            <div className={styles.storeBadge}>
              <FaStore size={16} />
              <span>Store #{store.store_number || idx + 1}</span>
            </div>
            <div className={styles.storeDetails}>
              <div className={styles.detailRow}>
                <FaMapMarkerAlt size={14} className={styles.detailIcon} />
                <span>{store.store_name || 'Unnamed Store'} — {store.county}, {store.state}</span>
              </div>
              <div className={styles.detailRow}>
                <FaDatabase size={14} className={styles.detailIcon} />
                <span>Shard: <strong>{store.shard_host || 'N/A'}</strong> | Pincode: {store.pincode}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Store limit reached banner */}
      {!canAddStore && !showForm && stores.length > 0 && (
        <div className={styles.limitBanner}>
          <FaCrown size={18} className={styles.limitIcon} />
          <div className={styles.limitText}>
            <strong>Store limit reached</strong>
            <p>Your current plan ({storeAllotment} store{storeAllotment !== 1 ? 's' : ''}) is fully utilized. Upgrade to add more stores.</p>
          </div>
          <button className={styles.upgradeBtn} onClick={() => navigate('/admin/subscription')}>
            Upgrade <FaArrowRight size={12} />
          </button>
        </div>
      )}

      {!showForm ? (
        <button
          className={`${styles.addBtn} ${!canAddStore ? styles.addBtnDisabled : ''}`}
          onClick={() => canAddStore && setShowForm(true)}
          disabled={!canAddStore}
        >
          <FaPlus size={14} />
          {canAddStore ? 'Add New Store' : `Limit Reached (${stores.length}/${storeAllotment})`}
        </button>
      ) : (
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>New Store</h3>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Store Name *</label>
              <input
                type="text"
                placeholder="e.g. My Downtown Store"
                value={newStore.store_name}
                onChange={e => setNewStore(prev => ({ ...prev, store_name: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label>Address Line 1 *</label>
              <input
                type="text"
                placeholder="e.g. 123 Main Street"
                value={newStore.address_line1}
                onChange={e => setNewStore(prev => ({ ...prev, address_line1: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label>Address Line 2</label>
              <input
                type="text"
                placeholder="Optional"
                value={newStore.address_line2}
                onChange={e => setNewStore(prev => ({ ...prev, address_line2: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label>Pincode *</label>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 700001"
                value={newStore.pincode}
                onChange={e => setNewStore(prev => ({ ...prev, pincode: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label>County / City *</label>
              <input
                type="text"
                placeholder="e.g. Kolkata"
                value={newStore.county}
                onChange={e => setNewStore(prev => ({ ...prev, county: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label>State *</label>
              <input
                type="text"
                placeholder="e.g. West Bengal"
                value={newStore.state}
                onChange={e => setNewStore(prev => ({ ...prev, state: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label>Country *</label>
              <input
                type="text"
                placeholder="e.g. India"
                value={newStore.country}
                onChange={e => setNewStore(prev => ({ ...prev, country: e.target.value }))}
              />
            </div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleAddStore} disabled={saving}>
              {saving ? 'Saving...' : 'Save Store'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default StoreManagement
