import { ProductCategories } from "../../../enums/enums";
import styles from "./AddProduct.module.css";
import { FaTshirt, FaUtensils, FaLaptop, FaShoppingBasket, FaHome, FaPuzzlePiece } from "react-icons/fa";

interface CategoryGridProps {
    onSelect: (category: string) => void;
}

interface CategoryInfo {
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    bgColor: string;
}

const ICON_COLOR = "#64748b";
const ICON_BG = "#f1f5f9";

const categoryMap: Record<string, CategoryInfo> = {
    [ProductCategories.CLOTH]: {
        label: "Clothing",
        icon: FaTshirt,
        color: ICON_COLOR,
        bgColor: ICON_BG,
    },
    [ProductCategories.FOOD]: {
        label: "Food",
        icon: FaUtensils,
        color: ICON_COLOR,
        bgColor: ICON_BG,
    },
    [ProductCategories.GADGETS]: {
        label: "Gadgets",
        icon: FaLaptop,
        color: ICON_COLOR,
        bgColor: ICON_BG,
    },
    [ProductCategories.GROCERIES]: {
        label: "Groceries",
        icon: FaShoppingBasket,
        color: ICON_COLOR,
        bgColor: ICON_BG,
    },
    [ProductCategories.HOME_GOODS]: {
        label: "Home Goods",
        icon: FaHome,
        color: ICON_COLOR,
        bgColor: ICON_BG,
    },
    [ProductCategories.TOYS]: {
        label: "Toys",
        icon: FaPuzzlePiece,
        color: ICON_COLOR,
        bgColor: ICON_BG,
    },
};

const CategoryGrid = ({ onSelect }: CategoryGridProps) => {
    const categories = Object.values(ProductCategories).filter(
        (c) => c !== ProductCategories.ALL
    );

    return (
        <div className={styles["category-grid"]}>
            {categories.map((category) => {
                const info = categoryMap[category];
                if (!info) return null;
                const IconComponent = info.icon;
                return (
                    <div
                        key={category}
                        className={styles["category-card"]}
                        onClick={() => onSelect(category)}
                    >
                        <div
                            className={styles["category-icon-wrap"]}
                            style={{ backgroundColor: info.bgColor, color: info.color }}
                        >
                            <IconComponent size={28} />
                        </div>
                        <span className={styles["category-name"]}>{info.label}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default CategoryGrid;
