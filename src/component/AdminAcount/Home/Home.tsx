import { Navigate } from 'react-router-dom';
import styles from './Home.module.css';
import { useUser } from '@clerk/clerk-react';

const Home = () => {
    const { isSignedIn } = useUser();

    if (!isSignedIn)
        <Navigate to={'/user'} />

    return (
        <div id={styles['container']}>
            <section id={styles['top-layer']}>
                <div className={styles['brief-cards']}>Sales</div>
                <div className={styles['brief-cards']}>Profit</div>
                <div className={styles['brief-cards']}>Orders served</div>
            </section>
            <section id={styles['graph']}>
                Graph
            </section>
        </div>
    )
}

export default Home