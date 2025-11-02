import { Navigate } from 'react-router-dom';
import styles from './Home.module.css';
import { useUser } from '@clerk/clerk-react';
import { Line } from 'react-chartjs-2';
import { FaDollarSign, FaChartLine, FaShoppingCart, FaArrowUp } from 'react-icons/fa';
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

const Home = () => {
    const { isSignedIn } = useUser();

    if (!isSignedIn)
        <Navigate to={'/user'} />

    // Chart data configuration
    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Sales',
                data: [3000, 4500, 3800, 5200, 4800, 6100, 7200, 6800, 7500, 8200, 9100, 9800],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
            },
            {
                label: 'Profit',
                data: [1200, 1800, 1500, 2100, 1900, 2400, 2900, 2700, 3000, 3300, 3600, 3900],
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                tension: 0.4,
            },
            {
                label: 'Orders',
                data: [45, 67, 58, 78, 72, 91, 108, 102, 112, 123, 136, 147],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.4,
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
            <section id={styles['top-layer']} aria-label="Performance metrics">
                <article className={`${styles['brief-cards']} ${styles['sales-card']}`}>
                    <header className={styles['card-header']}>
                        <div className={styles['icon-wrapper']} style={{ backgroundColor: '#e3f2fd' }} aria-hidden="true">
                            <FaDollarSign className={styles['card-icon']} style={{ color: '#1976d2' }} />
                        </div>
                        <span className={styles['card-label']}>Total Sales</span>
                    </header>
                    <h2 className={styles['card-value']}>$9,800</h2>
                    <aside className={styles['card-trend']}>
                        <FaArrowUp className={styles['trend-icon']} aria-hidden="true" />
                        <span>+7.6% from last month</span>
                    </aside>
                </article>

                <article className={`${styles['brief-cards']} ${styles['profit-card']}`}>
                    <header className={styles['card-header']}>
                        <div className={styles['icon-wrapper']} style={{ backgroundColor: '#e8f5e9' }} aria-hidden="true">
                            <FaChartLine className={styles['card-icon']} style={{ color: '#388e3c' }} />
                        </div>
                        <span className={styles['card-label']}>Total Profit</span>
                    </header>
                    <h2 className={styles['card-value']}>$3,900</h2>
                    <aside className={styles['card-trend']}>
                        <FaArrowUp className={styles['trend-icon']} aria-hidden="true" />
                        <span>+8.3% from last month</span>
                    </aside>
                </article>

                <article className={`${styles['brief-cards']} ${styles['orders-card']}`}>
                    <header className={styles['card-header']}>
                        <div className={styles['icon-wrapper']} style={{ backgroundColor: '#fce4ec' }} aria-hidden="true">
                            <FaShoppingCart className={styles['card-icon']} style={{ color: '#c2185b' }} />
                        </div>
                        <span className={styles['card-label']}>Orders Served</span>
                    </header>
                    <h2 className={styles['card-value']}>147</h2>
                    <aside className={styles['card-trend']}>
                        <FaArrowUp className={styles['trend-icon']} aria-hidden="true" />
                        <span>+8.1% from last month</span>
                    </aside>
                </article>
            </section>

            <section id={styles['graph']} aria-label="Performance chart">
                <Line data={chartData} options={chartOptions} />
            </section>
        </main>
    )
}

export default Home