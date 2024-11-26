import styles from './Home.module.css';

const Home = () => {
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