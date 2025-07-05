import React, {
  useContext,
  createContext,
  useState,
  useRef,
  ReactNode,
} from "react";
import {
  ProductContextType,
} from "@declarations/UserStateContextType";
import { ProductType } from "@/declarations/ProductContextType";
import { UserType } from "@/declarations/UserType";


const ProductContext = createContext<Partial<ProductContextType>>({});

export const UserStateContext = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserType>();
  const [_, setRefreshApp] = useState<boolean>(() => false);
  const [lastRoute, setLastRoute] = useState<string>(
    () => localStorage.getItem("last-route") || ""
  );
  const [qty, setQty] = useState(() => 1);

  const [totalPrice, setTotalPrice] = useState<number>(
    Number(localStorage.getItem("totalPrice")) || 0
  );
  const [cartData, setCartData] = useState<ProductType[]>(
    () =>
      (JSON.parse(localStorage.getItem("orders") as string) as ProductType[]) ||
      ([] as ProductType[])
  );
  const [slide, setSlide] = useState<boolean>(false);
  const [isOneItem, setIsOneItem] = useState<boolean>(
    localStorage.getItem("isOneItem") === "false" ? false : true
  );
  const [singleProductDetail, setSingleProductDetail] = useState<ProductType | undefined>(JSON.parse(localStorage.getItem("oneProduct") ?? '{}' as string));

  const navRef = useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const localTotalPrice = cartData?.reduce(
      (acc: number, cur: ProductType) => acc + cur.price.pdtPrice * cur.quantity,
      0
    );
    setTotalPrice(localTotalPrice);
    localStorage.setItem("totalPrice", totalPrice.toString());
    localStorage.setItem("orders", JSON.stringify(cartData));
  }, [cartData]);

  function addItemToCart(item: ProductType) {
    let addToCart = cartData?.find((i) => i._id === item._id);
    if (addToCart !== undefined) {
      let x = addToCart?.quantity;
      x += 1;
      if (item._id) incDecQty(x, item._id);
    }

    if (addToCart === undefined) setCartData([...cartData, { ...item, quantity: 1 }]);
  }

  function incDecQty(counter: number, id: string) {
    let foundItem: ProductType | undefined = cartData?.find((i) => i._id === id);
    if (foundItem)
      foundItem.quantity = counter;
    setRefreshApp(prev => !prev);
  }

  return (
    <ProductContext.Provider
      value={{
        userData,
        setUserData,
        lastRoute,
        setLastRoute,
        navRef,
        totalPrice,
        setTotalPrice,
        cartData,
        setSlide,
        slide,
        setCartData,
        isOneItem,
        setIsOneItem,
        qty,
        setQty,
        incDecQty,
        addItemToCart,
        singleProductDetail,
        setSingleProductDetail
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useUserStateContext = () => useContext(ProductContext);
