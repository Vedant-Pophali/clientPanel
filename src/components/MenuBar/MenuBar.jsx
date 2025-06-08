import React, { useContext, useState } from 'react';
import './MenuBar.css';
import { Link, useNavigate } from 'react-router-dom';  
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';

const MenuBar = () => {
  const [active, setActive] = useState('home');   
  const { quantities, token, setToken, setQuantities } = useContext(StoreContext);
  const uniqueItemsInCart = Object.values(quantities).filter(qty => qty > 0).length;
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setQuantities({});
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link to="/">
          <img src={assets.logo} alt="Logo" className='mx-4' height={48} width={48} />
        </Link>
        <button 
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link 
                className={active === 'home' ? "nav-link fw-bold active" : "nav-link"} 
                to="/" 
                onClick={() => setActive('home')}
              >
                Home
              </Link> 
            </li>
            <li className="nav-item">
              <Link 
                className={active === 'explore' ? "nav-link fw-bold active" : "nav-link"} 
                to="/explore" 
                onClick={() => setActive('explore')}
              >
                Explore
              </Link>  
            </li>
            <li className="nav-item">
              <Link 
                className={active === 'contact-us' ? "nav-link fw-bold active" : "nav-link"} 
                to="/contact" 
                onClick={() => setActive('contact-us')}
              >
                Contact us
              </Link>  
            </li>
          </ul>

          <div className="d-flex align-items-center gap-4">
            <Link to="/cart">      
              <div className="position-relative">
                <img src={assets.cart} alt="Cart" height={32} width={32} />
                {uniqueItemsInCart > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning">
                    {uniqueItemsInCart}
                  </span> 
                )}
              </div>
            </Link>

            {!token ? (
              <>
                <button className="btn btn-outline-primary" onClick={() => navigate('/login')}>Login</button>
                <button className="btn btn-outline-success" onClick={() => navigate('/register')}>Register</button>
              </>
            ) : (
              <div className="dropdown text-end">
                <button
                  className="btn dropdown-toggle d-flex align-items-center"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img 
                    src={assets.profile || 'https://via.placeholder.com/32'} 
                    alt="User Avatar" 
                    width={32} 
                    height={32} 
                    className="rounded-circle me-2"
                  />
                </button>
                <ul className="dropdown-menu dropdown-menu-end text-small shadow" aria-labelledby="userDropdown">
                  <li>
                    <button 
                      className="dropdown-item" 
                      onClick={() => navigate('/myorder')}
                    >
                      Orders
                    </button>
                  </li>
                  <li>
                    <button 
                      className="dropdown-item" 
                      onClick={logout}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MenuBar;
