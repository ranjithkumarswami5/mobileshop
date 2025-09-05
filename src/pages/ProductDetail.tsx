import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Package, Star, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useCart } from '../context/CartContext';
import { getProducts } from '../lib/database';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../types';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
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

  const product = useMemo(() => products.find(p => p.id === id), [id, products]);
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  }, [product, products]);
  
  const imageGallery = useMemo(() => {
    if (!product) return [];
    return [
      product.imageUrl,
      `https://picsum.photos/seed/${product.id}1/600/600`,
      `https://picsum.photos/seed/${product.id}2/600/600`,
      `https://picsum.photos/seed/${product.id}3/600/600`,
    ];
  }, [product]);
  
  const [mainImage, setMainImage] = useState(product?.imageUrl);

  React.useEffect(() => {
    setMainImage(product?.imageUrl);
    setQuantity(1);
    window.scrollTo(0, 0);
  }, [product]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <Button asChild variant="link" className="mt-4">
          <Link to="/">Go back to Home</Link>
        </Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Button asChild variant="link" className="mt-4">
          <Link to="/">Go back to Home</Link>
        </Button>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="space-y-12">
      <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="space-y-4 sticky top-24">
            <Card className="overflow-hidden rounded-2xl">
              <AspectRatio ratio={1 / 1}>
                <motion.img
                  key={mainImage}
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </AspectRatio>
            </Card>
            <div className="grid grid-cols-4 gap-2">
              {imageGallery.map((img, index) => (
                <button key={index} onClick={() => setMainImage(img)} className={`rounded-lg overflow-hidden border-2 ${mainImage === img ? 'border-primary' : 'border-transparent'}`}>
                  <AspectRatio ratio={1 / 1}>
                    <img src={img} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </AspectRatio>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="space-y-3">
            <Badge variant={product.category === 'phone' ? 'default' : 'secondary'} className="capitalize">{product.category}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-4">
              <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>
              <div className="flex items-center gap-1 text-yellow-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
                <span className="text-muted-foreground ml-1">(123 reviews)</span>
              </div>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Package className="h-4 w-4 mr-2" />
              <span>{product.stock} in stock</span>
            </div>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
                <span className="w-10 text-center">{quantity}</span>
                <Button variant="outline" size="sm" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock}>+</Button>
              </div>
              <Button 
                size="lg" 
                className="w-full rounded-xl"
                onClick={() => addToCart(product, quantity)}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            </CardContent>
          </Card>

          <Accordion type="single" collapsible defaultValue="description" className="w-full">
            <AccordionItem value="description">
              <AccordionTrigger>Full Description</AccordionTrigger>
              <AccordionContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                <p>Introducing the new {product.name}, a revolutionary device that combines cutting-edge technology with sleek design. Experience unparalleled performance, a stunning display, and a camera system that captures life's moments in breathtaking detail. Perfect for both work and play.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="specs">
              <AccordionTrigger>Specifications</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Display: 6.7" Super Retina XDR</li>
                  <li>Processor: A18 Bionic Chip</li>
                  <li>Storage: 256GB</li>
                  <li>Camera: 48MP Main, 12MP Ultra Wide</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="reviews">
              <AccordionTrigger>Reviews</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>No reviews yet. Be the first to review this product!</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p, index) => (
              <ProductCard key={p.id} product={p} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
