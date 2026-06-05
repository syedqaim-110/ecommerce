import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Building, Globe, MapPin } from 'lucide-react';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import logo from '../../assets/Layout/Brand/logo-colored.png';

const SupplierRegister = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '',
    company_name: '', country: '', city: '', description: ''
  });

  const handleNext = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/suppliers/register', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Supplier account created! Welcome aboard.');
      navigate('/supplier/dashboard');
    } catch(err) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-shade flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <img src={logo} alt="Logo" className="h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark">Become a Supplier</h2>
          <p className="text-secondary text-sm mt-1">Sell your products to millions of customers</p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-6">
          {[1,2].map(s => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step>=s?'bg-primary text-white':'bg-shade-border text-secondary'}`}>{s}</div>
              {s<2 && <div className={`flex-1 h-0.5 transition-colors ${step>=2?'bg-primary':'bg-shade-border'}`}/>}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-4">
            <h3 className="font-semibold text-dark">Account Information</h3>
            {[{key:'name',label:'Full Name',type:'text',placeholder:'Your full name'},{key:'email',label:'Email',type:'email',placeholder:'your@email.com'},{key:'phone',label:'Phone',type:'tel',placeholder:'+1 234 567 8900'}].map(f=>(
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input type={f.type} required={f.key!=='phone'} placeholder={f.placeholder} className="w-full border border-shade-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})}/>
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input type={showPw?'text':'password'} required placeholder="Min 6 characters" className="w-full border border-shade-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                  value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
                <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary">{showPw?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input type="password" required placeholder="Confirm password" className="w-full border border-shade-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})}/>
            </div>
            <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-semibold transition-colors">Next →</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-semibold text-dark flex items-center gap-2"><Building className="w-4 h-4 text-primary"/> Business Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input required placeholder="Your company/business name" className="w-full border border-shade-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.company_name} onChange={e=>setForm({...form,company_name:e.target.value})}/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"><Globe className="w-3 h-3 inline mr-1"/>Country</label>
                <input placeholder="e.g. China" className="w-full border border-shade-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.country} onChange={e=>setForm({...form,country:e.target.value})}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"><MapPin className="w-3 h-3 inline mr-1"/>City</label>
                <input placeholder="e.g. Shanghai" className="w-full border border-shade-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
              <textarea rows={3} placeholder="Describe your business and products..." className="w-full border border-shade-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              ⚠️ Your account will need admin verification before you can start selling. This usually takes 24-48 hours.
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={()=>setStep(1)} className="flex-1 border border-shade-border py-3 rounded-lg text-sm font-medium text-secondary hover:bg-shade transition-colors">← Back</button>
              <button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors">{loading?'Creating...':'Create Account'}</button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-secondary mt-4">Already a supplier? <Link to="/login" className="text-primary font-medium hover:underline">Login</Link></p>
        <p className="text-center text-sm text-secondary mt-1">Customer? <Link to="/register" className="text-primary font-medium hover:underline">Register here</Link></p>
      </div>
    </div>
  );
};

export default SupplierRegister;
