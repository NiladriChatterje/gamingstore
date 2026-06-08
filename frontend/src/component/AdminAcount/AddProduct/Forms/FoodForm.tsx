import { ProductCategories } from "@enums/enums";
import BaseProductForm from "./BaseProductForm";
import { Store } from "../../../../declarations/AdminType";

const FoodForm = ({ selectedStore }: { selectedStore: Store }) => {
    return <BaseProductForm category={ProductCategories.FOOD} selectedStore={selectedStore} />;
};

export default FoodForm;
