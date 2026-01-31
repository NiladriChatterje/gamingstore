import { ProductCategories } from "../../../../enums/enums";
import BaseProductForm from "./BaseProductForm";

const GroceriesForm = () => {
    return <BaseProductForm category={ProductCategories.GROCERIES} />;
};

export default GroceriesForm;
