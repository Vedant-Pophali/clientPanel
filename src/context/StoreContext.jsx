import React, { createContext, useEffect, useState } from "react";
import { fetchFoodList } from "../service/foodService";
import { addToCart, removeQtyFromCart, getCartData, removeItemFromCart } from "../service/cartService";

export const StoreContext = createContext(null);

export const StoreContextProvider = (props) => {
  const [foodList, setFoodList] = useState([]);
  const [token, setToken] = useState("");
  const [quantities, setQuantities] = useState({});

  const increaseQty = async (foodId) => {
    setQuantities((prev) => ({
      ...prev,
      [foodId]: (prev[foodId] || 0) + 1,
    }));
    await addToCart(foodId, token);
  };

  const decreaseQty = async (foodId) => {
    setQuantities((prev) => ({
      ...prev,
      [foodId]: prev[foodId] > 0 ? prev[foodId] - 1 : 0,
    }));
    await removeQtyFromCart(foodId, token);
  };

  // Updated removeFromCart to call API and remove from DB
  const removeFromCart = async (foodId) => {
    if (!token) return;
    try {
      await removeItemFromCart(foodId, token);
      setQuantities((prev) => {
        const updated = { ...prev };
        delete updated[foodId];
        return updated;
      });
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    }
  };

  const loadCartData = async (token) => {
    const items = await getCartData(token);
    setQuantities(items);
  };

  useEffect(() => {
    async function loadData() {
      const data = await fetchFoodList();
      setFoodList(data);

      const localToken = localStorage.getItem("token");
      if (localToken) {
        setToken(localToken);
        await loadCartData(localToken);
      }
    }
    loadData();
  }, []);

  return (
    <StoreContext.Provider
      value={{
        foodList,
        increaseQty,
        decreaseQty,
        quantities,
        removeFromCart,
        token,
        setToken,
        setQuantities,
        loadCartData,
      }}
    >
      {props.children}
    </StoreContext.Provider>
  );
};
