import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, ChevronDown, Grid, List, X } from 'lucide-react';
import API from '../utils/api';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: '', maxPrice: '',
    sort: '', page: 1
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const { data } = await API.get(`/products?${params}`);
      setProducts(data.products); setTotal(data.total); setPages(data.pages);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [filters]);
  useEffect(() => {
    API.get('/admin/categories').then(({ data }) => setCategories(data)).catch(() =>
      setCategories([{ slug: 'electronics', name: 'Electronics' }, { slug: 'home-outdoor', name: 'Home & Outdoor' }, { slug: 'clothing', name: 'Clothing' }])
    );
  }, []);

  const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val, page: 1 }));

  const FilterPanel = () => (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-gray-700 mb-2 text-sm">Category</h3>
        <div className="space-y-1">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="radio" name="cat" checked={!filters.category} onChange={() => setFilter('category', '')} className="text-blue-500" /> All
          </label>
          {categories.map(c => (
            <label key={c.slug} className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="radio" name="cat" checked={filters.category === c.slug} onChange={() => setFilter('category', c.slug)} className="text-blue-500" /> {c.name}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-gray-700 mb-2 text-sm">Price Range</h3>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={filters.minPrice} onChange={e => setFilter('minPrice', e.target.value)} />
          <input type="number" placeholder="Max" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={filters.maxPrice} onChange={e => setFilter('maxPrice', e.target.value)} />
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-gray-700 mb-2 text-sm">Sort By</h3>
        <select className="w-full border border-gray-300 rounded px-2 py-2 text-sm" value={filters.sort} onChange={e => setFilter('sort', e.target.value)}>
          <option value="">Featured</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="newest">Newest</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {filters.search ? `Results for "${filters.search}"` : filters.category ? categories.find(c => c.slug === filters.category)?.name || 'Products' : 'All Products'}
          </h1>
          <p className="text-sm text-gray-500">{total} products found</p>
        </div>
        <button onClick={() => setShowFilter(!showFilter)} className="lg:hidden flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-lg text-sm">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-20">
            <h2 className="font-bold text-gray-800 mb-4">Filters</h2>
            <FilterPanel />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {showFilter && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowFilter(false)}>
            <div className="absolute right-0 top-0 h-full w-72 bg-white p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold">Filters</h2>
                <button onClick={() => setShowFilter(false)}><X className="w-5 h-5" /></button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg mb-2">No products found</p>
              <button onClick={() => setFilters({ search: '', category: '', minPrice: '', maxPrice: '', sort: '', page: 1 })} className="text-blue-500 hover:underline">Clear filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {[...Array(pages)].map((_, i) => (
                    <button key={i} onClick={() => setFilters(prev => ({ ...prev, page: i + 1 }))}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${filters.page === i + 1 ? 'bg-blue-500 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
