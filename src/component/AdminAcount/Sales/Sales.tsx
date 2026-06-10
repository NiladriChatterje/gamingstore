import { useEffect, useState, useMemo } from 'react'
import { useAdminStateContext } from '../AdminStateContext'
import { useAuth } from '@clerk/clerk-react'
import { FaRupeeSign, FaArrowUp, FaArrowDown, FaShoppingCart, FaPercent, FaCalendarAlt } from 'react-icons/fa'
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md'
import styles from './Sales.module.css'

interface SalesMetrics {
  totalSales: number;
  totalOrders: number;
  avgOrderValue: number;
  monthlySales: number;
  salesGrowth: number;
}

const Sales = () => {
  const { admin } = useAdminStateContext()
  const { getToken } = useAuth()
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchSalesData() {
      if (!admin?._id) return
      setLoading(true)
      try {
        const token = await getToken()
        // Reuse the dashboard-metrics endpoint which already has sales data
        const response = await fetch(
          `http://localhost:5003/${admin._id}/dashboard-metrics`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        if (!response.ok) throw new Error('Failed to fetch sales data')
        const data = await response.json()
        
        setMetrics({
          totalSales: data.totalSales?.numericValue ?? 0,
          totalOrders: data.ordersServed?.numericValue ?? 0,
          avgOrderValue: data.totalSales?.numericValue && data.ordersServed?.numericValue
            ? Math.round(data.totalSales.numericValue / data.ordersServed.numericValue)
            : 0,
          monthlySales: data.monthlyRevenue?.numericValue ?? 0,
          salesGrowth: 8.1, // placeholder until we compute month-over-month
        })
      } catch (err: any) {
        setError(err.message || 'Failed to load sales data')
      } finally {
        setLoading(false)
      }
    }
    fetchSalesData()
  }, [admin, getToken])

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading sales data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.errorState}>
          <p className={styles.errorText}>Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Sales Overview</h2>
        <p className={styles.subtitle}>Track your revenue and transaction performance</p>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <FaRupeeSign size={20} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Total Sales</span>
            <span className={styles.metricValue}>₹{metrics?.totalSales?.toLocaleString() ?? 0}</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <FaShoppingCart size={20} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Orders Served</span>
            <span className={styles.metricValue}>{metrics?.totalOrders?.toLocaleString() ?? 0}</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
            <FaPercent size={20} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Avg. Order Value</span>
            <span className={styles.metricValue}>₹{metrics?.avgOrderValue?.toLocaleString() ?? 0}</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <FaCalendarAlt size={20} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>This Month</span>
            <span className={styles.metricValue}>₹{metrics?.monthlySales?.toLocaleString() ?? 0}</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Recent Transactions</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Order ID</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className={styles.tableEmpty}>
                  Transaction history will appear here once orders are processed.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.infoBox}>
        <h4>Sales Analytics</h4>
        <p>
          Detailed sales analytics, including daily breakdowns, top-selling products,
          and revenue trends, are available in the Overview dashboard with the
          date range selector. For more granular data, please refer to the Orders section.
        </p>
      </div>
    </div>
  )
}

export default Sales
