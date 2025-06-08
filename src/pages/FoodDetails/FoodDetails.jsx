import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchFoodDetails } from '../../service/foodService';
import { toast } from 'react-toastify';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';
import { StoreContext } from '../../context/StoreContext';

const FoodDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { increaseQty } = useContext(StoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFoodDetails = async () => {
      try {
        const foodData = await fetchFoodDetails(id);
        setData(foodData);
      } catch (error) {
        toast.error('Error displaying food details');
      } finally {
        setLoading(false);
      }
    };
    loadFoodDetails();
  }, [id]);

  const addToCart = () => {
    if (data?.id) {
      increaseQty(data.id);
      navigate("/cart");
    } else {
      toast.error("Unable to add to cart");
    }
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (!data) return <div className="text-center py-5">No food details found.</div>;

  return (
    <section className="py-5">
      <div className="container px-4 px-lg-5 my-5">
        <div className="row gx-4 gx-lg-5 align-items-center">
          <div className="col-md-6">
            <img
              className="card-img-top mb-5 mb-md-0"
              src={data.imageUrl}
              alt={data.name}
            />
          </div>
          <div className="col-md-6">
            <div className="fs-5 mb-2">
              Category: <span className="badge text-bg-warning">{data.category || "N/A"}</span>
            </div>
            <h1 className="display-5 fw-bolder">{data.name || "No Name"}</h1>
            <div className="fs-5 mb-5">&#8377;{data.price}.00</div>
            <p className="lead">{data.description || "No description available."}</p>
            <button
              className="btn btn-outline-dark flex-shrink-0"
              type="button"
              onClick={addToCart}
            >
              <i className="bi-cart-fill me-1"></i>
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoodDetails;
