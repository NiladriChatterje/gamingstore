import { useState } from "react";
import styles from "./AddProduct.module.css";
import { ProductCategories } from "../../../enums/enums";
import CategoryGrid from "./CategoryGrid";
import ClothingForm from "./Forms/ClothingForm";
import FoodForm from "./Forms/FoodForm";
import GadgetsForm from "./Forms/GadgetsForm";
import GroceriesForm from "./Forms/GroceriesForm";
import HomeGoodsForm from "./Forms/HomeGoodsForm";
import ToysForm from "./Forms/ToysForm";
import { IoIosArrowBack } from "react-icons/io";

const AddProduct = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const renderForm = () => {
    switch (selectedCategory) {
      case ProductCategories.CLOTH:
        return <ClothingForm />;
      case ProductCategories.FOOD:
        return <FoodForm />;
      case ProductCategories.GADGETS:
        return <GadgetsForm />;
      case ProductCategories.GROCERIES:
        return <GroceriesForm />;
      case ProductCategories.HOME_GOODS:
        return <HomeGoodsForm />;
      case ProductCategories.TOYS:
        return <ToysForm />;
      default:
        return null;
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {!selectedCategory ? (
        <CategoryGrid onSelect={setSelectedCategory} />
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
