import { ProductCategories } from "../../../../enums/enums";
import BaseProductForm from "./BaseProductForm";

const ToysForm = () => {
    return <BaseProductForm category={ProductCategories.TOYS} />;
};

export default ToysForm;
