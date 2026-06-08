import { ProductCategories } from "@enums/enums";
import BaseProductForm from "./BaseProductForm";
import { Store } from "@declarations/AdminType";

const GroceriesForm = ({ selectedStore }: { selectedStore: Store }) => {
    return <BaseProductForm category={ProductCategories.GROCERIES} selectedStore={selectedStore} />;
};

export default GroceriesForm;
