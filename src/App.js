import './App.css';
import React, { useEffect, useState } from 'react';
import { Navbar, Body, About, Products, OrderListItem, Details, PaymentPortal } from './component/components';
import Payment from './StripePayment/Payment';
import Completion from './StripePayment/Completion'
import { Routes, Route } from 'react-router-dom';
import PreLoader from './PreLoader';
import { StateContext } from './StateContext';

function App() {
  const [loading, setLoading] = useState(() => true);
  useEffect(() => { setTimeout(() => setLoading(false), 3000) }, []);

  return (
    <div className="App">
      {loading ? <PreLoader /> : <StateContext>
        <OrderListItem />
        <Navbar />
        <Routes>
          <Route path={'/'} element={<Body />} />
          <Route path={'/Payment'} element={<PaymentPortal />} />
          <Route path={'/About'} element={<About />} />
          <Route path={'/Product'} element={<Products />} />
          <Route path={'/Product/Details/:id'} element={<Details />} />
          <Route path={'/Checkout'} element={<Payment />} />
          <Route path={'/completion'} element={<Completion />} />
        </Routes>
      </StateContext>}
    </div>
  );
}

export default App;
