import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/assets";
import './MyOrders.css'; 

const MyOrders = () => {
  const { token } = useContext(StoreContext);
  const [data, setData] = useState([]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/order", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setData([]);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  return (
    <div className="container">
      <div className="py-5 row justify-content-center">
        <div className="col-11 card">
          <table className="table table-responsive">
            <thead>
              <tr>
                <th></th>
                <th>Items</th>
                <th>Total Price</th>
                <th>Number of Items</th>
                <th>Status</th>
                <th>Refresh</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0
                ? data.map((order, index) => (
                    <tr key={index}>
                      <td>
                        <img
                          src={assets.delivery}
                          alt="Delivery Icon"
                          height={48}
                          width={48}
                        />
                      </td>

                      <td>
                        {Array.isArray(order.orderedItems) &&
                        order.orderedItems.length > 0 ? (
                          <ul style={{ paddingLeft: "20px", margin: 0 }}>
                            {order.orderedItems.map((item, idx) => (
                              <li key={idx}>
                                {idx + 1}. {item.name} x {item.quantity}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span>No items</span>
                        )}
                      </td>

                      <td>&#x20B9;{order.amount.toFixed(2)}</td>

                      <td>
                        Items:{" "}
                        {Array.isArray(order.orderedItems)
                          ? order.orderedItems.length
                          : 0}
                      </td>

                      <td className="fw-bold text-capitalize">
                        &#x25cf;{order.orderStatus}
                      </td>

                      <td>
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={fetchOrders}
                        >
                          <i className="bi bi-arrow-clockwise"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
