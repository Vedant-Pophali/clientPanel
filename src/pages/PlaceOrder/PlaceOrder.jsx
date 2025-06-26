import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PlaceOrder.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { calculateCartTotals } from "../../service/util/cartUtils";
import axios from "axios";
import { toast } from "react-toastify";
import RAZORPAY_KEY from '../../service/util/constants';

const PlaceOrder = () => {
  const { foodList, quantities, setQuantities, token } = useContext(StoreContext);
  const navigate = useNavigate();

  // Form state
  const [data, setData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phoneNumber: "",
    address: "",
    state: "",
    city: "",
    zip: "",
  });

  // Filter cart items based on quantity > 0
  const cartItems = foodList.filter(food => quantities[food.id] > 0);

  // Calculate totals
  const { subtotal, shipping, tax, total } = calculateCartTotals(cartItems, quantities);

  // Handle form input changes
  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(prevData => ({ ...prevData, [name]: value }));
  };

  // Clear cart quantities after successful payment
  const clearCart = () => {
    const clearedQuantities = {};
    foodList.forEach(food => {
      clearedQuantities[food.id] = 0;
    });
    setQuantities(clearedQuantities);
  };

  // Handle order form submission
  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Prepare order data payload
    const orderData = {
      userAddress: `${data.firstname} ${data.lastname}, ${data.address}, ${data.city}, ${data.state}, ${data.zip}`,
      phoneNumber: data.phoneNumber,
      email: data.email,
      orderedItems: cartItems.map(item => ({
        foodId: item.id,                      // Corrected: use item.id not item.foodId
        quantity: quantities[item.id],
        price: item.price * quantities[item.id],
        category: item.category,
        imageUrl: item.imageUrl,
        description: item.description,
        name: item.name
      })),
      amount: parseFloat(total.toFixed(2)),  // Ensure amount is a number
      orderStatus: "Preparing"
    };

    try {
      const response = await axios.post(
        'https://foodapps-production.up.railway.app/api/order/create',
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201 && response.data.razorpayOrderId) {
        initiateRazorpayPayment(response.data);
      } else {
        toast.error("Unable to place order");
      }
    } catch (error) {
      toast.error("Unable to place order");
    }
  };

  // Initialize Razorpay payment
  const initiateRazorpayPayment = (order) => {
    const options = {
      key: RAZORPAY_KEY,
      amount: order.amount * 100, // Razorpay expects amount in paise (multiply by 100)
      currency: "INR",
      name: "Food Village",
      description: "Food Order Payment",
      image: assets.logo,
      order_id: order.razorpayOrderId,
      handler: async function (razorpayResponse) {
        await verifyPayment(razorpayResponse, order.id);
      },
      prefill: {
        name: `${data.firstname} ${data.lastname}`,
        email: data.email,
        contact: data.phoneNumber // Razorpay expects 'contact' instead of 'phoneNumber'
      },
      theme: { color: "#3399cc" },
      modal: {
        ondismiss: async function () {
          toast.error("Payment Cancelled");
          await deleteOrder(order.id);
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // Verify payment on backend
  const verifyPayment = async (response, orderId) => {
    try {
      const res = await axios.post(
        "http://localhost:8080/api/order/verify",
        {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          orderId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) {
        toast.success("Payment successful!");
        clearCart();
        navigate('/myOrders');
      } else {
        toast.error("Payment verification failed");
        navigate('/');
      }
    } catch (error) {
      toast.error("Payment verification failed");
    }
  };

  // Delete order on payment failure/cancellation
  const deleteOrder = async (orderId) => {
    try {
      await axios.delete(`http://localhost:8080/api/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Error deleting cancelled order", error);
    }
  };

  return (
    <div className="container mt-4">
      <main>
        <div className="py-5 text-container">
          <img className="d-block mx-auto" src={assets.logo} alt="Logo" width="98" height="98" />
        </div>

        <div className="row g-5">
          {/* Order Summary */}
          <div className="col-md-5 col-lg-4 order-md-last">
            <h4 className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-primary">Order Summary</span>
              <span className="badge bg-primary rounded-pill">{cartItems.length}</span>
            </h4>
            <ul className="list-group mb-3">
              {cartItems.map(item => (
                <li key={item.id} className="list-group-item d-flex justify-content-between lh-sm">
                  <div>
                    <h6 className="my-0">{item.name}</h6>
                    <small className="text-muted">Qty: {quantities[item.id]}</small>
                  </div>
                  <span className="text-muted">₹{(item.price * quantities[item.id]).toFixed(2)}</span>
                </li>
              ))}
              <li className="list-group-item d-flex justify-content-between">
                <span>Shipping</span>
                <span>₹{subtotal === 0 ? "0.00" : shipping.toFixed(2)}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span>Tax</span>
                <span>₹{tax.toFixed(2)}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <strong>Total (INR)</strong>
                <strong>₹{total.toFixed(2)}</strong>
              </li>
            </ul>
          </div>

          {/* Billing Address Form */}
          <div className="col-md-7 col-lg-8">
            <h4 className="mb-3">Billing address</h4>
            <form className="needs-validation" onSubmit={onSubmitHandler} noValidate>
              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="form-label">First name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Akshay"
                    required
                    name="firstname"
                    onChange={onChangeHandler}
                    value={data.firstname}
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">Last name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Kumar"
                    required
                    name="lastname"
                    onChange={onChangeHandler}
                    value={data.lastname}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Email</label>
                  <div className="input-group">
                    <span className="input-group-text">@</span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="you@example.com"
                      required
                      name="email"
                      onChange={onChangeHandler}
                      value={data.email}
                    />
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="1234 Street"
                    required
                    name="address"
                    onChange={onChangeHandler}
                    value={data.address}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="9876543210"
                    required
                    name="phoneNumber"
                    onChange={onChangeHandler}
                    value={data.phoneNumber}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">State</label>
                  <select
                    className="form-select"
                    name="state"
                    required
                    onChange={onChangeHandler}
                    value={data.state}
                  >
                    <option value="">Choose...</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="West Bengal">West Bengal</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter city"
                    required
                    name="city"
                    onChange={onChangeHandler}
                    value={data.city}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Zip</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="123456"
                    required
                    name="zip"
                    onChange={onChangeHandler}
                    value={data.zip}
                  />
                </div>
              </div>

              <hr className="my-4" />

              <button
                className="w-100 btn btn-primary btn-lg"
                type="submit"
                disabled={cartItems.length === 0}
              >
                Continue to checkout
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlaceOrder;