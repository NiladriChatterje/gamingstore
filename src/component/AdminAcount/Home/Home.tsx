import { Navigate } from 'react-router-dom';
import styles from './Home.module.css';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Line } from 'react-chartjs-2';
import { FaDollarSign, FaChartLine, FaShoppingCart, FaArrowUp, FaChevronDown, FaChevronUp, FaTags } from 'react-icons/fa';
import { useRef, useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface DashboardMetrics {
    totalSales: { value: string; trend: string; numericValue: number };
    totalProfit: { value: string; trend: string; numericValue: number };
    ordersServed: { value: string; trend: string; numericValue: number };
    activeCustomers: { value: string; trend: string; numericValue: number };
    monthlyRevenue: { value: string; trend: string; numericValue: number };
    productsSold: { value: string; trend: string; numericValue: number };
    totalProductsInInventory: { value: string | number; trend: string; numericValue: number };
}

const Home = () => {
    const { isSignedIn, user } = useUser();
    const { getToken } = useAuth();
    const topLayerRef = useRef<HTMLElement>(null);
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(false);
    const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    if (!isSignedIn)
        <Navigate to={'/user'} />

    // Fetch dashboard metrics from backend
    const fetchDashboardMetrics = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!user?.id) {
                throw new Error('User ID not available');
            }

            const token = await getToken();
            const response = await fetch(`http://localhost:5003/${user.id}/dashboard-metrics`, {
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
    };

    // Effect to fetch data on component mount
    useEffect(() => {
        if (isSignedIn && user?.id) {
            fetchDashboardMetrics();
        }
    }, [isSignedIn, user?.id]);

    // Performance cards data - now dynamic based on API response or fallback to defaults
    const performanceCards = [
        {
            id: 'sales',
            label: 'Total Sales',
            value: dashboardMetrics?.totalSales?.value || '$0',
            trend: dashboardMetrics?.totalSales?.trend || '+0% from last month',
            icon: FaDollarSign,
            iconColor: '#1976d2',
            backgroundColor: '#e3f2fd',
            cardClass: 'sales-card'
        },
        {
            id: 'profit',
            label: 'Total Profit',
            value: dashboardMetrics?.totalProfit?.value || '$0',
            trend: dashboardMetrics?.totalProfit?.trend || '+0% from last month',
            icon: FaChartLine,
            iconColor: '#388e3c',
            backgroundColor: '#e8f5e9',
            cardClass: 'profit-card'
        },
        {
            id: 'orders',
            label: 'Orders Served',
            value: dashboardMetrics?.ordersServed?.value || '0',
            trend: dashboardMetrics?.ordersServed?.trend || '+0% from last month',
            icon: FaShoppingCart,
            iconColor: '#c2185b',
            backgroundColor: '#fce4ec',
            cardClass: 'orders-card'
        },
        {
            id: 'customers',
            label: 'Active Customers',
            value: dashboardMetrics?.activeCustomers?.value || '0',
            trend: dashboardMetrics?.activeCustomers?.trend || '+0% from last month',
            icon: FaDollarSign,
            iconColor: '#7b1fa2',
            backgroundColor: '#f3e5f5',
            cardClass: 'customers-card'
        },
        {
            id: 'revenue',
            label: 'Monthly Revenue',
            value: dashboardMetrics?.monthlyRevenue?.value || '$0',
            trend: dashboardMetrics?.monthlyRevenue?.trend || '+0% from last month',
            icon: FaChartLine,
            iconColor: '#f57c00',
            backgroundColor: '#fff3e0',
            cardClass: 'revenue-card'
        },
        {
            id: 'products',
            label: 'Products Sold',
            value: dashboardMetrics?.productsSold?.value || '0',
            trend: dashboardMetrics?.productsSold?.trend || '+0% from last month',
            icon: FaShoppingCart,
            iconColor: '#388e3c',
            backgroundColor: '#e8f5e8',
            cardClass: 'products-card'
        },
        {
            id: 'Total Products',
            label: 'Total Products',
            value: dashboardMetrics?.totalProductsInInventory?.value || '0',
            trend: dashboardMetrics?.totalProductsInInventory?.trend || '+0% from last month',
            icon: FaTags,
            iconColor: '#d32f2f',
            backgroundColor: '#ffebee',
            cardClass: 'categories-card'
        }
    ];

    // Check scroll position and update navigation button states
    const checkScrollPosition = () => {
        if (topLayerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = topLayerRef.current;
            // Add small tolerance for floating point precision
            const tolerance = 1;
            setCanScrollUp(scrollTop > tolerance);
            setCanScrollDown(scrollTop < scrollHeight - clientHeight - tolerance);
        }
    };

    // Scroll functions
    const scrollUp = () => {
        if (topLayerRef.current) {
            const cardHeight = topLayerRef.current.scrollHeight / Math.ceil(performanceCards.length / 3);
            topLayerRef.current.scrollBy({ top: -cardHeight, behavior: 'smooth' });
        }
    };

    const scrollDown = () => {
        if (topLayerRef.current) {
            const cardHeight = topLayerRef.current.scrollHeight / Math.ceil(performanceCards.length / 3);
            topLayerRef.current.scrollBy({ top: cardHeight, behavior: 'smooth' });
        }
    };

    // Check scroll position on component mount and scroll events
    useEffect(() => {
        // Small delay to ensure DOM is fully rendered
        const timer = setTimeout(() => {
            checkScrollPosition();
        }, 100);

        const handleScroll = () => checkScrollPosition();

        if (topLayerRef.current) {
            topLayerRef.current.addEventListener('scroll', handleScroll);
            return () => {
                clearTimeout(timer);
                if (topLayerRef.current) {
                    topLayerRef.current.removeEventListener('scroll', handleScroll);
                }
            };
        }

        return () => clearTimeout(timer);
    }, [performanceCards.length]);

    // Chart data configuration - now uses real data with simulated monthly progression
    const getMonthlyData = (finalValue: number) => {
        // Generate realistic monthly progression leading to the final value
        const months = 12;
        const data = [];
        for (let i = 0; i < months; i++) {
            // Simulate growth over the year, with some variation
            const progress = (i + 1) / months;
            const baseValue = finalValue * progress;
            const variation = finalValue * 0.1 * (Math.sin(i) * 0.5 + 0.5); // Add some realistic variation
            data.push(Math.round(baseValue + variation));
        }
        return data;
    };

    const salesData = dashboardMetrics?.totalSales?.numericValue || 9800;
    const profitData = dashboardMetrics?.totalProfit?.numericValue || 3900;
    const ordersData = dashboardMetrics?.ordersServed?.numericValue || 147;

    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Sales',
                data: getMonthlyData(salesData),
                borderColor: 'rgb(0, 0, 0)',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                tension: 0.4,
                borderWidth: 2,
            },
            {
                label: 'Profit',
                data: getMonthlyData(profitData),
                borderColor: 'rgb(64, 64, 64)',
                backgroundColor: 'rgba(64, 64, 64, 0.1)',
                tension: 0.4,
                borderWidth: 2,
            },
            {
                label: 'Orders',
                data: getMonthlyData(ordersData),
                borderColor: 'rgb(128, 128, 128)',
                backgroundColor: 'rgba(128, 128, 128, 0.1)',
                tension: 0.4,
                borderWidth: 2,
            },
        ],
    };

    // Chart options configuration
    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    padding: 15,
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif",
                    },
                },
            },
            title: {
                display: true,
                text: 'Monthly Performance Tracking',
                font: {
                    size: 18,
                    weight: 'bold',
                    family: "'Inter', sans-serif",
                },
                padding: {
                    top: 10,
                    bottom: 20,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    font: {
                        size: 11,
                    },
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 11,
                    },
                },
            },
        },
    };

    return (
        <main id={styles['container']}>
            {error && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    backgroundColor: '#fee',
                    border: '1px solid #fcc',
                    borderRadius: '4px',
                    color: '#c33'
                }}>
                    Error loading dashboard: {error}
                </div>
            )}

            <div className={styles['cards-container']}>
                <section
                    ref={topLayerRef}
                    id={styles['top-layer']}
                    aria-label="Performance metrics"
                    onScroll={checkScrollPosition}
                >
                    {loading ? (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '200px',
                            fontSize: '1.2rem',
                            color: '#666'
                        }}>
                            Loading dashboard metrics...
                        </div>
                    ) : (
                        performanceCards.map((card) => {
                            const IconComponent = card.icon;
                            return (
                                <article key={card.id} className={`${styles['brief-cards']} ${styles[card.cardClass]}`}>
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
                        })
                    )}
                </section>

                {canScrollUp && (
                    <button
                        className={`${styles['scroll-button']} ${styles['scroll-up']}`}
                        onClick={scrollUp}
                        aria-label="Scroll up to see previous cards"
                    >
                        <FaChevronUp />
                    </button>
                )}

                {canScrollDown && (
                    <button
                        className={`${styles['scroll-button']} ${styles['scroll-down']}`}
                        onClick={scrollDown}
                        aria-label="Scroll down to see more cards"
                    >
                        <FaChevronDown />
                    </button>
                )}
            </div>

            <section id={styles['graph']} aria-label="Performance chart">
                <Line data={chartData} options={chartOptions} />
            </section>
        </main>
    )
}

export default Home