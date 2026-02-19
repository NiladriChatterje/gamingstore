import { ProductCategories } from "../../../../enums/enums";
import BaseProductForm from "./BaseProductForm";
import { Store } from "../../../../declarations/AdminType";

const ClothingForm = ({ selectedStore }: { selectedStore: Store }) => {
    return <BaseProductForm category={ProductCategories.CLOTH} selectedStore={selectedStore} />;
};

export default ClothingForm;
