import { ProductCategories } from "../../../../enums/enums";
import BaseProductForm from "./BaseProductForm";

const ClothingForm = () => {
    return <BaseProductForm category={ProductCategories.CLOTH} />;
};

export default ClothingForm;
