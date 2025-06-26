import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";
import { StoreContext } from '../../context/StoreContext';

const API_URL = "https://foodapps-production.up.railway.app/api/login";

const login = async (data) => {
  return await axios.post(API_URL, data, {
    headers: {
      "Content-Type": "application/json"
    }
  });
};

const Login = () => {
  const navigate = useNavigate();
  const { setToken, loadCartData } = useContext(StoreContext);
  const [data, setData] = useState({
    email: '',
    password: ''
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(prevData => ({ ...prevData, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const response = await login(data);
      if (response.status === 200 || response.status === 201) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        toast.success('Login successful!');
        
        try {
          await loadCartData(response.data.token);
        } catch (e) {
          console.error("Failed to load cart data:", e);
          // optionally: toast.warning('Failed to load cart data.');
        }

        navigate('/');
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Invalid email or password.');
      } else {
        toast.error('Login failed. Please try again later.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="row">
        <div className="col-sm-9 col-md-7 col-lg-5 mx-auto">
          <div className="card border-0 shadow rounded-3 my-5">
            <div className="card-body p-4 p-sm-5">
              <h5 className="card-title text-center mb-5 fw-light fs-5">Sign In</h5>
              <form onSubmit={onSubmitHandler}>
                <div className="form-floating mb-3">
                  <input 
                    type="email" 
                    className="form-control" 
                    id="floatingInput" 
                    placeholder="name@example.com" 
                    name="email"
                    value={data.email}
                    onChange={onChangeHandler}
                    required
                    autoComplete="email"
                  />
                  <label htmlFor="floatingInput">Email address</label>
                </div>

                <div className="form-floating mb-3">
                  <input 
                    type="password" 
                    className="form-control" 
                    id="floatingPassword" 
                    placeholder="Password" 
                    name="password"
                    value={data.password}
                    onChange={onChangeHandler}
                    required
                    autoComplete="current-password"
                  />
                  <label htmlFor="floatingPassword">Password</label>
                </div>

                <div className="d-grid">
                  <button className="btn btn-outline-primary btn-login text-uppercase" type="submit">
                    Sign in
                  </button>
                </div>
                
                <div className="d-grid mt-2">
                  <button 
                    className="btn btn-outline-danger btn-login text-uppercase" 
                    type="button" 
                    onClick={() => setData({ email: '', password: '' })}
                  >
                    Reset
                  </button>
                </div>

                <div className="mt-4 text-center">
                  Don't have an account? <Link to="/register">Sign Up</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
