import styles from './PaymentLoader.module.css';

const PaymentLoader = () => {
  return (
    <div className={styles["lds-grid"]}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}

export default PaymentLoader
