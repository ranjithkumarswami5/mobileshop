import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Smartphone, Headphones, Gift } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProductCard } from '../components/ProductCard';
import { getProducts } from '../lib/database';
import type { Product } from '../types';

export function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'phone' | 'accessory'>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, products]);

  const categories = [
    { id: 'all', label: 'All Products', icon: Filter },
    { id: 'phone', label: 'Phones', icon: Smartphone },
    { id: 'accessory', label: 'Accessories', icon: Headphones },
  ];
  
  const AdBanner = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="col-span-full bg-gradient-to-r from-primary/10 to-teal-500/10 p-6 rounded-2xl my-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-primary/20"
    >
      <div className="flex items-center gap-4">
        <Gift className="h-10 w-10 text-primary hidden md:block" />
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-primary">Weekend Special!</h3>
          <p className="text-muted-foreground">Get an extra 20% off on all accessories. Use code: <span className="font-bold text-foreground">WEEKEND20</span></p>
        </div>
      </div>
      <Button className="rounded-xl mt-4 md:mt-0" onClick={() => setSelectedCategory('accessory')}>Shop Accessories</Button>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-red-500 bg-clip-text text-transparent">
          Welcome to Devi Sri Mobiles
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover the latest smartphones and accessories at unbeatable prices
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="relative max-w-md mx-auto group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10 pointer-events-none" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="relative pl-10 rounded-xl bg-card/50 backdrop-blur-sm border-border/50"
          />
          <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
            <div 
              className="absolute w-1/2 h-full bg-gradient-to-r from-transparent to-primary/10 opacity-0 
                         group-hover:opacity-100 group-focus-within:opacity-100 
                         group-focus-within:animate-shine-ray transition-opacity duration-500"
            ></div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={selectedCategory === id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(id as any)}
              className="rounded-xl"
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Products Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.slice(0, 4).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}

            {filteredProducts.length > 4 && <AdBanner />}

            {filteredProducts.slice(4).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index + 4} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="space-y-4">
              <Search className="h-16 w-16 text-muted-foreground mx-auto" />
              <h3 className="text-2xl font-semibold">No products found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-row gap-2 sm:gap-4 md:gap-6 mt-12 overflow-x-auto"
      >
        {[
          { label: 'Total Products', value: products.length },
          { label: 'In Stock', value: products.filter((p: Product) => p.stock > 0).length },
          { label: 'Categories', value: 2 },
        ].map((stat) => (
          <div key={stat.label} className="flex-1 min-w-0 text-center p-3 sm:p-4 md:p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50">
            <div className="text-lg sm:text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
            <div className="text-xs sm:text-sm md:text-base text-muted-foreground truncate">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
