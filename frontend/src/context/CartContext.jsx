import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: '0.00' });
  const [cartCount, setCartCount] = useState(0);

  const fetchCart = async () => {
    if (!user) { setCart({ items: [], total: '0.00' }); setCartCount(0); return; }
    try {
      const { data } = await API.get('/cart');
      setCart(data);
      setCartCount(data.items.reduce((s, i) => s + i.quantity, 0));
    } catch {}
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (product_id, quantity = 1) => {
    if (!user) { toast.error('Please login to add items to cart'); return false; }
    try {
      await API.post('/cart', { product_id, quantity });
      await fetchCart();
      toast.success('Added to cart!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      return false;
    }
  };

  const updateCartItem = async (id, quantity) => {
    try {
      await API.put(`/cart/${id}`, { quantity });
      await fetchCart();
    } catch (err) {
      toast.error('Failed to update cart');
    }
  };

  const removeFromCart = async (id) => {
    try {
      await API.delete(`/cart/${id}`);
      await fetchCart();
      toast.success('Item removed');
    } catch {}
  };

  const clearCart = async () => {
    try { await API.delete('/cart/clear'); setCart({ items: [], total: '0.00' }); setCartCount(0); } catch {}
  };

  return (
    <CartContext.Provider value={{ cart, cartCount, addToCart, updateCartItem, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
