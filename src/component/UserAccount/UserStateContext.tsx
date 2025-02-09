import React, { useContext, createContext, useState, useRef, ReactNode } from 'react';
import { OrderType, ProductContextType } from '@declarations/UserStateContextType';


const ProductContext = createContext<Partial<ProductContextType>>({});

export const UserStateContext = ({ children }: { children: ReactNode }) => {
    const [lastRoute, setLastRoute] = useState<string>(() => localStorage.getItem('last-route') || "")
    const [qty, setQty] = useState(() => 1);
    const [ItemIDCount, setItemIDCount] = useState<object & { id?: number }>(() => { });
    const [totalPrice, setTotalPrice] = useState<number>(Number(localStorage.getItem('totalPrice')) || 0);
    const [data, setData] = useState<OrderType[]>(() => JSON.parse(localStorage.getItem('orders') as string) || [] as OrderType[]);
    const [slide, setSlide] = useState<boolean>(false);
    const [oneItem, setOneItem] = useState<boolean>((localStorage.getItem("isOneItem")) === 'false' ? false : true);

    const navRef = useRef<HTMLElement | null>(null);

    React.useEffect(() => {
        let x = data?.reduce((acc: number, cur: OrderType) => acc + cur.price * cur.count, 0)
        setTotalPrice(x);
        localStorage.setItem('totalPrice', totalPrice.toString());
        localStorage.setItem('orders', JSON.stringify(data));

    }, [data]);

    function addItemToOrderList(item: OrderType) {
        let DataFound = data?.find(i => i.id === item.id)
        if (DataFound !== undefined) {
            let x = DataFound?.count;
            x += 1;
            incDecQty(x, item.id);
        }

        if (DataFound === undefined) setData([...data, { ...item, count: 1 }]);
    }


    function incDecQty(counter: number, id: number | string) {
        let foundItem: OrderType | any = data?.find((i) => i.id === id);
        let foundItemIndex: number = data?.findIndex(i => i.id === id);

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
