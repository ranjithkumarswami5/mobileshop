import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from "date-fns"
import {
  Plus, Edit, Trash2, Package, DollarSign, TrendingUp, Eye,
  ShoppingCart, Users, Wrench, ClipboardList, Ticket, CalendarIcon
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { useAuth } from '../context/AuthContext';
import { getProducts, getUsers, getOrders, getCoupons, getServiceOrders } from '../lib/database';
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

  // Always call useMemo to maintain hook order
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
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-4">
            <TabsTrigger value="products"><Package className="h-4 w-4 mr-2" />Products</TabsTrigger>
            <TabsTrigger value="orders"><ShoppingCart className="h-4 w-4 mr-2" />Orders</TabsTrigger>
            <TabsTrigger value="accounts"><Users className="h-4 w-4 mr-2" />Accounts</TabsTrigger>
            <TabsTrigger value="repairs"><Wrench className="h-4 w-4 mr-2" />Repairs</TabsTrigger>
            <TabsTrigger value="service_orders"><ClipboardList className="h-4 w-4 mr-2" />Service</TabsTrigger>
            <TabsTrigger value="coupons"><Ticket className="h-4 w-4 mr-2" />Coupons</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products"><ProductsTab products={products} setProducts={setProducts} /></TabsContent>
          <TabsContent value="orders"><OrdersTab orders={orders} /></TabsContent>
          <TabsContent value="accounts"><AccountsTab users={users} setUsers={setUsers} /></TabsContent>
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

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', price: 0, stock: 0, imageUrl: '', category: 'phone' as const },
  });

  const openDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      form.reset(product);
    } else {
      setEditingProduct(null);
      form.reset({ name: '', price: 0, stock: 0, imageUrl: '', category: 'phone' });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (data: z.infer<typeof productSchema>) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...data } : p));
      toast({ title: "Product updated!" });
    } else {
      setProducts(prev => [{ ...data, id: Date.now().toString() }, ...prev]);
      toast({ title: "Product added!" });
    }
    setIsDialogOpen(false);
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast({ title: "Product deleted." });
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
                      <Button variant="outline" size="icon" onClick={() => deleteProduct(p.id)} className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Form fields here */}
            <Button type="submit">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const OrdersTab = ({ orders }: { orders: Order[] }) => {
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
      <CardHeader><CardTitle>Orders Management</CardTitle></CardHeader>
      <CardContent>
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead>Order ID</TableHead><TableHead>Customer</TableHead><TableHead>Date</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {orders.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.id.substring(0, 8)}...</TableCell>
                  <TableCell>{o.customerName}</TableCell>
                  <TableCell>{formatDate(o.createdAt)}</TableCell>
                  <TableCell>{formatPrice(o.total)}</TableCell>
                  <TableCell><Badge variant={o.status === 'Delivered' ? 'default' : o.status === 'Cancelled' ? 'destructive' : 'secondary'}>{o.status}</Badge></TableCell>
                  <TableCell><Button variant="outline" size="icon" onClick={() => setViewingOrder(o)} className="h-8 w-8"><Eye className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <Dialog open={!!viewingOrder} onOpenChange={() => setViewingOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Order Details</DialogTitle><DialogDescription>ID: {viewingOrder?.id}</DialogDescription></DialogHeader>
          {viewingOrder && <div className="space-y-4">
            <div><strong>Customer:</strong> {viewingOrder.customerName}</div>
            <div><strong>Date:</strong> {formatDate(viewingOrder.createdAt)}</div>
            <div><strong>Total:</strong> {formatPrice(viewingOrder.total)}</div>
            <div className="space-y-2"><strong>Items:</strong>
              {viewingOrder.items.map(item => <div key={item.product.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-lg"><span>{item.product.name} (x{item.quantity})</span><span>{formatPrice(item.product.price * item.quantity)}</span></div>)}
            </div>
          </div>}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const AccountsTab = ({ users, setUsers }: { users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>> }) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const userSchema = z.object({
    email: z.string().email("Must be a valid email"),
    mobileNumber: z.string().regex(/^\d{10}$/, "Must be a valid 10-digit number"),
    referralCode: z.string().min(4, "Referral code must be at least 4 characters"),
    isAdmin: z.boolean(),
  });

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: { email: '', mobileNumber: '', referralCode: '', isAdmin: false },
  });

  const toggleAdmin = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isAdmin: !u.isAdmin } : u));
    toast({ title: "User role updated." });
  };

  const onSubmit = (data: z.infer<typeof userSchema>) => {
    const newUser: User = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [newUser, ...prev]);
    toast({ title: "User account created!" });
    setIsDialogOpen(false);
    form.reset();
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Accounts Maintenance</CardTitle>
          <Button onClick={() => setIsDialogOpen(true)} className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" />Create Account
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Mobile Number</TableHead><TableHead>Referral Code</TableHead><TableHead>Joined</TableHead><TableHead>Is Admin</TableHead></TableRow></TableHeader>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell>{u.mobileNumber}</TableCell>
                  <TableCell className="font-mono text-sm">{u.referralCode}</TableCell>
                  <TableCell>{formatDate(u.createdAt)}</TableCell>
                  <TableCell><Switch checked={u.isAdmin} onCheckedChange={() => toggleAdmin(u.id)} disabled={u.email === 'admin@example.com'} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Account</DialogTitle></DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Controller
                name="email"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    {...field}
                  />
                )}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Controller
                name="mobileNumber"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="mobileNumber"
                    type="tel"
                    placeholder="9876543210"
                    {...field}
                  />
                )}
              />
              {form.formState.errors.mobileNumber && (
                <p className="text-sm text-red-500">{form.formState.errors.mobileNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="referralCode">Referral Code</Label>
              <Controller
                name="referralCode"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="referralCode"
                    placeholder="REF-ABC123"
                    {...field}
                  />
                )}
              />
              {form.formState.errors.referralCode && (
                <p className="text-sm text-red-500">{form.formState.errors.referralCode.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="isAdmin"
                control={form.control}
                render={({ field }) => (
                  <Switch
                    id="isAdmin"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isAdmin">Admin Privileges</Label>
            </div>

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Creating...' : 'Create Account'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const ServiceEnrollmentTab = ({ setServiceOrders }: { setServiceOrders: React.Dispatch<React.SetStateAction<ServiceOrder[]>> }) => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof serviceOrderSchema>>({
    resolver: zodResolver(serviceOrderSchema),
    defaultValues: { customerName: '', contactNumber: '', deviceModel: '', serialNumber: '', issueDescription: '' } as const,
  });

  const onSubmit = (data: z.infer<typeof serviceOrderSchema>) => {
    const newServiceOrder: ServiceOrder = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'Pending',
    };
    setServiceOrders(prev => [newServiceOrder, ...prev]);
    toast({ title: "Service order created!" });
    form.reset();
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
      <CardHeader><CardTitle>Repairs & Service Enrollment</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg mx-auto">
          {/* Form fields here */}
          <Button type="submit" className="w-full">Create Service Order</Button>
        </form>
      </CardContent>
    </Card>
  );
};

const ServiceOrdersTab = ({ serviceOrders, setServiceOrders }: { serviceOrders: ServiceOrder[], setServiceOrders: React.Dispatch<React.SetStateAction<ServiceOrder[]>> }) => {
  const { toast } = useToast();
  
  const updateStatus = (id: string, status: ServiceOrder['status']) => {
    setServiceOrders(prev => prev.map(so => so.id === id ? { ...so, status } : so));
    toast({ title: "Status updated!" });
  };
  
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
      <CardHeader><CardTitle>Service Orders</CardTitle></CardHeader>
      <CardContent>
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Device</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {serviceOrders.map(so => (
                <TableRow key={so.id}>
                  <TableCell>{so.customerName}</TableCell>
                  <TableCell>{so.deviceModel}</TableCell>
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

  const onSubmit = (data: z.infer<typeof couponSchema>) => {
    const newCoupon: Coupon = {
      ...data,
      id: Date.now().toString(),
      isActive: true,
      usageCount: 0,
      expiryDate: data.expiryDate?.toISOString(),
    };
    setCoupons(prev => [newCoupon, ...prev]);
    toast({ title: "Coupon created!" });
    setIsDialogOpen(false);
    form.reset();
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Form fields here */}
            <Button type="submit">Create Coupon</Button>
          </form>
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
