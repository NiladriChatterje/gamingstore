import React,{useContext,createContext,useState,useEffect} from 'react';

const ProductContext = createContext(null);
export const StateContext =({children})=>{

    const [slide,setSlide] = useState(()=>false);
    const [qty,setQty]=useState(()=>1);
    const [toogleAddToCart,setToogleAddToCart]=useState(()=>false);
    const [ItemIDCount,setItemIDCount] = useState(()=>{});
    const [totalPrice,setTotalPrice]=useState(()=>localStorage.getItem('totalPrice')||0);
    const [data,setData] = useState(()=>JSON.parse(localStorage.getItem('orders'))||[]);

    
    useEffect(()=>{
        let x = data?.reduce((acc,cur)=>acc+cur.price*cur.count,0)
        setTotalPrice(x);
        localStorage.setItem('totalPrice',totalPrice);
        localStorage.setItem('orders',JSON.stringify(data));
        console.log(data);
      },[data]);

   
    
    function addItemToOrderList(item){
        let DataFound=data?.find(i=>i.id===item.id)
        if(DataFound!==undefined){
            let x=DataFound?.count;
            x += 1;
            incDecQty(x,item.id)
        }
          
        if(DataFound===undefined) setData([...data,{...item,count:1}]);
    }
       

    function incDecQty(counter,id){
        let foundItem=data?.find((i)=>i.id===id);
        let foundItemIndex=data?.findIndex(i=>i.id===id)
        
        data?.splice(foundItemIndex,1,{...foundItem,count:counter});
        setData([...data])
          
    }

    return <ProductContext.Provider
        value={{
            totalPrice,
            data,
            setData,
            qty,
            toogleAddToCart,
            setToogleAddToCart,
            setQty,
            slide,
            ItemIDCount,
            setItemIDCount,
            setSlide,
            incDecQty,
            addItemToOrderList,
            }}>
        {children}
    </ProductContext.Provider>
}

export const useStateContext=()=>useContext(ProductContext);
