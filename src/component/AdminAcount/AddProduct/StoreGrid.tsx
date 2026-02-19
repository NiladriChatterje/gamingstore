import { FaStore } from "react-icons/fa6";
import styles from "./AddProduct.module.css";
import { AdminFieldsType } from "../../../declarations/AdminType";

interface StoreGridProps {
    admin: AdminFieldsType;
    onSelect: (store: AdminFieldsType) => void;
}

const StoreGrid = ({ admin, onSelect }: StoreGridProps) => {
    // For now, we only have the primary store from the admin account.
    // In a multi-store setup, this would be an array of stores fetched from the backend.
    const stores = [admin];

    const truncateAddress = (address: string, limit: number) => {
        if (address.length <= limit) return address;
        return address.slice(0, limit) + "...";
    };

    return (
        <div className={styles["store-grid-container"]}>
            <h2 className={styles["grid-title"]}>Select Your Store</h2>
            <div className={styles["store-grid"]}>
                {stores.map((store) => (
                    <div
                        key={store._id}
                        className={styles["store-card"]}
                        onClick={() => onSelect(store)}
                    >
                        <div className={styles["store-icon-container"]}>
                            <FaStore size={28} />
                        </div>
                        <div className={styles["store-info"]}>
                            <h3 className={styles["store-county"]}>{store.address.county}</h3>
                            <p className={styles["store-pincode"]}>PIN: {store.address.pincode}</p>
                            <p className={styles["store-address"]}>
                                {truncateAddress(`${store.address.county}, ${store.address.state}, ${store.address.country}`, 40)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StoreGrid;
