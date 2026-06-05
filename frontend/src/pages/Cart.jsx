import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [address, setAddress] = useState(user?.address || '');

  const handleCheckout = async () => {
    if (!address.trim()) { toast.error('Please enter shipping address'); return; }
    setCheckoutLoading(true);
    try {
      const items = cart.items.map(i => ({ product_id: i.product_id, quantity: i.quantity }));
      const { data } = await API.post('/orders', { items, shipping_address: address });
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!cart.items.length) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">Add some products to get started</p>
      <Link to="/products" className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors">Start Shopping</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Shopping Cart ({cart.items.length} items)</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const img = item.image?.startsWith('/uploads') ? `http://localhost:5000${item.image}` : (item.image || 'https://via.placeholder.com/100');
            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
                <img src={img} alt={item.name} className="w-20 h-20 object-contain rounded-lg bg-gray-50 p-2" />
                <div className="flex-1">
                  <Link to={`/products/${item.product_id}`} className="font-medium text-gray-800 hover:text-blue-500 text-sm line-clamp-2">{item.name}</Link>
                  <p className="text-blue-600 font-bold mt-1">${parseFloat(item.price).toFixed(2)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => updateCartItem(item.id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-100"><Minus className="w-3 h-3" /></button>
                      <span className="px-3 py-1 text-sm">{item.quantity}</span>
                      <button onClick={() => updateCartItem(item.id, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-100"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            );
          })}
          <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 flex items-center gap-1"><Trash2 className="w-4 h-4" /> Clear Cart</button>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-20">
            <h2 className="font-bold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${cart.total}</span></div>
              <div className="flex justify-between text-green-600"><span>Shipping</span><span>Free</span></div>
              <hr className="border-gray-200" />
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>${cart.total}</span></div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
              <textarea rows={3} placeholder="Enter delivery address..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <button onClick={handleCheckout} disabled={checkoutLoading} className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
              {checkoutLoading ? 'Processing...' : (<>Place Order <ArrowRight className="w-4 h-4" /></>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
