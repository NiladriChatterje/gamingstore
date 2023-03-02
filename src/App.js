import './App.css';
import React from 'react'
import { Navbar, Body, About, Products,OrderListItem,Details } from './component/components';
import {Routes,Route} from 'react-router-dom';
import { StateContext } from './StateContext';

function App() {
  
  
  return (
    <div className="App">
      <StateContext>
      <OrderListItem />
      <Navbar />
      <Routes>
        <Route path={'/'} element={<Body />} />
        <Route path={'/About'} element={<About />} />
        <Route path={'/Product'} element={<Products />} />
        <Route path={'/Product/Details/:id'} element={<Details />} />
      </Routes>
      </StateContext>      
    </div>
  );
}

export default App;
