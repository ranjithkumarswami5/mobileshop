import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Layout } from './components/Layout/Layout';
import { Auth } from './pages/Auth';
import { Home } from './pages/Home';
import { Cart } from './pages/Cart';
import { Orders } from './pages/Orders';
import { Referral } from './pages/Referral';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { Preloader } from './components/Preloader';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ProductDetail } from './pages/ProductDetail';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Preloader />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route 
            path="/auth" 
            element={user ? <Navigate to="/" replace /> : <Auth />} 
          />
          <Route 
            path="/signup" 
            element={user ? <Navigate to="/" replace /> : <Auth />} 
          />
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/product/:id" element={<ProductDetail />} />

                  {/* Protected Routes */}
                  <Route
                    path="/orders"
                    element={<ProtectedRoute><Orders /></ProtectedRoute>}
                  />
                  <Route
                    path="/profile"
                    element={<ProtectedRoute><Profile /></ProtectedRoute>}
                  />
                  <Route
                    path="/referral"
                    element={<ProtectedRoute><Referral /></ProtectedRoute>}
                  />
                  <Route
                    path="/admin"
                    element={<ProtectedRoute><Admin /></ProtectedRoute>}
                  />
                </Routes>
              </Layout>
            }
          />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
