import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Header from './components/Header';
import Chatbot from './components/Chatbot';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import HelpPage from './pages/HelpPage';
import SupplierPublicProfile from './pages/SupplierPublicProfile';

// Admin
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminNewsletter from './pages/admin/AdminNewsletter';
import AdminInquiries from './pages/admin/AdminInquiries';
import AdminRegions from './pages/admin/AdminRegions';
import AdminMessages from './pages/admin/AdminMessages';
import AdminSettings from './pages/admin/AdminSettings';
import AdminDeals from './pages/admin/AdminDeals';
import AdminSuppliers from './pages/admin/AdminSuppliers';

// Supplier
import SupplierRegister from './pages/supplier/SupplierRegister';
import SupplierLayout from './pages/supplier/SupplierLayout';
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import SupplierProducts from './pages/supplier/SupplierProducts';
import { SupplierOrders, SupplierMessages, SupplierReports, SupplierProfile } from './pages/supplier/SupplierPages';

const SupplierRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return <Login />;
  if (user.role !== 'supplier') return <div className="flex items-center justify-center h-screen"><div className="text-center"><h2 className="text-xl font-bold text-gray-700 mb-2">Supplier Access Only</h2><a href="/" className="text-blue-500 hover:underline">Go Home</a></div></div>;
  return children;
};

const HomeLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-grow">{children}</main>
  </div>
);

const PageLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-shade">
    <Header />
    <main className="flex-grow">{children}</main>
    <footer className="bg-white border-t border-shade-border py-4 text-center text-sm text-secondary">
      © 2024 Ecommerce Store. All rights reserved.
    </footer>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster position="top-right" toastOptions={{ duration:3500, style:{borderRadius:'8px',fontSize:'13px'} }}/>
            <Routes>
              {/* Public */}
              <Route path="/" element={<HomeLayout><Home/></HomeLayout>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path="/register" element={<Register/>}/>
              <Route path="/register/supplier" element={<SupplierRegister/>}/>
              <Route path="/products" element={<PageLayout><Products/></PageLayout>}/>
              <Route path="/products/:id" element={<PageLayout><ProductDetails/></PageLayout>}/>
              <Route path="/messages" element={<PageLayout><Messages/></PageLayout>}/>
              <Route path="/help" element={<PageLayout><HelpPage/></PageLayout>}/>
              <Route path="/help/:id" element={<PageLayout><HelpPage/></PageLayout>}/>
              <Route path="/supplier-profile/:id" element={<PageLayout><SupplierPublicProfile/></PageLayout>}/>
              {/* Protected */}
              <Route path="/cart" element={<ProtectedRoute><PageLayout><Cart/></PageLayout></ProtectedRoute>}/>
              <Route path="/orders" element={<ProtectedRoute><PageLayout><Orders/></PageLayout></ProtectedRoute>}/>
              <Route path="/profile" element={<ProtectedRoute><PageLayout><Profile/></PageLayout></ProtectedRoute>}/>
              {/* Admin */}
              <Route path="/admin" element={<AdminRoute><AdminLayout/></AdminRoute>}>
                <Route index element={<AdminDashboard/>}/>
                <Route path="products" element={<AdminProducts/>}/>
                <Route path="orders" element={<AdminOrders/>}/>
                <Route path="users" element={<AdminUsers/>}/>
                <Route path="categories" element={<AdminCategories/>}/>
                <Route path="deals" element={<AdminDeals/>}/>
                <Route path="newsletter" element={<AdminNewsletter/>}/>
                <Route path="inquiries" element={<AdminInquiries/>}/>
                <Route path="messages" element={<AdminMessages/>}/>
                <Route path="regions" element={<AdminRegions/>}/>
                <Route path="settings" element={<AdminSettings/>}/>
                <Route path="suppliers" element={<AdminSuppliers/>}/>
              </Route>
              {/* Supplier */}
              <Route path="/supplier" element={<SupplierRoute><SupplierLayout/></SupplierRoute>}>
                <Route path="dashboard" element={<SupplierDashboard/>}/>
                <Route path="products" element={<SupplierProducts/>}/>
                <Route path="orders" element={<SupplierOrders/>}/>
                <Route path="messages" element={<SupplierMessages/>}/>
                <Route path="reports" element={<SupplierReports/>}/>
                <Route path="profile" element={<SupplierProfile/>}/>
              </Route>
              {/* 404 */}
              <Route path="*" element={<PageLayout><div className="max-w-4xl mx-auto px-4 py-20 text-center"><h1 className="text-7xl font-bold text-shade-border">404</h1><p className="text-secondary mt-3 mb-6">Page not found</p><a href="/" className="bg-primary text-white px-6 py-2.5 rounded-md font-medium hover:bg-primary-dark transition-colors inline-block">Go Home</a></div></PageLayout>}/>
            </Routes>
            <Chatbot/>
          </CartProvider>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
export default App;
