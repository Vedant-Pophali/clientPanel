import axios from "axios";

const API_URL = "https://foodapps-production.up.railway.app/api/cart";

export const addToCart = async (foodId, token) => {
  try {
    await axios.post(
      API_URL,
      { foodId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error("Error adding to cart:", error);
  }
};

export const removeQtyFromCart = async (foodId, token) => {
  try {
    await axios.post(
      API_URL + "/remove",
      { foodId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error("Error removing from cart:", error);
  }
};

// New API call to delete entire item from cart
export const removeItemFromCart = async (foodId, token) => {
  try {
    await axios.delete(`${API_URL}/${foodId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Error removing item from cart:", error);
  }
};

export const getCartData = async (token) => {
  try {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.items || {};
  } catch (error) {
    console.error("Error loading cart data:", error);
    return {};
  }
};