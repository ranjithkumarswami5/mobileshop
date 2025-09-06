import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Gift, Mail, Hash, Crown, Tag, Phone, Package, Calendar, MapPin, CreditCard, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import { mockCoupons } from '../lib/mockData';
import { getUserOrders } from '../lib/database';
import type { Order } from '../types';

export function Profile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllOrders, setShowAllOrders] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'shipped': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  // Load user orders
  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.email) return;
      
      try {
        setLoading(true);
        const userOrders = await getUserOrders(user.email);
        setOrders(userOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user?.email]);

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <p className="text-muted-foreground">Please log in to view your profile</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your account and view your coupons</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl card-shadow-dark">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-primary" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Mobile Number</p>
                    <p className="font-medium">{user.mobileNumber}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Referral Code</p>
                    <p className="font-mono font-medium">{user.referralCode}</p>
                  </div>
                </div>

                {user.referredBy && (
                  <div className="flex items-center space-x-3">
                    <Gift className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Referred By</p>
                      <p className="font-mono font-medium">{user.referredBy}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Crown className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Account Type</p>
                    <Badge variant={user.isAdmin ? "default" : "secondary"}>
                      {user.isAdmin ? "Admin" : "Customer"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Coupons */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl card-shadow-dark">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="h-5 w-5 mr-2 text-primary" />
                My Coupons
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockCoupons.length > 0 ? (
                <div className="space-y-3">
                  {mockCoupons.map((coupon, index) => (
                    <motion.div
                      key={coupon.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className={`p-4 rounded-xl border ${
                        coupon.isUsed 
                          ? 'bg-muted/20 border-muted text-muted-foreground' 
                          : 'bg-primary/10 border-primary/20 text-primary'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Tag className="h-4 w-4" />
                          <div>
                            <p className="font-mono font-medium">{coupon.code}</p>
                            <p className="text-sm opacity-75">
                              {coupon.discountPercent}% discount
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={coupon.isUsed ? "secondary" : "default"}
                          className="ml-2"
                        >
                          {coupon.isUsed ? "Used" : "Available"}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Gift className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No coupons available</p>
                  <p className="text-sm">Complete your first purchase or refer friends to earn coupons!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Account Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl card-shadow-dark">
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Orders', value: orders.length.toString(), color: 'text-primary' },
                { label: 'Active Coupons', value: mockCoupons.filter(c => !c.isUsed).length.toString(), color: 'text-green-500' },
                { label: 'Used Coupons', value: mockCoupons.filter(c => c.isUsed).length.toString(), color: 'text-orange-500' },
                { label: 'Total Spent', value: formatPrice(orders.reduce((sum, order) => sum + order.total, 0)), color: 'text-blue-500' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="text-center space-y-2"
                >
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Order History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl card-shadow-dark">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary" />
                Order History
              </div>
              {orders.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllOrders(!showAllOrders)}
                  className="text-primary hover:text-primary/80"
                >
                  {showAllOrders ? 'Show Less' : `View All (${orders.length})`}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50 animate-pulse" />
                <p>Loading your orders...</p>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {(showAllOrders ? orders : orders.slice(0, 3)).map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    className="p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm text-muted-foreground">
                              #{order.id.slice(-8)}
                            </span>
                          </div>
                          <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                            {order.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(order.createdAt)}
                          </div>
                          {order.appliedCoupon && (
                            <div className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {order.appliedCoupon}
                            </div>
                          )}
                        </div>

                        {order.address && (
                          <div className="flex items-start gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">{order.address}</span>
                          </div>
                        )}

                        {/* Order Items */}
                        {order.items && Array.isArray(order.items) && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">{order.items.length} item(s):</span>
                            <span className="ml-2">
                              {order.items.map((item: any, idx: number) => (
                                <span key={idx}>
                                  {item.product?.name || 'Product'} (x{item.quantity})
                                  {idx < order.items.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-lg font-bold text-primary">
                          <CreditCard className="h-4 w-4" />
                          {formatPrice(order.total)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No orders yet</p>
                <p className="text-sm">Start shopping to see your order history here!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
