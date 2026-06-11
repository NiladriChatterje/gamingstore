import { Navigate } from 'react-router-dom';
import styles from './Home.module.css';
import { useUser, useAuth } from '@clerk/clerk-react';
import { FaDollarSign, FaChartLine, FaShoppingCart, FaArrowUp, FaTags, FaUsers, FaBox } from 'react-icons/fa';
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { useAdminStateContext } from '../AdminStateContext';

interface DashboardMetrics {
    totalSales: { value: string; trend: string; numericValue: number };
    totalProfit: { value: string; trend: string; numericValue: number };
    ordersServed: { value: string; trend: string; numericValue: number };
    activeCustomers: { value: string; trend: string; numericValue: number };
    monthlyRevenue: { value: string; trend: string; numericValue: number };
    productsSold: { value: string; trend: string; numericValue: number };
    totalProductsInInventory: { value: string | number; trend: string; numericValue: number };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5003';

const Home = () => {
    const { isSignedIn } = useUser();
    const { getToken } = useAuth();
    const topLayerRef = useRef<HTMLElement>(null);
    const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasDateChanged = useRef(false);
    const {
        admin,
        fromDate,
        setFromDate,
        toDate,
        setToDate,
    } = useAdminStateContext();

    // Bug fix #1: Added missing `return` — without it the component continues
    // to render even when the user is not signed in.
    if (!isSignedIn) {
        return <Navigate to={'/user'} />;
    }

    // Bug fix #2: Uses local date components instead of toISOString() to avoid
    // timezone off-by-one errors (e.g. IST users seeing previous day's date).
    const formatDateForInput = (date: Date | null): string => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Bug fix #3: Wrapped in useCallback with explicit date parameters instead
    // of reading fromDate/toDate from closure. This prevents stale closures and
    // avoids unnecessary re-fetches when dates change.
    const fetchDashboardMetrics = useCallback(async (filterFromDate?: Date | null, filterToDate?: Date | null) => {
        try {
            setLoading(true);
            setError(null);

            if (!admin?._id) {
                throw new Error('User ID not available');
            }

            const token = await getToken();

            let url = `${API_BASE_URL}/${admin._id}/dashboard-metrics`;
            if (filterFromDate && filterToDate) {
                const fromDateISO = filterFromDate.toISOString();
                const toDateISO = filterToDate.toISOString();
                url += `?fromDate=${fromDateISO}&toDate=${toDateISO}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const metrics = await response.json();
            setDashboardMetrics(metrics);
        } catch (err) {
            console.error('Failed to fetch dashboard metrics:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch dashboard metrics');
        } finally {
            setLoading(false);
        }
    }, [admin?._id, getToken]);

    // Bug fix #4: Replaced async function with setTimeout race condition.
    // Now simply updates state; the useEffect below triggers the actual fetch.
    const handleDateChange = (type: 'from' | 'to', date: Date | null) => {
        hasDateChanged.current = true;
        if (type === 'from') {
            setFromDate?.(date);
        } else {
            setToDate?.(date);
        }
    };

    // Fetch data on component mount (without date filter)
    useEffect(() => {
        if (isSignedIn && admin?._id) {
            fetchDashboardMetrics();
        }
    }, [isSignedIn, admin?._id, fetchDashboardMetrics]);

    // Bug fix #5: Replaced the empty/useless useEffect + setTimeout pattern.
    // This effect properly triggers a filtered fetch whenever the user changes
    // dates, without relying on fragile setTimeout delays.
    useEffect(() => {
        if (!hasDateChanged.current) return;
        if (fromDate && toDate) {
            fetchDashboardMetrics(fromDate, toDate);
        }
    }, [fromDate, toDate, fetchDashboardMetrics]);

    // Left snap-scrollable column cards (4 core metrics)
    const leftSnapCards = useMemo(() => [
        {
            id: 'sales',
            label: 'Total Sales',
            value: dashboardMetrics?.totalSales?.value || '$0',
            trend: dashboardMetrics?.totalSales?.trend || '+0% from last month',
            icon: FaDollarSign,
            iconColor: '#1976d2',
            backgroundColor: '#e3f2fd',
        },
        {
            id: 'profit',
            label: 'Total Profit',
            value: dashboardMetrics?.totalProfit?.value || '$0',
            trend: dashboardMetrics?.totalProfit?.trend || '+0% from last month',
            icon: FaChartLine,
            iconColor: '#388e3c',
            backgroundColor: '#e8f5e9',
        },
        {
            id: 'orders',
            label: 'Orders Served',
            value: dashboardMetrics?.ordersServed?.value || '0',
            trend: dashboardMetrics?.ordersServed?.trend || '+0% from last month',
            icon: FaShoppingCart,
            iconColor: '#c2185b',
            backgroundColor: '#fce4ec',
        },
        {
            id: 'products-sold',
            label: 'Products Sold',
            value: dashboardMetrics?.productsSold?.value || '0',
            trend: dashboardMetrics?.productsSold?.trend || '+0% from last month',
            icon: FaBox,
            iconColor: '#388e3c',
            backgroundColor: '#e8f5e8',
        },
    ], [dashboardMetrics]);

    // Right top row cards (3 complementary metrics)
    const rightTopCards = useMemo(() => [
        {
            id: 'revenue',
            label: 'Monthly Revenue',
            value: dashboardMetrics?.monthlyRevenue?.value || '$0',
            trend: dashboardMetrics?.monthlyRevenue?.trend || '+0% from last month',
            icon: FaChartLine,
            iconColor: '#f57c00',
            backgroundColor: '#fff3e0',
        },
        {
            id: 'customers',
            label: 'Active Customers',
            value: dashboardMetrics?.activeCustomers?.value || '0',
            trend: dashboardMetrics?.activeCustomers?.trend || '+0% from last month',
            icon: FaUsers,
            iconColor: '#7b1fa2',
            backgroundColor: '#f3e5f5',
        },
        {
            id: 'total-products',
            label: 'Total Products',
            value: dashboardMetrics?.totalProductsInInventory?.value || '0',
            trend: dashboardMetrics?.totalProductsInInventory?.trend || '+0% from last month',
            icon: FaTags,
            iconColor: '#d32f2f',
            backgroundColor: '#ffebee',
        },
    ], [dashboardMetrics]);

    // Bug fix #9: Memoized chart data generation and added division-by-zero
    // guard for totalDuration. Removed unused `interval` variable in favor of
    // direct intervalDays comparisons.
    const chartData = useMemo(() => {
        const startDate = fromDate || new Date(new Date().getFullYear(), 0, 1);
        const endDate = toDate || new Date();

        const labels: string[] = [];
        const salesData: number[] = [];
        const profitData: number[] = [];
        const ordersData: number[] = [];

        const timeDiff = endDate.getTime() - startDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        let intervalDays = 1;
        if (daysDiff > 365) {
            intervalDays = 30;
        } else if (daysDiff > 60) {
            intervalDays = 7;
        }

        const currentDate = new Date(startDate);
        const finalSalesValue = dashboardMetrics?.totalSales?.numericValue || 0;
        const finalProfitValue = dashboardMetrics?.totalProfit?.numericValue || 0;
        const finalOrdersValue = dashboardMetrics?.ordersServed?.numericValue || 0;

        let dataPointIndex = 0;

        while (currentDate <= endDate) {
            let label = '';
            if (intervalDays === 1) {
                label = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else if (intervalDays === 7) {
                const weekEnd = new Date(currentDate);
                weekEnd.setDate(weekEnd.getDate() + 6);
                label = `${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
            } else {
                label = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }

            labels.push(label);

            const totalDuration = endDate.getTime() - startDate.getTime();
            const currentProgress = totalDuration > 0
                ? (currentDate.getTime() - startDate.getTime()) / totalDuration
                : 0;

            const baseVariation = 0.15;
            const randomFactor = (Math.sin(dataPointIndex * 0.5) * 0.5 + 0.5) * baseVariation + (1 - baseVariation);

            const salesValue = Math.round(finalSalesValue * currentProgress * randomFactor);
            const profitValue = Math.round(finalProfitValue * currentProgress * randomFactor);
            const ordersValue = Math.round(finalOrdersValue * currentProgress * randomFactor);

            salesData.push(Math.max(0, salesValue));
            profitData.push(Math.max(0, profitValue));
            ordersData.push(Math.max(0, ordersValue));

            if (intervalDays === 30) {
                currentDate.setMonth(currentDate.getMonth() + 1);
            } else {
                currentDate.setDate(currentDate.getDate() + intervalDays);
            }

            dataPointIndex++;
        }

        // Return Recharts-compatible data format
        return labels.map((label, i) => ({
            name: label,
            sales: salesData[i],
            profit: profitData[i],
            orders: ordersData[i],
        }));
    }, [fromDate, toDate, dashboardMetrics]);

    const renderCard = (card: {
        id: string;
        label: string;
        value: string;
        trend: string;
        icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
        iconColor: string;
        backgroundColor: string;
    }, className: string) => {
        const IconComponent = card.icon;
        return (
            <article key={card.id} className={className}>
                <header className={styles['card-header']}>
                    <div
                        className={styles['icon-wrapper']}
                        style={{ backgroundColor: card.backgroundColor }}
                        aria-hidden="true"
                    >
                        <IconComponent
                            className={styles['card-icon']}
                            style={{ color: card.iconColor }}
                        />
                    </div>
                    <span className={styles['card-label']}>{card.label}</span>
                </header>
                <h2 className={styles['card-value']}>{card.value}</h2>
                <aside className={styles['card-trend']}>
                    <FaArrowUp className={styles['trend-icon']} aria-hidden="true" />
                    <span>{card.trend}</span>
                </aside>
            </article>
        );
    };

    const renderLoading = () => (
        <div className={styles['loading-state']}>
            Loading dashboard metrics...
        </div>
    );

    return (
        <main id={styles['container']}>
            <section className={styles.dateSection}>
                <div id={styles.fromDate}>
                    <label htmlFor="fromDate">From Date:</label>
                    <input
                        type="date"
                        id="fromDate"
                        value={formatDateForInput(fromDate || null)}
                        onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : null;
                            handleDateChange('from', date);
                        }}
                        max={formatDateForInput(toDate || new Date())}
                    />
                </div>
                <div id={styles.toDate}>
                    <label htmlFor="toDate">To Date:</label>
                    <input
                        type="date"
                        id="toDate"
                        value={formatDateForInput(toDate || null)}
                        onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : null;
                            handleDateChange('to', date);
                        }}
                        min={formatDateForInput(fromDate || null)}
                        max={formatDateForInput(new Date())}
                    />
                </div>
            </section>

            {error && (
                <div className={styles['error-banner']}>
                    Error loading dashboard: {error}
                </div>
            )}

            <div className={styles['dashboard-content']}>
                {/* Left column — snap-scrollable metrics */}
                <section
                    ref={topLayerRef}
                    className={styles['left-column']}
                    aria-label="Key performance metrics"
                >
                    {loading ? (
                        renderLoading()
                    ) : (
                        leftSnapCards.map(card =>
                            renderCard(card, `${styles['snap-card']} ${styles['brief-cards']}`)
                        )
                    )}
                </section>

                {/* Right column — top row stats + line chart */}
                <div className={styles['right-column']}>
                    <div className={styles['right-top-row']}>
                        {loading ? (
                            renderLoading()
                        ) : (
                            rightTopCards.map(card =>
                                renderCard(card, `${styles['right-stat-card']} ${styles['brief-cards']}`)
                            )
                        )}
                    </div>

                    <section className={styles['graph-container']} aria-label="Performance chart">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.12} />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                                    </linearGradient>
                                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.12} />
                                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                                    </linearGradient>
                                    <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ec4899" stopOpacity={0.12} />
                                        <stop offset="100%" stopColor="#ec4899" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontFamily: "'Inter', sans-serif", fill: '#94a3b8' }}
                                    tickMargin={8}
                                    angle={0}
                                    minTickGap={40}
                                />
                                <YAxis
                                    yAxisId="left"
                                    orientation="left"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontFamily: "'Inter', sans-serif", fill: '#94a3b8' }}
                                    tickMargin={8}
                                    tickFormatter={(value: number) => `$${value.toLocaleString()}`}
                                    domain={[0, 'auto']}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontFamily: "'Inter', sans-serif", fill: '#94a3b8' }}
                                    tickMargin={8}
                                    tickFormatter={(value: number) => value.toLocaleString()}
                                    domain={[0, 'auto']}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid rgba(0, 0, 0, 0.06)',
                                        borderRadius: 8,
                                        padding: '12px',
                                        fontSize: 12,
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                    labelStyle={{
                                        color: '#1a202c',
                                        fontWeight: 600,
                                        fontSize: 13,
                                        marginBottom: 4,
                                    }}
                                    formatter={(value: number, name: string) => {
                                        if (name === 'orders') {
                                            return [value.toLocaleString(), 'Orders'];
                                        }
                                        const label = name === 'sales' ? 'Sales ($)' : 'Profit ($)';
                                        return [`$${value.toLocaleString()}`, label];
                                    }}
                                />
                                <Legend
                                    verticalAlign="top"
                                    align="right"
                                    iconType="circle"
                                    wrapperStyle={{
                                        paddingBottom: 8,
                                        fontSize: 12,
                                        fontFamily: "'Inter', sans-serif",
                                        fontWeight: 500,
                                    }}
                                />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="sales"
                                    name="Sales ($)"
                                    stroke="#6366f1"
                                    strokeWidth={2.5}
                                    fill="url(#salesGrad)"
                                    dot={false}
                                    activeDot={{ r: 5, fill: '#6366f1' }}
                                    animationDuration={1000}
                                    animationEasing="ease-out"
                                />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="profit"
                                    name="Profit ($)"
                                    stroke="#22c55e"
                                    strokeWidth={2.5}
                                    fill="url(#profitGrad)"
                                    dot={false}
                                    activeDot={{ r: 5, fill: '#22c55e' }}
                                    animationDuration={1000}
                                    animationEasing="ease-out"
                                />
                                <Area
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="orders"
                                    name="Orders"
                                    stroke="#ec4899"
                                    strokeWidth={2.5}
                                    fill="url(#ordersGrad)"
                                    dot={false}
                                    activeDot={{ r: 5, fill: '#ec4899' }}
                                    animationDuration={1000}
                                    animationEasing="ease-out"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </section>
                </div>
            </div>
        </main>
    )
}

export default Home