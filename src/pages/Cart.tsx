import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, Tag, CheckCircle, MapPin, Phone, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getCoupons } from '../lib/database';
import type { Coupon } from '../types';

export function Cart() {
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    mobileNumber: '',
    address: '',
    pincode: '',
    couponCode: ''
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const applyCoupon = (code?: string) => {
    const codeToApply = code || couponCode;
    const coupon = availableCoupons.find(c => c.code === codeToApply);
    if (coupon && coupon.isActive) {
      setAppliedCoupon({ code: coupon.code, discount: coupon.discountPercent });
      toast({
        title: "Coupon applied!",
        description: `You saved ${coupon.discountPercent}% with code ${coupon.code}`,
      });
      setCouponCode('');
    } else {
      toast({
        title: "Invalid coupon",
        description: "Please check your coupon code and try again.",
        variant: "destructive",
      });
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast({
      title: "Coupon removed",
      description: "The coupon has been removed from your order.",
    });
  };

  const discount = appliedCoupon ? (total * appliedCoupon.discount) / 100 : 0;
  const finalTotal = total - discount;

  // Load available coupons
  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const coupons = await getCoupons();
        setAvailableCoupons(coupons.filter(coupon => coupon.isActive));
      } catch (error) {
        console.error('Error loading coupons:', error);
      }
    };
    loadCoupons();
  }, []);

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to place your order.",
      });
      navigate('/auth', { state: { from: location } });
      return;
    }

    setShowOrderDialog(true);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    try {
      // Create order via API
      const orderData = {
        customerName: orderForm.customerName,
        userId: user?.id,
        total: finalTotal,
        items: items,
        appliedCoupon: appliedCoupon?.code,
        address: orderForm.address,
        mobileNumber: orderForm.mobileNumber,
        pincode: orderForm.pincode,
      };

      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        toast({
          title: "Order placed successfully!",
          description: `Your order for ${formatPrice(finalTotal)} has been confirmed.`,
        });

        clearCart();
        setAppliedCoupon(null);
        setShowOrderDialog(false);
        setOrderForm({
          customerName: '',
          mobileNumber: '',
          address: '',
          pincode: '',
          couponCode: ''
        });
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Order failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="space-y-4">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-3xl font-bold">Your cart is empty</h2>
          <p className="text-muted-foreground">
            Add some products to your cart to get started
          </p>
          <Button asChild className="rounded-xl">
            <Link to="/">Continue Shopping</Link>
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
        <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground">
          {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => (
            <motion.div
              key={item.product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-24 h-24 sm:w-20 sm:h-20 object-cover rounded-xl self-center sm:self-auto"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-lg">{item.product.name}</h3>
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                        <Badge variant="outline" className="capitalize">
                          {item.product.category}
                        </Badge>
                        <span className="text-muted-foreground text-sm">•</span>
                        <span className="text-sm text-muted-foreground">
                          {item.product.stock} in stock
                        </span>
                      </div>
                      <p className="text-xl font-bold text-primary">
                        {formatPrice(item.product.price)}
                      </p>
                    </div>

                    <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end sm:space-x-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="h-8 w-8 p-0 rounded-lg"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="h-8 w-8 p-0 rounded-lg"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Coupon Code
                </h4>
                
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-primary/20">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-primary mr-2" />
                      <span className="font-medium text-primary">{appliedCoupon.code}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeCoupon}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="rounded-xl"
                      />
                      <Button
                        variant="outline"
                        onClick={() => applyCoupon()}
                        disabled={!couponCode.trim()}
                        className="rounded-xl"
                      >
                        Apply
                      </Button>
                    </div>
                    
                    {/* Available Coupons Display */}
                    {availableCoupons.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Available coupons:</p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {availableCoupons.slice(0, 3).map((coupon) => (
                            <div
                              key={coupon.id}
                              className="flex items-center justify-between p-2 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() => applyCoupon(coupon.code)}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs font-medium">
                                    {coupon.code}
                                  </Badge>
                                  <span className="text-sm font-medium text-green-600">
                                    {coupon.discountPercent}% OFF
                                  </span>
                                </div>
                                {coupon.expiryDate && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-6 px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCouponCode(coupon.code);
                                }}
                              >
                                Use
                              </Button>
                            </div>
                          ))}
                          {availableCoupons.length > 3 && (
                            <p className="text-xs text-muted-foreground text-center">
                              +{availableCoupons.length - 3} more coupons available
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount ({appliedCoupon.discount}%)</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full rounded-xl bg-primary hover:bg-primary/90"
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </Button>
              
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Order Confirmation Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirm Your Order</DialogTitle>
            <DialogDescription>
              Please provide your delivery details to complete your order.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Order Summary */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Order Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Items ({items.length})</span>
                  <span>{formatPrice(total)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon.discount}%)</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Details Form */}
            <div className="space-y-4">
              <h4 className="font-medium">Delivery Details</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name</Label>
                  <Input
                    id="customerName"
                    placeholder="Enter your full name"
                    value={orderForm.customerName}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, customerName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number</Label>
                  <Input
                    id="mobileNumber"
                    placeholder="Enter mobile number"
                    value={orderForm.mobileNumber}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, mobileNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address</Label>
                <Input
                  id="address"
                  placeholder="Enter your complete address"
                  value={orderForm.address}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pin Code</Label>
                <Input
                  id="pincode"
                  placeholder="Enter pin code"
                  value={orderForm.pincode}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, pincode: e.target.value }))}
                />
              </div>
            </div>


            {/* Coupon Code Input */}
            <div className="space-y-2">
              <Label htmlFor="couponCode">Coupon Code (Optional)</Label>
              <Input
                id="couponCode"
                placeholder="Enter coupon code"
                value={orderForm.couponCode}
                onChange={(e) => setOrderForm(prev => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowOrderDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePlaceOrder}
                disabled={isProcessing || !orderForm.customerName || !orderForm.mobileNumber || !orderForm.address || !orderForm.pincode}
                className="flex-1"
              >
                {isProcessing ? 'Placing Order...' : 'Place Order'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
