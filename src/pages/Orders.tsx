import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Calendar, MapPin, CreditCard, ShoppingBag, Tag, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import { getUserOrders } from '../lib/database';
import type { Order } from '../types';
import { Link } from 'react-router-dom';

export function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="space-y-4">
          <Package className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-3xl font-bold">Login Required</h2>
          <p className="text-muted-foreground">
            Please log in to view your order history
          </p>
          <Button asChild className="rounded-xl">
            <Link to="/auth">Login</Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground">
          Track and manage your order history
        </p>
      </motion.div>

      {/* Order Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { 
              label: 'Total Orders', 
              value: orders.length.toString(), 
              color: 'text-primary',
              icon: Package
            },
            { 
              label: 'Delivered', 
              value: orders.filter(o => o.status.toLowerCase() === 'delivered').length.toString(), 
              color: 'text-green-500',
              icon: CheckCircle
            },
            { 
              label: 'In Transit', 
              value: orders.filter(o => o.status.toLowerCase() === 'shipped').length.toString(), 
              color: 'text-blue-500',
              icon: Truck
            },
            { 
              label: 'Total Spent', 
              value: formatPrice(orders.reduce((sum, order) => sum + order.total, 0)), 
              color: 'text-purple-500',
              icon: CreditCard
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
                <CardContent className="p-6 text-center space-y-2">
                  <stat.icon className={`h-8 w-8 mx-auto ${stat.color}`} />
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Orders List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {loading ? (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50 animate-pulse" />
              <p className="text-muted-foreground">Loading your orders...</p>
            </CardContent>
          </Card>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Order Info */}
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono text-sm text-muted-foreground">
                                #{order.id.slice(-8)}
                              </span>
                            </div>
                            <Badge className={`text-xs flex items-center gap-1 ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-xl font-bold text-primary">
                              <CreditCard className="h-4 w-4" />
                              {formatPrice(order.total)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Ordered on {formatDate(order.createdAt)}</span>
                          </div>
                          
                          {order.appliedCoupon && (
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4" />
                              <span>Coupon: {order.appliedCoupon}</span>
                            </div>
                          )}
                        </div>

                        {order.address && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{order.address}</span>
                            {order.pincode && <span className="ml-2">- {order.pincode}</span>}
                          </div>
                        )}

                        {/* Order Items */}
                        {order.items && Array.isArray(order.items) && (
                          <div className="bg-muted/20 rounded-lg p-4">
                            <h4 className="font-medium mb-2">Items ({order.items.length})</h4>
                            <div className="space-y-2">
                              {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                  <span className="flex-1">
                                    {item.product?.name || 'Product'} 
                                    <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                                  </span>
                                  <span className="font-medium">
                                    {formatPrice((item.product?.price || 0) * item.quantity)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
            <CardContent className="p-8 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">
                Start shopping to see your order history here!
              </p>
              <Button asChild className="rounded-xl">
                <Link to="/">Start Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}