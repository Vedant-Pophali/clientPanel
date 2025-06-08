import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import MenuBar from './components/MenuBar/MenuBar';
import Home from './pages/Home/Home';
import Contact from './pages/Contact Us/Contact';
import ExploreFood from './pages/ExploreFood/ExploreFood';
import FoodDetails from './pages/FoodDetails/FoodDetails';
import Cart from './pages/Cart/Cart';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import MyOrders from './pages/MyOrders/MyOrders';
import { useContext } from 'react';
import { StoreContext } from './context/StoreContext';

const App = () => {
  const {token} = useContext(StoreContext);
  return (
    <div>
      <MenuBar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/explore' element={<ExploreFood />} />
        <Route path='/food/:id' element={<FoodDetails />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/order' element={token ? <PlaceOrder />:<Login />} />
        <Route path='/login' element={token ? <Home />:<Login />} />
        <Route path='/register' element={token ? <Home />:<Register />} />

        {/* Redirect from /myorders to /myorder */}
        <Route path="/myorders" element={<Navigate to="/myorder" replace />} />

        <Route path='/myorder' element={token?<MyOrders />:<Login />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default App; 