import './App.css';
import React from 'react'
import Navbar from './component/Navbar/Navbar';
import Body from './component/Body/Body';
import About from './component/About/About';
import Products from './component/Products/Products';
import {Routes,Route} from 'react-router-dom'
import {createContext} from 'react';

export const ProductContext = createContext(null);

function App() {
  const [data,setData] = React.useState(()=>JSON.parse(localStorage.getItem('orders'))||[]);

  return (
    <div className="App">
      <ProductContext.Provider
        value={{data,setData}}>
      <Navbar />
      <Routes>
        <Route path={'/'} element={<Body />} />
        <Route path={'/About'} element={<About />} />
        <Route path={'/Product'} element={<Products />} />
        
      </Routes>

      </ProductContext.Provider>      
    </div>
  );
}

export default App;
