import { useState } from "react";
import styles from "./AddProduct.module.css";
import { ProductCategories } from "../../../enums/enums";
import CategoryGrid from "./CategoryGrid";
import StoreGrid from "./StoreGrid";
import ClothingForm from "./Forms/ClothingForm";
import FoodForm from "./Forms/FoodForm";
import GadgetsForm from "./Forms/GadgetsForm";
import GroceriesForm from "./Forms/GroceriesForm";
import HomeGoodsForm from "./Forms/HomeGoodsForm";
import ToysForm from "./Forms/ToysForm";
import { IoIosArrowBack } from "react-icons/io";
import { useAdminStateContext } from "../AdminStateContext";
import { Store } from "@/declarations/AdminType";

const AddProduct = () => {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { admin } = useAdminStateContext();

  const renderForm = () => {
    if (!selectedStore) return null;
    switch (selectedCategory) {
      case ProductCategories.CLOTH:
        return <ClothingForm selectedStore={selectedStore} />;
      case ProductCategories.FOOD:
        return <FoodForm selectedStore={selectedStore} />;
      case ProductCategories.GADGETS:
        return <GadgetsForm selectedStore={selectedStore} />;
      case ProductCategories.GROCERIES:
        return <GroceriesForm selectedStore={selectedStore} />;
      case ProductCategories.HOME_GOODS:
        return <HomeGoodsForm selectedStore={selectedStore} />;
      case ProductCategories.TOYS:
        return <ToysForm selectedStore={selectedStore} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {!selectedStore ? (
        admin && <StoreGrid admin={admin} onSelect={setSelectedStore} />
      ) : !selectedCategory ? (
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
          <div
            className={styles["back-button-container"]}
            onClick={() => setSelectedStore(null)}
            style={{
              padding: '10px 20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#4a5568',
              fontWeight: 600,
              marginBottom: '10px'
            }}
          >
            <IoIosArrowBack size={20} /> <span>Back to Store Selection</span>
          </div>
          <CategoryGrid onSelect={setSelectedCategory} />
        </div>
      ) : (
        <div style={{ animation: 'fadeIn 0.3s ease-in-out', height: '100%' }}>
          <div
            className={styles["back-button-container"]}
            onClick={() => setSelectedCategory(null)}
            style={{
              padding: '10px 20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#4a5568',
              fontWeight: 600,
              marginBottom: '10px'
            }}
          >
            <IoIosArrowBack size={20} /> <span>Back to Categories</span>
          </div>
          {renderForm()}
        </div>
      )}
    </div>
  );
};

export default AddProduct;
