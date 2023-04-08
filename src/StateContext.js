import React, { useContext, createContext, useState, useRef } from 'react';

const ProductContext = createContext(null);
export const StateContext = ({ children }) => {

    const [qty, setQty] = useState(() => 1);
    const [ItemIDCount, setItemIDCount] = useState(() => { });
    const [totalPrice, setTotalPrice] = useState(localStorage.getItem('totalPrice') || 0);
    const [data, setData] = useState(() => JSON.parse(localStorage.getItem('orders')) || []);

    const oneItem = useRef(localStorage.getItem('oneItem') || false);
    const navRef = useRef(null);

    React.useEffect(() => {
        let x = data?.reduce((acc, cur) => acc + cur.price * cur.count, 0)
        setTotalPrice(x);
        localStorage.setItem('totalPrice', totalPrice);
        localStorage.setItem('orders', JSON.stringify(data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    function addItemToOrderList(item) {
        let DataFound = data?.find(i => i.id === item.id)
        if (DataFound !== undefined) {
            let x = DataFound?.count;
            x += 1;
            incDecQty(x, item.id);
        }

        if (DataFound === undefined) setData([...data, { ...item, count: 1 }]);
    }


    function incDecQty(counter, id) {
        let foundItem = data?.find((i) => i.id === id);
        let foundItemIndex = data?.findIndex(i => i.id === id);

        data?.splice(foundItemIndex, 1, { ...foundItem, count: counter });
        setData([...data]);
    }

    return <ProductContext.Provider
        value={{
            navRef,
            totalPrice,
            setTotalPrice,
            data,
            setData,
            oneItem,
            qty,
            setQty,
            ItemIDCount,
            setItemIDCount,
            incDecQty,
            addItemToOrderList,
        }}>
        {children}
    </ProductContext.Provider>
}

export const useStateContext = () => useContext(ProductContext);
