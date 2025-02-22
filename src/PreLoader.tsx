import styles from './PreLoader.module.css';

export default function PreLoader() {
    return   (
    <div className={styles['loader-container']}>
    <div className={styles["loader"]}>
    <div className={styles["loaders"]}></div>
    <div className={styles["loaders"]}></div>
    <div className={styles["loaders"]}></div>
    <div className={styles["loaders"]}></div>
    <div className={styles["loaders"]}></div>
    <div className={styles["loaders"]}></div>
    <div className={styles["loaders"]}></div>
    <div className={styles["loaders"]}></div>
</div>
</div>)
}