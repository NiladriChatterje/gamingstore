import { ProductCategories } from "@enums/enums";
import BaseProductForm from "./BaseProductForm";
import { Store } from "@declarations/AdminType";

const HomeGoodsForm = ({ selectedStore }: { selectedStore: Store }) => {
    return <BaseProductForm category={ProductCategories.HOME_GOODS} selectedStore={selectedStore} />;
};

export default HomeGoodsForm;
