import { ProductCategories } from "@enums/enums";
import BaseProductForm from "./BaseProductForm";
import { Store } from "@declarations/AdminType";

const ToysForm = ({ selectedStore }: { selectedStore: Store }) => {
    return <BaseProductForm category={ProductCategories.TOYS} selectedStore={selectedStore} />;
};

export default ToysForm;
