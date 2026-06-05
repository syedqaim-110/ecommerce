import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const imgSrc = product.image?.startsWith('/uploads')
    ? `http://localhost:5000${product.image}`
    : (product.image || null);
  const discount = product.old_price ? Math.round((1 - product.price / product.old_price) * 100) : 0;

  return (
    <div className="bg-white border border-shade-border rounded-lg p-4 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(`/products/${product.id}`)}>
      <div className="flex-1 flex items-center justify-center p-3 mb-3 relative min-h-[120px]">
        {imgSrc
          ? <img src={imgSrc} alt={product.name} className="max-h-[120px] w-auto object-contain group-hover:scale-105 transition-transform"/>
          : <div className="w-full h-24 bg-shade rounded flex items-center justify-center text-secondary text-xs">No Image</div>
        }
        {discount > 0 && (
          <span className="absolute top-0 left-0 bg-[#FFE3E3] text-[#EB001B] text-[10px] font-bold px-1.5 py-0.5 rounded">-{discount}%</span>
        )}
        {product.is_featured == 1 && (
          <span className="absolute top-0 right-0 bg-primary-light text-primary text-[10px] font-bold px-1.5 py-0.5 rounded">Featured</span>
        )}
      </div>

      <div className="flex items-center gap-1 mb-1">
        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400"/>
        <span className="text-[11px] text-secondary">{parseFloat(product.rating||0).toFixed(1)} ({product.total_orders||0} orders)</span>
      </div>

      <p className="font-semibold text-dark text-base mb-0.5">${parseFloat(product.price).toFixed(2)}</p>
      {product.old_price && <p className="text-secondary text-xs line-through mb-1">${parseFloat(product.old_price).toFixed(2)}</p>}
      <p className="text-secondary text-xs line-clamp-2 mb-3 leading-snug">{product.name}</p>
      {product.shipping_info && <p className="text-teal text-xs mb-2">{product.shipping_info}</p>}

      <button
        onClick={e => { e.stopPropagation(); addToCart(product.id); }}
        className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 mt-auto">
        <ShoppingCart className="w-3.5 h-3.5"/> Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
