import { ProductCategories } from "../../../../enums/enums";
import BaseProductForm from "./BaseProductForm";

const HomeGoodsForm = () => {
    return <BaseProductForm category={ProductCategories.HOME_GOODS} />;
};

export default HomeGoodsForm;
