import { ProductCategories } from "../../../enums/enums";
import styles from "./AddProduct.module.css";

interface CategoryGridProps {
    onSelect: (category: string) => void;
}

const CategoryGrid = ({ onSelect }: CategoryGridProps) => {
    // Filter out 'all' as it is likely for search/filter, not adding.
    const categories = Object.values(ProductCategories).filter(
        (c) => c !== ProductCategories.ALL
    );

    // Optional: Map for display names if needed, otherwise use the enum value
    // The enum values are like "clothing", "food", "gadgets". They are readable.

    return (
        <div className={styles["category-grid"]}>
            {categories.map((category) => (
                <div
                    key={category}
                    className={styles["category-box"]}
                    onClick={() => onSelect(category)}
                >
                    {category.toUpperCase()}
                </div>
            ))}
        </div>
    );
};

export default CategoryGrid;
