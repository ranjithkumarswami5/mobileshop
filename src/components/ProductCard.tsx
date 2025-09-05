import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Package } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 card-shadow-dark rounded-2xl overflow-hidden flex flex-col">
        <Link to={`/product/${product.id}`} className="flex-grow">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-40 sm:h-48 object-cover"
              />
              <div className="absolute top-3 right-3">
                <Badge 
                  variant={product.category === 'phone' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {product.category}
                </Badge>
              </div>
              {product.stock < 10 && product.stock > 0 && (
                <div className="absolute top-3 left-3">
                  <Badge variant="destructive">
                    Low Stock
                  </Badge>
                </div>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="destructive" className="text-lg px-4 py-2">
                    Out of Stock
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-base sm:text-lg mb-2 text-foreground line-clamp-2">
                {product.name}
              </h3>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xl sm:text-2xl font-bold text-primary">
                  {formatPrice(product.price)}
                </p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Package className="h-4 w-4 mr-1" />
                  {product.stock}
                </div>
              </div>
            </div>
          </CardContent>
        </Link>
        
        <CardFooter className="p-4 pt-0 mt-auto">
          <Button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
