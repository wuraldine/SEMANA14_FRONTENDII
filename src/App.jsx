import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import AdminRoute from './components/guards/AdminRoute';
import ProtectedRoute from './components/guards/ProtectedRoute';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import useAuth from './hooks/useAuth';
import axiosClient from './lib/axiosClient';
import OrderDetail from './pages/account/OrderDetail';
import UserOrders from './pages/account/UserOrders';
import UserProfile from './pages/account/UserProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Unauthorized from './pages/auth/Unauthorized';
import Cart from './pages/shop/Cart';
import CategoryProducts from './pages/shop/CategoryProducts';
import Checkout from './pages/shop/Checkout';
import Home from './pages/shop/Home';
import OrderConfirmation from './pages/shop/OrderConfirmation';
import ProductList from './pages/shop/ProductList';
import './App.css';

// Convierte un item del CartResponse del backend al shape que usa el frontend
function mapCartItem(item) {
  return {
    id: item.productId,
    cartItemId: item.id,
    name: item.name,
    image: item.image,
    price: item.unitPrice,
    quantity: item.quantity,
    productStock: item.productStock,
  };
}

function App() {
  const { currentUser, token, login } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [latestOrder, setLatestOrder] = useState(null);

  // Crea sesión guest cuando no hay token (usuario anónimo)
  useEffect(() => {
    if (token) return;
    axiosClient
      .post('/auth/guest-session')
      .then((res) => login(res.data))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recarga el carrito cuando el usuario se autentica
  useEffect(() => {
    if (!token) return;
    axiosClient
      .get('/cart/me')
      .then((res) => {
        if (Array.isArray(res.data.items)) {
          setCartItems(res.data.items.map(mapCartItem));
        }
      })
      .catch(() => {});
  }, [token]);

  const handleAddToCart = async (product) => {
    if (!token) return;
    try {
      const res = await axiosClient.post('/cart/items', { productId: product.id, quantity: 1 });
      if (Array.isArray(res.data.items)) {
        setCartItems(res.data.items.map(mapCartItem));
      }
    } catch {
      // Error de red — no actualiza el estado local
    }
  };

  const handleUpdateCartItemQuantity = async (productId, nextQuantity) => {
    if (!token) return;
    try {
      const res = await axiosClient.patch(`/cart/items/${productId}`, {
        quantity: Math.max(1, nextQuantity),
      });
      if (Array.isArray(res.data.items)) {
        setCartItems(res.data.items.map(mapCartItem));
      }
    } catch {
      // Error de red
    }
  };

  const handleRemoveCartItem = async (productId) => {
    if (!token) return;
    try {
      const res = await axiosClient.delete(`/cart/items/${productId}`);
      if (Array.isArray(res.data.items)) {
        setCartItems(res.data.items.map(mapCartItem));
      }
    } catch {
      // Error de red
    }
  };

  const handleClearCart = async () => {
    if (!token) return;
    try {
      await axiosClient.delete('/cart/items');
      setCartItems([]);
    } catch {
      // Error de red
    }
  };

  // Recibe el OrderResponse del backend desde Checkout
  const handleCompleteCheckout = (order) => {
    setLatestOrder(order);
    setCartItems([]);
  };

  const handleBackHomeAfterOrder = () => setLatestOrder(null);

  const cartItemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  return (
    <div className="app">
      <Header user={currentUser} cartItemCount={cartItemCount} />

      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/category/:categoryId"
            element={<CategoryProducts cartItems={cartItems} onAddToCart={handleAddToCart} />}
          />
          <Route
            path="/products"
            element={<ProductList cartItems={cartItems} onAddToCart={handleAddToCart} />}
          />
          <Route
            path="/cart"
            element={
              <Cart
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateCartItemQuantity}
                onRemoveItem={handleRemoveCartItem}
                onClearCart={handleClearCart}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout
                  cartItems={cartItems}
                  user={currentUser}
                  onCompleteCheckout={handleCompleteCheckout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-confirmation"
            element={
              <OrderConfirmation order={latestOrder} onBackHome={handleBackHomeAfterOrder} />
            }
          />
          <Route
            path="/user/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/orders"
            element={
              <ProtectedRoute>
                <UserOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/access-denied" element={<Unauthorized />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminProducts />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
