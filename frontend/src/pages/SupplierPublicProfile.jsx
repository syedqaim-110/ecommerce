import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Globe, MapPin, Package, Star, CheckCircle } from 'lucide-react';
import API from '../utils/api';
import { useSettings } from '../context/SettingsContext';
import ProductCard from '../components/ProductCard';

const SupplierPublicProfile = () => {
  const { id } = useParams();
  const { formatPrice } = useSettings();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/suppliers/profile/${id}`)
      .then(({ data: d }) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"/></div>;
  if (!data) return <div className="text-center py-20"><p className="text-secondary">Supplier not found</p><Link to="/products" className="text-primary hover:underline block mt-2">Browse Products</Link></div>;

  const base = 'http://localhost:5000';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-shade-border p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-primary-light flex items-center justify-center text-primary font-bold text-3xl flex-shrink-0 overflow-hidden">
            {data.logo ? <img src={`${base}${data.logo}`} alt={data.company_name} className="w-full h-full object-cover"/> : data.company_name?.[0]}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-dark">{data.company_name}</h1>
              {data.is_verified && (
                <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">
                  <CheckCircle className="w-3.5 h-3.5"/> Verified Supplier
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-secondary mb-3">
              {(data.city || data.country) && <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-primary"/>{[data.city,data.country].filter(Boolean).join(', ')}</span>}
              <span className="flex items-center gap-1"><Globe className="w-4 h-4 text-primary"/>Worldwide shipping</span>
              <span className="flex items-center gap-1"><Package className="w-4 h-4 text-primary"/>{data.total_products} Products</span>
              {data.rating > 0 && <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400"/>{parseFloat(data.rating).toFixed(1)} Rating</span>}
            </div>
            {data.description && <p className="text-secondary text-sm leading-relaxed">{data.description}</p>}
          </div>
          <button onClick={() => window.dispatchEvent(new CustomEvent('contactSupplier', {detail:{id}}))}
            className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0">
            Contact Supplier
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-shade-border">
          {[['Products',data.total_products],['Total Sales',data.total_sales||'N/A'],['Rating',data.rating?`${parseFloat(data.rating).toFixed(1)}/5`:'N/A'],['Since',new Date(data.created_at).getFullYear()]].map(([k,v])=>(
            <div key={k} className="text-center">
              <p className="font-bold text-dark text-lg">{v}</p>
              <p className="text-secondary text-xs">{k}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Products */}
      <div>
        <h2 className="text-xl font-bold text-dark mb-4">{data.company_name}'s Products</h2>
        {data.products?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.products.map(p => <ProductCard key={p.id} product={p}/>)}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-shade-border p-12 text-center">
            <Package className="w-12 h-12 text-secondary mx-auto mb-3"/>
            <p className="text-secondary">No products listed yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierPublicProfile;
