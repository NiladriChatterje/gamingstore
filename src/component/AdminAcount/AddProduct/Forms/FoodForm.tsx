import { ProductCategories } from "../../../../enums/enums";
import BaseProductForm from "./BaseProductForm";

const FoodForm = () => {
    return <BaseProductForm category={ProductCategories.FOOD} />;
};

export default FoodForm;
