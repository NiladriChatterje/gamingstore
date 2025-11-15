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
import { useAdminStateContext } from '../AdminStateContext';

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
    const { isSignedIn } = useUser();
    const { getToken } = useAuth();
    const topLayerRef = useRef<HTMLElement>(null);
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(false);
    const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const {
        admin,
        fromDate,
        setFromDate,
        toDate,
        setToDate,
        fetchFilteredStatistics
    } = useAdminStateContext();

    if (!isSignedIn)
        <Navigate to={'/user'} />

    // Handle date change and fetch filtered data
    const handleDateChange = async (type: 'from' | 'to', date: Date | null) => {
        if (type === 'from') {
            setFromDate?.(date);
        } else {
            setToDate?.(date);
        }

        // Fetch filtered statistics when both dates are available
        const updatedFromDate = type === 'from' ? date : fromDate;
        const updatedToDate = type === 'to' ? date : toDate;

        if (updatedFromDate && updatedToDate) {
            // Use a small delay to ensure state is updated
            setTimeout(() => {
                fetchDashboardMetrics(true);
            }, 100);
        }
    };

    // Format date for input field
    const formatDateForInput = (date: Date | null): string => {
        if (!date) return '';
        return date.toISOString().split('T')[0];
    };

    // Fetch dashboard metrics from backend
    const fetchDashboardMetrics = async (useCurrentDateFilter = false) => {
        try {
            setLoading(true);
            setError(null);

            if (!admin?._id) {
                throw new Error('User ID not available');
            }

            const token = await getToken();

            // Build URL with date parameters if filtering is requested and dates are available
            let url = `http://localhost:5003/${admin._id}/dashboard-metrics`;
            if (useCurrentDateFilter && fromDate && toDate) {
                const fromDateISO = fromDate.toISOString();
                const toDateISO = toDate.toISOString();
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
    };

    // Effect to fetch data on component mount
    useEffect(() => {
        if (isSignedIn && admin?._id) {
            fetchDashboardMetrics();
        }
    }, [isSignedIn, admin?._id]);

    // Effect to trigger chart re-render when date range or metrics change
    useEffect(() => {
        // This effect ensures the chart updates when fromDate, toDate, or dashboardMetrics change
        // The chart data generation function will be called automatically due to React's re-rendering
    }, [fromDate, toDate, dashboardMetrics]);

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

    // Generate date labels and data based on selected date range
    const generateDateRangeData = () => {
        const startDate = fromDate || new Date(new Date().getFullYear(), 0, 1); // Default to start of current year
        const endDate = toDate || new Date(); // Default to current date

        const labels: string[] = [];
        const salesData: number[] = [];
        const profitData: number[] = [];
        const ordersData: number[] = [];

        // Calculate the time difference and determine appropriate interval
        const timeDiff = endDate.getTime() - startDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        let interval: 'day' | 'week' | 'month' = 'day';
        let intervalDays = 1;

        // Determine appropriate interval based on date range
        if (daysDiff > 365) {
            interval = 'month';
            intervalDays = 30;
        } else if (daysDiff > 60) {
            interval = 'week';
            intervalDays = 7;
        } else {
            interval = 'day';
            intervalDays = 1;
        }

        // Generate data points for the selected time range
        const currentDate = new Date(startDate);
        const finalSalesValue = dashboardMetrics?.totalSales?.numericValue || 9800;
        const finalProfitValue = dashboardMetrics?.totalProfit?.numericValue || 3900;
        const finalOrdersValue = dashboardMetrics?.ordersServed?.numericValue || 147;

        let dataPointIndex = 0;

        while (currentDate <= endDate) {
            // Format label based on interval
            let label = '';
            if (interval === 'day') {
                label = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else if (interval === 'week') {
                const weekEnd = new Date(currentDate);
                weekEnd.setDate(weekEnd.getDate() + 6);
                label = `${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
            } else {
                label = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }

            labels.push(label);

            // Calculate progress through the time range
            const totalDuration = endDate.getTime() - startDate.getTime();
            const currentProgress = (currentDate.getTime() - startDate.getTime()) / totalDuration;

            // Generate realistic data progression with some variation
            const baseVariation = 0.15; // 15% variation
            const randomFactor = (Math.sin(dataPointIndex * 0.5) * 0.5 + 0.5) * baseVariation + (1 - baseVariation);

            // Calculate values with progressive growth and variation
            const salesValue = Math.round(finalSalesValue * currentProgress * randomFactor);
            const profitValue = Math.round(finalProfitValue * currentProgress * randomFactor);
            const ordersValue = Math.round(finalOrdersValue * currentProgress * randomFactor);

            salesData.push(Math.max(0, salesValue));
            profitData.push(Math.max(0, profitValue));
            ordersData.push(Math.max(0, ordersValue));

            // Move to next interval
            if (interval === 'month') {
                currentDate.setMonth(currentDate.getMonth() + 1);
            } else {
                currentDate.setDate(currentDate.getDate() + intervalDays);
            }

            dataPointIndex++;
        }

        return { labels, salesData, profitData, ordersData };
    };

    const { labels: chartLabels, salesData: chartSalesData, profitData: chartProfitData, ordersData: chartOrdersData } = generateDateRangeData();

    const chartData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Sales ($)',
                data: chartSalesData,
                borderColor: 'rgb(25, 118, 210)',
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                tension: 0.4,
                borderWidth: 2,
                fill: false,
            },
            {
                label: 'Profit ($)',
                data: chartProfitData,
                borderColor: 'rgb(56, 142, 60)',
                backgroundColor: 'rgba(56, 142, 60, 0.1)',
                tension: 0.4,
                borderWidth: 2,
                fill: false,
            },
            {
                label: 'Orders',
                data: chartOrdersData,
                borderColor: 'rgb(194, 24, 91)',
                backgroundColor: 'rgba(194, 24, 91, 0.1)',
                tension: 0.4,
                borderWidth: 2,
                fill: false,
                yAxisID: 'y1',
            },
        ],
    };

    // Generate chart title based on date range
    const getChartTitle = () => {
        if (fromDate && toDate) {
            const startDateStr = fromDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            const endDateStr = toDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            return `Performance Tracking: ${startDateStr} - ${endDateStr}`;
        }
        return 'Performance Tracking Over Time';
    };

    // Chart options configuration with dual y-axis
    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    padding: 15,
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif",
                    },
                    usePointStyle: true,
                },
            },
            title: {
                display: true,
                text: getChartTitle(),
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
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            if (context.dataset.label === 'Orders') {
                                label += context.parsed.y.toLocaleString();
                            } else {
                                label += '$' + context.parsed.y.toLocaleString();
                            }
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                display: true,
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 10,
                    },
                    maxRotation: 45,
                    minRotation: 0,
                },
            },
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    font: {
                        size: 11,
                    },
                    callback: function (value) {
                        return '$' + Number(value).toLocaleString();
                    }
                },
                title: {
                    display: true,
                    text: 'Sales & Profit ($)',
                    font: {
                        size: 12,
                        weight: 'bold',
                    }
                }
            },
            y1: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                beginAtZero: true,
                grid: {
                    drawOnChartArea: false,
                },
                ticks: {
                    font: {
                        size: 11,
                    },
                    callback: function (value) {
                        return Number(value).toLocaleString();
                    }
                },
                title: {
                    display: true,
                    text: 'Orders',
                    font: {
                        size: 12,
                        weight: 'bold',
                    }
                }
            },
        },
    };

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