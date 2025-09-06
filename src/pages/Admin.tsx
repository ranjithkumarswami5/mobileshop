import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from "date-fns"
import {
  Plus, Edit, Trash2, Package, DollarSign, Eye,
  ShoppingCart, Users, Wrench, ClipboardList, Ticket, CalendarIcon, TrendingUp
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from "@/lib/utils";

import { useAuth } from '../context/AuthContext';
import { getProducts, getUsers, getOrders, getCoupons, getServiceOrders, createProduct, updateProduct, deleteProduct, createUser, updateUser, deleteUser, createCoupon, updateCoupon, deleteCoupon, createServiceOrder, updateServiceOrder, deleteServiceOrder, getExpenses, createExpense, updateExpense, deleteExpense, getUserCoupons } from '../lib/database';
import { useToast } from '@/hooks/use-toast';
import type { Product, User, Order, Coupon, ServiceOrder } from '../types';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), "PPP");
}

// Schemas for validation
const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  price: z.number().min(1, "Price is required"),
  stock: z.number().min(0, "Stock is required"),
  imageUrl: z.string().url("Must be a valid URL"),
  category: z.enum(['phone', 'accessory']),
});

const couponSchema = z.object({
  code: z.string().min(4, "Code must be at least 4 characters").max(20),
  discountPercent: z.number().min(1).max(100),
  expiryDate: z.date().optional(),
});

const userSchema = z.object({
  email: z.string().email("Must be a valid email"),
  mobileNumber: z.string().regex(/^\d{10}$/, "Must be a valid 10-digit number"),
  referralCode: z.string().min(4, "Referral code must be at least 4 characters"),
  isAdmin: z.boolean(),
});

const serviceOrderSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  contactNumber: z.string().regex(/^\d{10}$/, "Must be a valid 10-digit number"),
  deviceModel: z.string().min(2, "Device model is required"),
  serialNumber: z.string().min(5, "Serial number is required"),
  issueDescription: z.string().min(10, "Description must be at least 10 characters"),
});

// Main Admin Component
export function Admin() {
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, usersData, ordersData, couponsData, serviceOrdersData] = await Promise.all([
          getProducts(),
          getUsers(),
          getOrders(),
          getCoupons(),
          getServiceOrders(),
        ]);
        setProducts(productsData);
        setUsers(usersData);
        setOrders(ordersData);
        setCoupons(couponsData);
        setServiceOrders(serviceOrdersData);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalInventoryValue = useMemo(() => {
    return products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  }, [products]);

  if (!user?.isAdmin) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
        <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading admin data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your products, orders, and services</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Products" value={products.length.toString()} icon={Package} color="text-blue-500" />
        <StatCard title="Total Orders" value={orders.length.toString()} icon={ShoppingCart} color="text-purple-500" />
        <StatCard title="Total Users" value={users.length.toString()} icon={Users} color="text-green-500" />
        <StatCard title="Inventory Value" value={formatPrice(totalInventoryValue)} icon={DollarSign} color="text-yellow-500" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 mb-4">
            <TabsTrigger value="products"><Package className="h-4 w-4 mr-2" />Products</TabsTrigger>
            <TabsTrigger value="orders"><ShoppingCart className="h-4 w-4 mr-2" />Orders</TabsTrigger>
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-2" />Users</TabsTrigger>
            <TabsTrigger value="accounts"><DollarSign className="h-4 w-4 mr-2" />Financials</TabsTrigger>
            <TabsTrigger value="repairs"><Wrench className="h-4 w-4 mr-2" />Repairs</TabsTrigger>
            <TabsTrigger value="service_orders"><ClipboardList className="h-4 w-4 mr-2" />Service</TabsTrigger>
            <TabsTrigger value="coupons"><Ticket className="h-4 w-4 mr-2" />Coupons</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products"><ProductsTab products={products} setProducts={setProducts} /></TabsContent>
          <TabsContent value="orders"><OrdersTab orders={orders} /></TabsContent>
          <TabsContent value="users"><UsersTab users={users} orders={orders} /></TabsContent>
          <TabsContent value="accounts"><AccountsTab orders={orders} /></TabsContent>
          <TabsContent value="repairs"><ServiceEnrollmentTab setServiceOrders={setServiceOrders} /></TabsContent>
          <TabsContent value="service_orders"><ServiceOrdersTab serviceOrders={serviceOrders} setServiceOrders={setServiceOrders} /></TabsContent>
          <TabsContent value="coupons"><CouponsTab coupons={coupons} setCoupons={setCoupons} /></TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

// Individual Tab Components

const ProductsTab = ({ products, setProducts }: { products: Product[], setProducts: React.Dispatch<React.SetStateAction<Product[]>> }) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const form = useForm({
    defaultValues: { name: '', price: '', stock: '', imageUrl: '', category: 'phone' },
  });

  const openDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      form.reset({
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
        imageUrl: product.imageUrl,
        category: product.category,
      });
    } else {
      setEditingProduct(null);
      form.reset({ name: '', price: '', stock: '', imageUrl: '', category: 'phone' });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: any) => {
    try {
      // Convert string inputs to numbers
      const processedData = {
        ...data,
        price: Number(data.price),
        stock: Number(data.stock),
      };

      if (editingProduct) {
        const updatedProduct = await updateProduct(editingProduct.id, processedData);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
        toast({ title: "Product updated!" });
      } else {
        const newProduct = await createProduct(processedData);
        setProducts(prev => [newProduct, ...prev]);
        toast({ title: "Product added!" });
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteProductHandler = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({ title: "Product deleted." });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Products Management</CardTitle>
          <Button onClick={() => openDialog()} className="rounded-xl"><Plus className="h-4 w-4 mr-2" />Add Product</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead>Image</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {products.map(p => (
                <TableRow key={p.id}>
                  <TableCell><img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded-lg" /></TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{p.category}</Badge></TableCell>
                  <TableCell>{formatPrice(p.price)}</TableCell>
                  <TableCell><Badge variant={p.stock < 10 ? "destructive" : "default"}>{p.stock}</Badge></TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" onClick={() => openDialog(p)} className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                      <Button variant="outline" size="icon" onClick={() => deleteProductHandler(p.id)} className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingProduct ? 'Edit' : 'Add'} Product</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g., iPhone 15 Pro" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" placeholder="79900" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="stock" render={({ field }) => (
                  <FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" placeholder="50" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://example.com/image.png" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem><FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="phone">Phone</SelectItem><SelectItem value="accessory">Accessory</SelectItem></SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit">Save Product</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const OrdersTab = ({ orders }: { orders: Order[] }) => {
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // Calculate original subtotal (before discount)
  const calculateOriginalSubtotal = (order: Order) => {
    return order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  // Calculate discount amount
  const calculateDiscount = (order: Order) => {
    const originalSubtotal = calculateOriginalSubtotal(order);
    return order.appliedCoupon ? originalSubtotal - order.total : 0;
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
      <CardHeader><CardTitle>Orders Management</CardTitle></CardHeader>
      <CardContent>
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Coupon</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(o => {
                const originalSubtotal = calculateOriginalSubtotal(o);
                const discount = calculateDiscount(o);

                return (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id.substring(0, 8)}...</TableCell>
                    <TableCell>{o.customerName}</TableCell>
                    <TableCell>{formatDate(o.createdAt)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{formatPrice(o.total)}</div>
                        {discount > 0 && (
                          <div className="text-xs text-muted-foreground">
                            <span className="line-through">{formatPrice(originalSubtotal)}</span>
                            <span className="text-green-600 ml-1">(-{formatPrice(discount)})</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {o.appliedCoupon ? (
                        <Badge variant="secondary">{o.appliedCoupon}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={o.status === 'Delivered' ? 'default' : o.status === 'Cancelled' ? 'destructive' : 'secondary'}>
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="icon" onClick={() => setViewingOrder(o)} className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <Dialog open={!!viewingOrder} onOpenChange={() => setViewingOrder(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>ID: {viewingOrder?.id}</DialogDescription>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <h4 className="font-medium mb-2">Customer Information</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Name:</strong> {viewingOrder.customerName}</div>
                    <div><strong>Mobile:</strong> {viewingOrder.mobileNumber}</div>
                    <div><strong>Date:</strong> {formatDate(viewingOrder.createdAt)}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Order Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Status:</strong> <Badge variant={viewingOrder.status === 'Delivered' ? 'default' : viewingOrder.status === 'Cancelled' ? 'destructive' : 'secondary'}>{viewingOrder.status}</Badge></div>
                    {viewingOrder.appliedCoupon && (
                      <div><strong>Coupon:</strong> <Badge>{viewingOrder.appliedCoupon}</Badge></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h4 className="font-medium mb-2">Delivery Address</h4>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm">
                    {viewingOrder.address}
                    {viewingOrder.pincode && <span className="block font-medium mt-1">PIN: {viewingOrder.pincode}</span>}
                  </div>
                </div>
              </div>

              {/* Items Breakdown */}
              <div>
                <h4 className="font-medium mb-3">Order Items</h4>
                <div className="space-y-2">
                  {viewingOrder.items.map(item => (
                    <div key={item.product.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatPrice(item.product.price)} × {item.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(item.product.price * item.quantity)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Price Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(calculateOriginalSubtotal(viewingOrder))}</span>
                  </div>
                  {calculateDiscount(viewingOrder) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({viewingOrder.appliedCoupon}):</span>
                      <span>-{formatPrice(calculateDiscount(viewingOrder))}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatPrice(viewingOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const UsersTab = ({ users, orders }: { users: User[], orders: Order[] }) => {

  // Calculate financial data for each user
  const userFinancialData = users.map(user => {
    const userOrders = orders.filter(order => order.userId === user.id);
    const totalSpent = userOrders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);
    const orderCount = userOrders.length;
    const avgOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;

    return {
      ...user,
      totalSpent,
      orderCount,
      avgOrderValue,
    };
  });

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);
  const totalUsers = users.length;
  const avgRevenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0;

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice(totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Revenue/User</p>
                <p className="text-2xl font-bold text-purple-600">{formatPrice(avgRevenuePerUser)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-orange-600">{orders.length}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Financial Analytics */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
        <CardHeader>
          <CardTitle>Users Financial Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Avg Order</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userFinancialData.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.email}</TableCell>
                    <TableCell>{u.mobileNumber}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{u.orderCount}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatPrice(u.totalSpent)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatPrice(u.avgOrderValue)}
                    </TableCell>
                    <TableCell>{formatDate(u.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant={u.isAdmin ? 'default' : 'secondary'}>
                        {u.isAdmin ? 'Admin' : 'User'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AccountsTab = ({ orders }: { orders: Order[] }) => {
  const { toast } = useToast();
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await getExpenses();
        setExpenses(data);
      } catch (error) {
        console.error('Error fetching expenses:', error);
        toast({
          title: "Error",
          description: "Failed to load expenses. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  // Calculate financial metrics
  const totalIncome = orders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  const expenseCategories = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const form = useForm({
    defaultValues: { description: '', amount: '', category: 'Rent', date: new Date().toISOString().split('T')[0] },
  });

  const onSubmitExpense = async (data: any) => {
    try {
      const newExpense = await createExpense({
        description: data.description,
        amount: Number(data.amount),
        category: data.category,
        date: data.date,
      });
      setExpenses(prev => [newExpense, ...prev]);
      toast({ title: "Expense added successfully!" });
      setIsExpenseDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice(totalIncome)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatPrice(totalExpenses)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPrice(netProfit)}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profitMargin.toFixed(1)}%
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Categories Breakdown */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(expenseCategories).map(([category, amount]) => (
              <div key={category} className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">{category}</p>
                <p className="text-lg font-bold text-red-600">{formatPrice(amount as number)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expenses Management */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Expenses Management</CardTitle>
            <Button onClick={() => setIsExpenseDialogOpen(true)} className="rounded-xl" disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />Add Expense
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading expenses...</p>
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No expenses found. Add your first expense to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map(expense => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{expense.category}</Badge>
                        </TableCell>
                        <TableCell className="font-medium text-red-600">
                          {formatPrice(expense.amount)}
                        </TableCell>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="mr-2">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Expense Dialog */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Expense</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitExpense)} className="space-y-4">
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="e.g., Monthly Rent" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="amount" render={({ field }) => (
                  <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" placeholder="15000" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem><FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Rent">Rent</SelectItem>
                        <SelectItem value="Utilities">Utilities</SelectItem>
                        <SelectItem value="Inventory">Inventory</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit">Add Expense</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ServiceEnrollmentTab = ({ setServiceOrders }: { setServiceOrders: React.Dispatch<React.SetStateAction<ServiceOrder[]>> }) => {
  const { toast } = useToast();
  const [userCoupons, setUserCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [step, setStep] = useState<'mobile' | 'details'>('mobile');

  const mobileForm = useForm({
    defaultValues: { contactNumber: '' },
  });

  const detailsForm = useForm({
    defaultValues: {
      customerName: '',
      deviceModel: '',
      serialNumber: '',
      issueDescription: '',
      price: '',
      appliedCoupon: ''
    },
  });

  const handleMobileLookup = async (data: any) => {
    try {
      setLoadingCoupons(true);
      const coupons = await getUserCoupons(data.contactNumber);
      setUserCoupons(coupons);
      setStep('details');

      // Pre-fill customer name if user exists
      try {
        const users = await getUsers();
        const user = users.find(u => u.mobileNumber === data.contactNumber);
        if (user) {
          detailsForm.setValue('customerName', user.email.split('@')[0]); // Use email prefix as name
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    } catch (error) {
      console.error('Error fetching user coupons:', error);
      toast({
        title: "No coupons found",
        description: "This mobile number has no available coupons, but you can still create the service order.",
      });
      setUserCoupons([]);
      setStep('details');
    } finally {
      setLoadingCoupons(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const contactNumber = mobileForm.getValues('contactNumber');
      const newServiceOrder = await createServiceOrder({
        customerName: data.customerName,
        contactNumber: contactNumber,
        deviceModel: data.deviceModel,
        serialNumber: data.serialNumber,
        issueDescription: data.issueDescription,
        price: data.price ? Number(data.price) : undefined,
        appliedCoupon: data.appliedCoupon || null,
        status: 'Pending',
      });
      setServiceOrders(prev => [newServiceOrder, ...prev]);
      toast({ title: "Service order created!" });

      // Reset forms and go back to mobile step
      mobileForm.reset();
      detailsForm.reset();
      setStep('mobile');
      setUserCoupons([]);
    } catch (error: any) {
      console.error('Error creating service order:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create service order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
      <CardHeader><CardTitle>Repairs & Service Enrollment</CardTitle></CardHeader>
      <CardContent>
        {step === 'mobile' ? (
          <Form {...mobileForm}>
            <form onSubmit={mobileForm.handleSubmit(handleMobileLookup)} className="space-y-4 max-w-lg mx-auto">
              <FormField control={mobileForm.control} name="contactNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Mobile Number</FormLabel>
                  <FormControl><Input type="tel" placeholder="9876543210" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={loadingCoupons}>
                {loadingCoupons ? 'Looking up coupons...' : 'Lookup Customer Coupons'}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Service Details</h3>
              <Button variant="outline" size="sm" onClick={() => setStep('mobile')}>
                Change Mobile Number
              </Button>
            </div>

            <Form {...detailsForm}>
              <form onSubmit={detailsForm.handleSubmit(onSubmit)} className="space-y-4 max-w-lg mx-auto">
                <FormField control={detailsForm.control} name="customerName" render={({ field }) => (
                  <FormItem><FormLabel>Customer Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={detailsForm.control} name="deviceModel" render={({ field }) => (
                  <FormItem><FormLabel>Device Model</FormLabel><FormControl><Input placeholder="e.g., iPhone 14 Pro" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={detailsForm.control} name="serialNumber" render={({ field }) => (
                  <FormItem><FormLabel>Serial Number</FormLabel><FormControl><Input placeholder="F17G83JCH21" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={detailsForm.control} name="issueDescription" render={({ field }) => (
                  <FormItem><FormLabel>Issue Description</FormLabel><FormControl><Textarea placeholder="Describe the issue with the device..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={detailsForm.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>Service Price (₹)</FormLabel><FormControl><Input type="number" placeholder="5000" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={detailsForm.control} name="appliedCoupon" render={({ field }) => (
                  <FormItem><FormLabel>Coupon Code (Optional)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === "none" ? "" : value)} value={field.value || "none"}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a coupon" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="none">No coupon</SelectItem>
                        {userCoupons.map((coupon: any) => (
                          <SelectItem key={coupon.id} value={coupon.code}>
                            {coupon.code} ({coupon.discountPercent}% off)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {userCoupons.length === 0 && (
                      <p className="text-sm text-muted-foreground">No coupons available for this customer</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep('mobile')} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1">Create Service Order</Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ServiceOrdersTab = ({ serviceOrders, setServiceOrders }: { serviceOrders: ServiceOrder[], setServiceOrders: React.Dispatch<React.SetStateAction<ServiceOrder[]>> }) => {
  const { toast } = useToast();
  
  const updateStatus = async (id: string, status: ServiceOrder['status']) => {
    try {
      const serviceOrder = serviceOrders.find(so => so.id === id);
      if (serviceOrder) {
        const updatedServiceOrder = await updateServiceOrder(id, { ...serviceOrder, status });
        setServiceOrders(prev => prev.map(so => so.id === id ? updatedServiceOrder : so));
        toast({ title: "Status updated!" });
      }
    } catch (error) {
      console.error('Error updating service order status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
      <CardHeader><CardTitle>Service Orders</CardTitle></CardHeader>
      <CardContent>
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Coupon</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceOrders.map(so => (
                <TableRow key={so.id}>
                  <TableCell>{so.customerName}</TableCell>
                  <TableCell>{so.deviceModel}</TableCell>
                  <TableCell>
                    {so.price ? formatPrice(so.price) : <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>
                    {so.appliedCoupon ? (
                      <Badge variant="secondary">{so.appliedCoupon}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(so.createdAt)}</TableCell>
                  <TableCell>
                    <Select value={so.status} onValueChange={(value) => updateStatus(so.id, value as ServiceOrder['status'])}>
                      <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const CouponsTab = ({ coupons, setCoupons }: { coupons: Coupon[], setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>> }) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const form = useForm<z.infer<typeof couponSchema>>({ resolver: zodResolver(couponSchema) });

  const onSubmit = async (data: z.infer<typeof couponSchema>) => {
    try {
      const newCoupon = await createCoupon({
        ...data,
        isActive: true,
        expiryDate: data.expiryDate?.toISOString(),
      });
      setCoupons(prev => [newCoupon, ...prev]);
      toast({ title: "Coupon created!" });
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast({
        title: "Error",
        description: "Failed to create coupon. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Coupons Enrollment</CardTitle>
          <Button onClick={() => setIsDialogOpen(true)} className="rounded-xl"><Plus className="h-4 w-4 mr-2" />Create Coupon</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Discount</TableHead><TableHead>Status</TableHead><TableHead>Expires</TableHead></TableRow></TableHeader>
            <TableBody>
              {coupons.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono">{c.code}</TableCell>
                  <TableCell>{c.discountPercent}%</TableCell>
                  <TableCell><Badge variant={c.isActive ? 'default' : 'destructive'}>{c.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                  <TableCell>{c.expiryDate ? formatDate(c.expiryDate) : 'Never'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Coupon</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem><FormLabel>Coupon Code</FormLabel><FormControl><Input placeholder="e.g., SUMMER25" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="discountPercent" render={({ field }) => (
                <FormItem><FormLabel>Discount (%)</FormLabel><FormControl><Input type="number" placeholder="10" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="expiryDate" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Expiry Date (Optional)</FormLabel>
                  <Popover><PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover><FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit">Create Coupon</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// Helper Components
const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: React.ElementType, color: string }) => (
  <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </CardContent>
  </Card>
);
