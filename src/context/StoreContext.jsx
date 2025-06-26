import React, { createContext, useEffect, useState } from "react";
import { fetchFoodList } from "../service/foodService";
import {
  addToCart,
  removeQtyFromCart,
  getCartData,
  removeItemFromCart,
} from "../service/cartService";

export const StoreContext = createContext(null);

export const StoreContextProvider = (props) => {
  const [foodList, setFoodList] = useState([]);
  const [token, setToken] = useState("");
  const [quantities, setQuantities] = useState({});

  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch (e) {
      console.warn("Invalid token structure");
      return false;
    }
  };

  const getValidToken = () => {
    const localToken = token || localStorage.getItem("token");
    return isTokenValid(localToken) ? localToken : null;
  };

  const increaseQty = async (foodId) => {
    const validToken = getValidToken();
    if (!validToken) return;

    setQuantities((prev) => ({
      ...prev,
      [foodId]: (prev[foodId] || 0) + 1,
    }));

    await addToCart(foodId, validToken);
  };

  const decreaseQty = async (foodId) => {
    const validToken = getValidToken();
    if (!validToken) return;

    setQuantities((prev) => ({
      ...prev,
      [foodId]: prev[foodId] > 0 ? prev[foodId] - 1 : 0,
    }));

    await removeQtyFromCart(foodId, validToken);
  };

  const removeFromCart = async (foodId) => {
    const validToken = getValidToken();
    if (!validToken) return;

    try {
      await removeItemFromCart(foodId, validToken);
      setQuantities((prev) => {
        const updated = { ...prev };
        delete updated[foodId];
        return updated;
      });
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    }
  };

  const loadCartData = async (passedToken) => {
    const validToken = isTokenValid(passedToken)
      ? passedToken
      : getValidToken();
    if (!validToken) return;

    const items = await getCartData(validToken);
    setQuantities(items);
  };

  useEffect(() => {
    async function loadData() {
      const data = await fetchFoodList();
      setFoodList(data);

      const localToken = localStorage.getItem("token");
      if (isTokenValid(localToken)) {
        setToken(localToken);
        await loadCartData(localToken);
      } else {
        localStorage.removeItem("token");
        console.warn("Expired or invalid token removed.");
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