import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ChevronRight, CheckCircle, Globe, Shield, Truck, Package, Send } from 'lucide-react';
import API from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

const StarRating = ({ value, onChange, size = 'md' }) => {
  const [hover, setHover] = useState(0);
  const sz = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button"
          onClick={() => onChange && onChange(s)}
          onMouseEnter={() => onChange && setHover(s)}
          onMouseLeave={() => onChange && setHover(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}>
          <Star className={`${sz} ${s<=(hover||value)?'fill-yellow-400 text-yellow-400':'text-gray-300'} transition-colors`}/>
        </button>
      ))}
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { t, formatPrice } = useSettings();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [tab, setTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating:5, comment:'' });
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ subject:'Product Inquiry', message:'' });
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);

  const fetchProduct = () => {
    setLoading(true);
    API.get(`/products/${id}`)
      .then(({ data }) => {
        setProduct(data);
        if (data.sizes?.length) setSelectedSize(data.sizes[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchProduct(); window.scrollTo(0,0); }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to write a review'); navigate('/login'); return; }
    setSubmitting(true);
    try {
      await API.post(`/products/${id}/reviews`, reviewForm);
      toast.success('Review submitted!');
      setReviewForm({ rating:5, comment:'' });
      fetchProduct();
    } catch(err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setSubmitting(false); }
  };

  const sendSupplierInquiry = async (e) => {
    e.preventDefault();
    if (!product.supplier_id) { toast.error('No supplier for this product'); return; }
    setSendingInquiry(true);
    try {
      if (user) {
        await API.post('/bot/message-supplier', { supplier_id: product.supplier_id, subject: inquiryForm.subject, message: inquiryForm.message });
      } else {
        await API.post('/inquiries', { item_name: product.name, details: inquiryForm.message, quantity: qty });
      }
      toast.success('Inquiry sent to supplier!');
      setShowInquiry(false);
      setInquiryForm({ subject:'Product Inquiry', message:'' });
    } catch(err) { toast.error(err.response?.data?.message||'Failed to send'); }
    finally { setSendingInquiry(false); }
  };

  if (loading) return (
    <div className="container py-16 flex justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"/>
    </div>
  );
  if (!product) return (
    <div className="container py-16 text-center">
      <Package className="w-16 h-16 text-secondary mx-auto mb-4"/>
      <p className="text-secondary mb-4">Product not found</p>
      <Link to="/products" className="text-primary hover:underline">← Back to products</Link>
    </div>
  );

  const base = 'http://localhost:5000';
  const imgSrc = product.image?.startsWith('/uploads') ? `${base}${product.image}` : product.image;
  const images = imgSrc ? [imgSrc, imgSrc, imgSrc, imgSrc] : [];
  const discount = product.old_price ? Math.round((1 - product.price/product.old_price)*100) : 0;
  const avgRating = parseFloat(product.rating||0);
  const stars = Math.round(avgRating/2);
  const hasSizes = product.sizes?.length > 0;
  const hasTiers = product.price_tiers?.length > 0;
  const hasSupplier = product.supplier_id;

  return (
    <div className="bg-shade min-h-screen">
      <div className="container py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-secondary mb-4 flex-wrap">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-3 h-3"/>
          {product.category_name && (
            <><Link to={`/products?category=${product.category_name.toLowerCase().replace(/\s+/g,'-')}`} className="hover:text-primary capitalize">{product.category_name}</Link><ChevronRight className="w-3 h-3"/></>
          )}
          <span className="text-dark truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-shade-border p-5 lg:p-7 mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

            {/* Images */}
            <div className="lg:col-span-4">
              <div className="bg-shade rounded-xl flex items-center justify-center h-64 mb-3 overflow-hidden">
                {images[activeImg]
                  ? <img src={images[activeImg]} alt={product.name} className="max-h-full max-w-full object-contain p-4"/>
                  : <Package className="w-20 h-20 text-secondary"/>}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {images.map((img, i) => (
                    <button key={i} onClick={()=>setActiveImg(i)}
                      className={`w-14 h-14 rounded-lg border-2 flex-shrink-0 overflow-hidden transition-colors ${activeImg===i?'border-primary':'border-shade-border hover:border-secondary'}`}>
                      <img src={img} alt="" className="w-full h-full object-contain p-1"/>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-teal"/>
                <span className="text-teal text-sm font-medium">{product.stock>0?t('inStock'):t('outOfStock')}</span>
                <span className="text-secondary text-xs">· {product.total_orders||0} sold</span>
              </div>
              <h1 className="text-xl font-bold text-dark leading-tight mb-3">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <StarRating value={stars} size="sm"/>
                <span className="text-primary font-medium text-sm">{avgRating}</span>
                <span className="text-secondary text-xs">{product.reviews?.length||0} {t('reviews')}</span>
              </div>

              {/* Price Tiers — Dynamic from supplier */}
              {hasTiers ? (
                <div className="flex flex-wrap gap-3 mb-4 bg-[#FFF8F0] rounded-xl p-4 border border-[#FFE0B0]">
                  {product.price_tiers.map((tier, i) => (
                    <div key={i} className="text-center">
                      <p className={`font-bold text-xl ${i===0?'text-primary':'text-secondary'}`}>{formatPrice(tier.price)}</p>
                      <p className="text-secondary text-xs">{tier.min_qty}{tier.max_qty?`-${tier.max_qty}`:'+'}  pcs</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-3 mb-4 bg-[#FFF8F0] rounded-xl p-4 border border-[#FFE0B0]">
                  <div className="text-center">
                    <p className="text-primary font-bold text-2xl">{formatPrice(product.price)}</p>
                    <p className="text-secondary text-xs">per unit</p>
                  </div>
                  {product.old_price && (
                    <div className="text-center">
                      <p className="text-secondary font-bold text-2xl line-through">{formatPrice(product.old_price)}</p>
                      <p className="text-secondary text-xs">original</p>
                    </div>
                  )}
                  {product.old_price && (
                    <div className="text-center">
                      <p className="text-dark font-bold text-2xl">{formatPrice(product.price*0.85)}</p>
                      <p className="text-secondary text-xs">700+ pcs</p>
                    </div>
                  )}
                </div>
              )}

              {/* Product Details Table */}
              <table className="w-full text-sm mb-4">
                <tbody>
                  {[
                    [t('price'), `${formatPrice(product.price)}${product.old_price?` - ${formatPrice(product.old_price)}`:''}`],
                    ['Type', product.category_name||'General'],
                    ['Shipping', product.shipping_info||'Free Shipping'],
                    ['Stock', `${product.stock} units available`],
                  ].map(([k,v])=>(
                    <tr key={k} className="border-b border-shade-border last:border-0">
                      <td className="py-2 pr-4 text-secondary w-24">{k}:</td>
                      <td className="py-2 font-medium text-dark">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Sizes — Dynamic from supplier, hidden if none */}
              {hasSizes && (
                <div className="mb-5">
                  <span className="text-secondary text-sm mr-3">{t('size')}:</span>
                  {product.sizes.map(s => (
                    <button key={s.id} onClick={()=>setSelectedSize(s)}
                      className={`mr-2 mb-2 px-4 py-1.5 rounded-full text-sm border transition-colors ${selectedSize?.id===s.id?'border-primary text-primary bg-primary-light':'border-shade-border text-dark hover:border-secondary'}`}>
                      {s.size_label} {s.stock>0?`(${s.stock})`:'(Out)'}
                    </button>
                  ))}
                </div>
              )}

              {/* Add to Cart */}
              <div className="flex gap-3 mb-4">
                <div className="flex items-center border border-shade-border rounded-lg overflow-hidden">
                  <button onClick={()=>setQty(Math.max(1,qty-1))} className="px-3 py-2.5 hover:bg-shade text-lg font-medium transition-colors">−</button>
                  <span className="px-4 py-2.5 text-sm font-medium min-w-[40px] text-center">{qty}</span>
                  <button onClick={()=>setQty(Math.min(product.stock,qty+1))} className="px-3 py-2.5 hover:bg-shade text-lg font-medium transition-colors">+</button>
                </div>
                <button onClick={()=>addToCart(product.id,qty)} disabled={product.stock===0}
                  className="flex-1 bg-primary hover:bg-primary-dark disabled:bg-gray-300 text-white py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors text-sm">
                  <ShoppingCart className="w-4 h-4"/> {t('buyNow')}
                </button>
                <button onClick={()=>addToCart(product.id,qty)}
                  className="flex-1 border-2 border-primary text-primary hover:bg-primary-light py-2.5 px-4 rounded-lg font-medium transition-colors text-sm">
                  {t('addToCart')}
                </button>
              </div>
              <button onClick={()=>setSaved(!saved)} className="flex items-center gap-1.5 text-secondary hover:text-primary text-sm transition-colors">
                <Heart className={`w-4 h-4 ${saved?'fill-red-500 text-red-500':''}`}/> Save for later
              </button>
            </div>

            {/* Supplier Box — Fully Dynamic */}
            <div className="lg:col-span-3">
              <div className="border border-shade-border rounded-xl p-4">
                {hasSupplier ? (
                  <>
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-shade-border">
                      {product.supplier_logo ? (
                        <img src={`${base}${product.supplier_logo}`} alt={product.company_name} className="w-10 h-10 rounded-full object-cover"/>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#FFDDCC] flex items-center justify-center text-orange font-bold text-lg">
                          {product.company_name?.[0]||'S'}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-sm text-dark">Supplier</p>
                        <p className="text-xs text-secondary truncate max-w-[110px]">{product.company_name||'Unknown'}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      {(product.supplier_country||product.supplier_city) && (
                        <div className="flex items-center gap-2 text-xs text-secondary">
                          <Globe className="w-3.5 h-3.5 text-primary flex-shrink-0"/>
                          {[product.supplier_city, product.supplier_country].filter(Boolean).join(', ')}
                        </div>
                      )}
                      {product.is_verified && (
                        <div className="flex items-center gap-2 text-xs text-secondary">
                          <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0"/> {t('verified')}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-secondary">
                        <Truck className="w-3.5 h-3.5 text-primary flex-shrink-0"/> {t('worldwide')}
                      </div>
                    </div>
                    <button onClick={()=>setShowInquiry(true)} className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded-lg text-sm font-medium transition-colors mb-2">
                      {t('sendInquiry')}
                    </button>
                    <Link to={`/supplier-profile/${product.supplier_id}`} className="block w-full border border-primary text-primary py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors text-center">
                      Seller's profile
                    </Link>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Package className="w-10 h-10 text-secondary mx-auto mb-2"/>
                    <p className="text-xs text-secondary">No supplier info available</p>
                    <button onClick={()=>setShowInquiry(true)} className="mt-3 w-full bg-primary hover:bg-primary-dark text-white py-2 rounded-lg text-sm font-medium transition-colors">
                      {t('sendInquiry')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Inquiry Modal */}
        {showInquiry && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md">
              <div className="p-5 border-b border-shade-border flex items-center justify-between">
                <h3 className="font-bold text-dark">Send Inquiry to Supplier</h3>
                <button onClick={()=>setShowInquiry(false)}><span className="text-secondary text-xl leading-none">&times;</span></button>
              </div>
              <form onSubmit={sendSupplierInquiry} className="p-5 space-y-4">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
                  <input className="w-full border border-shade-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" value={inquiryForm.subject} onChange={e=>setInquiryForm({...inquiryForm,subject:e.target.value})}/>
                </div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Message *</label>
                  <textarea required rows={4} placeholder={`I'm interested in ${product.name}. Please provide more details...`} className="w-full border border-shade-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none" value={inquiryForm.message} onChange={e=>setInquiryForm({...inquiryForm,message:e.target.value})}/>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={()=>setShowInquiry(false)} className="flex-1 border border-shade-border py-2.5 rounded-lg text-sm text-secondary hover:bg-shade">Cancel</button>
                  <button type="submit" disabled={sendingInquiry} className="flex-1 bg-primary hover:bg-primary-dark text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                    <Send className="w-4 h-4"/>{sendingInquiry?'Sending...':'Send'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabs + You May Like */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
          <div className="lg:col-span-8 bg-white rounded-xl border border-shade-border p-5">
            <div className="flex gap-0 border-b border-shade-border mb-5 overflow-x-auto">
              {[['description',t('description')],['reviews',`${t('reviews')} (${product.reviews?.length||0})`],['shipping',t('shipping')],['aboutCompany',t('aboutCompany')]].map(([key,label])=>(
                <button key={key} onClick={()=>setTab(key)}
                  className={`pb-3 px-4 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${tab===key?'border-primary text-primary':'border-transparent text-secondary hover:text-dark'}`}>
                  {label}
                </button>
              ))}
            </div>

            {tab==='description' && (
              <div>
                <p className="text-secondary text-sm leading-relaxed mb-5">{product.description||'No description available for this product.'}</p>
                <ul className="space-y-2">
                  {['Quality guaranteed','Fast delivery','Easy returns within 30 days','24/7 customer support'].map(f=>(
                    <li key={f} className="flex items-center gap-2 text-sm text-secondary">
                      <CheckCircle className="w-4 h-4 text-teal flex-shrink-0"/> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tab==='reviews' && (
              <div className="space-y-5">
                {/* Stats */}
                {product.reviews?.length > 0 && (
                  <div className="bg-shade rounded-xl p-4 flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-dark">{avgRating}</p>
                      <StarRating value={stars} size="sm"/>
                      <p className="text-xs text-secondary mt-1">{product.reviews.length} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1">
                      {[5,4,3,2,1].map(star=>{
                        const count = product.reviews.filter(r=>r.rating===star).length;
                        const pct = product.reviews.length ? (count/product.reviews.length)*100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-2 text-xs">
                            <span className="w-3">{star}</span>
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400"/>
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div className="bg-yellow-400 h-1.5 rounded-full transition-all" style={{width:`${pct}%`}}/>
                            </div>
                            <span className="w-6 text-gray-400">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Write Review */}
                {user ? (
                  <div className="bg-shade rounded-xl p-4">
                    <h4 className="font-semibold text-dark mb-3">{t('writeReview')}</h4>
                    <form onSubmit={submitReview} className="space-y-3">
                      <div>
                        <p className="text-sm text-secondary mb-1">{t('rating')}</p>
                        <StarRating value={reviewForm.rating} onChange={r=>setReviewForm({...reviewForm,rating:r})}/>
                      </div>
                      <textarea rows={3} placeholder={t('comment')} required className="w-full border border-shade-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
                        value={reviewForm.comment} onChange={e=>setReviewForm({...reviewForm,comment:e.target.value})}/>
                      <button type="submit" disabled={submitting} className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                        {submitting?'...':t('submitReview')}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-shade rounded-xl p-4 text-center">
                    <p className="text-secondary text-sm mb-2">Login to write a review</p>
                    <Link to="/login" className="text-primary font-medium text-sm hover:underline">{t('login')}</Link>
                  </div>
                )}

                {/* Review List */}
                {product.reviews?.length ? product.reviews.map(r=>(
                  <div key={r.id} className="border-b border-shade-border pb-4 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {r.user_name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-dark">{r.user_name}</p>
                        <div className="flex items-center gap-2">
                          <StarRating value={r.rating} size="sm"/>
                          <span className="text-xs text-secondary">{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {r.comment && <p className="text-secondary text-sm ml-12">{r.comment}</p>}
                  </div>
                )) : <p className="text-secondary text-sm text-center py-6">{t('noReviews')}</p>}
              </div>
            )}

            {tab==='shipping' && (
              <div className="space-y-3">
                {[{icon:Truck,title:'Standard Shipping',desc:'3-7 business days – Free on orders over $100'},{icon:Package,title:'Express Shipping',desc:'1-2 business days – $15.00'},{icon:Globe,title:'International Shipping',desc:'7-14 business days – Rates vary by country'}].map(s=>(
                  <div key={s.title} className="flex items-start gap-3 p-3 bg-shade rounded-lg">
                    <s.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"/>
                    <div><p className="font-medium text-sm text-dark">{s.title}</p><p className="text-secondary text-xs mt-0.5">{s.desc}</p></div>
                  </div>
                ))}
              </div>
            )}

            {tab==='aboutCompany' && (
              <div className="space-y-4">
                {hasSupplier ? (
                  <>
                    <div className="flex items-center gap-3">
                      {product.supplier_logo ? <img src={`${base}${product.supplier_logo}`} alt="" className="w-14 h-14 rounded-xl object-cover"/> :
                        <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center text-primary font-bold text-xl">{product.company_name?.[0]}</div>}
                      <div>
                        <h3 className="font-bold text-dark">{product.company_name}</h3>
                        {product.is_verified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit mt-1"><Shield className="w-3 h-3"/>Verified Supplier</span>}
                      </div>
                    </div>
                    {product.supplier_description && <p className="text-secondary text-sm">{product.supplier_description}</p>}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {[['Location', [product.supplier_city, product.supplier_country].filter(Boolean).join(', ')||'N/A'],['Products', product.total_sales||'N/A'],['Rating', `${product.supplier_rating||'N/A'} / 5`],['Status', product.is_verified?'Verified':'Pending']].map(([k,v])=>(
                        <div key={k} className="bg-shade rounded-lg p-3"><p className="text-xs text-secondary">{k}</p><p className="font-medium text-dark">{v}</p></div>
                      ))}
                    </div>
                    <Link to={`/supplier-profile/${product.supplier_id}`} className="inline-block text-primary text-sm hover:underline">View full supplier profile →</Link>
                  </>
                ) : (
                  <p className="text-secondary text-sm">No supplier information available for this product.</p>
                )}
              </div>
            )}
          </div>

          {/* You May Like */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-shade-border p-4">
            <h3 className="font-semibold text-dark text-sm mb-3">{t('youMayLike')}</h3>
            <div className="space-y-3">
              {(product.related?.length ? product.related : []).slice(0,4).map((p,i)=>{
                const pImg = p.image?.startsWith('/uploads')?`${base}${p.image}`:p.image;
                return (
                  <Link key={i} to={`/products/${p.id}`} className="flex items-center gap-3 hover:bg-shade p-2 rounded-lg transition-colors group">
                    <div className="w-14 h-14 rounded-lg bg-shade flex items-center justify-center overflow-hidden flex-shrink-0">
                      {pImg ? <img src={pImg} alt={p.name} className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"/> :
                        <Package className="w-7 h-7 text-secondary"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-dark line-clamp-2 group-hover:text-primary transition-colors">{p.name}</p>
                      <p className="text-xs text-secondary mt-0.5">{formatPrice(p.price)} - {formatPrice(parseFloat(p.price)*1.3)}</p>
                    </div>
                  </Link>
                );
              })}
              {!product.related?.length && <p className="text-secondary text-xs text-center py-4">No related products</p>}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {product.related?.length > 0 && (
          <div className="bg-white rounded-xl border border-shade-border p-5 mb-4">
            <h3 className="font-bold text-dark mb-4">{t('relatedProducts')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {product.related.slice(0,6).map(p=>{
                const pImg = p.image?.startsWith('/uploads')?`${base}${p.image}`:p.image;
                return (
                  <Link key={p.id} to={`/products/${p.id}`} className="border border-shade-border rounded-lg p-3 hover:shadow-md hover:-translate-y-0.5 transition-all group text-center">
                    <div className="h-20 flex items-center justify-center mb-2">
                      {pImg ? <img src={pImg} alt={p.name} className="max-h-full object-contain group-hover:scale-105 transition-transform"/> :
                        <Package className="w-10 h-10 text-secondary"/>}
                    </div>
                    <p className="text-xs text-dark line-clamp-2 group-hover:text-primary transition-colors mb-1">{p.name}</p>
                    <p className="text-xs text-secondary">{formatPrice(p.price)} - {formatPrice(parseFloat(p.price)*1.3)}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Discount Banner */}
        <div className="rounded-xl overflow-hidden flex items-center justify-between px-8 py-6 mb-4" style={{background:'linear-gradient(90deg,#0D6EFD 0%,#1565D8 100%)'}}>
          <div className="text-white">
            <h3 className="text-xl font-bold mb-1">{t('superDiscount')}</h3>
            <p className="text-white/70 text-sm">Have you ever finally just for dummy info.</p>
          </div>
          <Link to="/products" className="bg-orange hover:bg-orange/90 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors flex-shrink-0">{t('shopNow')}</Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
