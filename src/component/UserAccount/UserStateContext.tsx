import React, { useContext, createContext, useState, useRef, ReactNode } from 'react';
import { ProductType, ProductContextType } from '@declarations/UserStateContextType';


const ProductContext = createContext<Partial<ProductContextType>>({});

export const UserStateContext = ({ children }: { children: ReactNode }) => {
    const [lastRoute, setLastRoute] = useState<string>(() => localStorage.getItem('last-route') || "")
    const [qty, setQty] = useState(() => 1);
    const [ItemIDCount, setItemIDCount] = useState<object & { id?: number }>(() => { });
    const [totalPrice, setTotalPrice] = useState<number>(Number(localStorage.getItem('totalPrice')) || 0);
    const [data, setData] = useState<ProductType[]>(() => JSON.parse(localStorage.getItem('orders') as string) as ProductType[] || [] as ProductType[]);
    const [slide, setSlide] = useState<boolean>(false);
    const [oneItem, setOneItem] = useState<boolean>((localStorage.getItem("isOneItem")) === 'false' ? false : true);

    const navRef = useRef<HTMLElement | null>(null);

    React.useEffect(() => {
        let x = data?.reduce((acc: number, cur: ProductType) => acc + cur.price * cur.quantity, 0)
        setTotalPrice(x);
        localStorage.setItem('totalPrice', totalPrice.toString());
        localStorage.setItem('orders', JSON.stringify(data));

    }, [data]);

    function addItemToOrderList(item: ProductType) {
        let DataFound = data?.find(i => i._id === item._id)
        if (DataFound !== undefined) {
            let x = DataFound?.quantity;
            x += 1;
            incDecQty(x, item._id);
        }

        if (DataFound === undefined) setData([...data, { ...item, quantity: 1 }]);
    }


    function incDecQty(counter: number, id: number | string) {
        let foundItem: ProductType | any = data?.find((i) => i._id === id);
        let foundItemIndex: number = data?.findIndex(i => i._id === id);

        data?.splice(foundItemIndex, 1, { ...foundItem, count: counter });
        setData([...data]);
    }

    return (<ProductContext.Provider
        value={
            {
                lastRoute,
                setLastRoute,
                navRef,
                totalPrice,
                setTotalPrice,
                data,
                setSlide,
                slide,
                setData,
                oneItem,
                setOneItem,
                qty,
                setQty,
                ItemIDCount,
                setItemIDCount,
                incDecQty,
                addItemToOrderList,
            }
        }>
        {children}
    </ProductContext.Provider>)
}

export const useUserStateContext = () => useContext(ProductContext);
