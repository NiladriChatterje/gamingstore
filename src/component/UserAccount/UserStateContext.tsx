import React, {
  useContext,
  createContext,
  useState,
  useRef,
  ReactNode,
  useCallback,
} from "react";
import {
  ProductContextType,
} from "@declarations/UserStateContextType";
import { ProductType } from "@/declarations/ProductContextType";
import { UserType } from "@/declarations/UserType";
import toast from "react-hot-toast";
import { useAuth, useUser } from "@clerk/clerk-react";


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
      (JSON.parse(localStorage.getItem("cart") as string) as ProductType[]) ||
      ([] as ProductType[])
  );
  const [slide, setSlide] = useState<boolean>(false);
  const [isOneItem, setIsOneItem] = useState<boolean>(
    localStorage.getItem("isOneItem") === "false" ? false : true
  );
  const [singleProductDetail, setSingleProductDetail] = useState<ProductType | undefined>();


  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const navRef = useRef<HTMLElement | null>(null);
  const handleStorage = () => {
    setCartData((JSON.parse(localStorage.getItem("cart") as string) as ProductType[]))
  }
  const useHandleStorage = useCallback(handleStorage, []);
  React.useEffect(() => {
    window.addEventListener('storage', useHandleStorage);
  }, []);
  React.useEffect(() => {
    const localTotalPrice = cartData?.reduce(
      (acc: number, cur: ProductType) => acc + cur.price.pdtPrice * (cur.quantity ?? 0),
      0
    );
    setTotalPrice(localTotalPrice);
    localStorage.setItem("totalPrice", totalPrice.toString());
    localStorage.setItem("cart", JSON.stringify(cartData));
  }, [cartData]);


  function addItemToCart(item: ProductType) {
    let addToCart = cartData?.find((i) => i._id === item._id);
    if (addToCart !== undefined) {
      toast("Item already in the cart!");
      return;
    }
    toast("Item added to Cart 🛒");
    if (addToCart === undefined) {
      const newCartData = [...cartData, { ...item, quantity: 1 }]
      localStorage.setItem('cart', JSON.stringify(newCartData));
      setCartData(newCartData)
    };
  }

  function incDecQty(counter: number, id: string) {
    let foundItem: ProductType | undefined = cartData?.find((i) => i._id === id);
    if (foundItem)
      foundItem.quantity = counter;
    localStorage.setItem('cart', JSON.stringify(cartData));
    setRefreshApp(prev => !prev)
  }

  const syncCartProductWithLocal = useCallback(async function syncCartProductWithLocal() {
    if (isSignedIn) {
      const token = await getToken();
      const response = await fetch(`http://localhost:5002/fetch-user-cart/${userData?._id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const cartProducts: ProductType = await response.json();
      const tempCart = [];
      for (const element of cartData)
        if (element._id != cartProducts._id)
          tempCart.push(element);

      if (tempCart.length > 0)
        setCartData([...cartData, ...tempCart]);


    }
  }, [])
  React.useEffect(() => {
    syncCartProductWithLocal();
  }, [])
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
        setRefreshApp,
        singleProductDetail,
        setSingleProductDetail
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useUserStateContext = () => useContext(ProductContext);
