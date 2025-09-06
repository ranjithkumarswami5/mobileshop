import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartContextType, CartItem, Product, User } from '../types';
import { useAuth } from './AuthContext';

const CartContext = createContext<CartContextType | undefined>(undefined);

// Generate session ID for anonymous users
const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sessionId] = useState(getSessionId());
  const { user } = useAuth();

  // Migrate session cart to user cart when user logs in
  const migrateSessionCartToUser = async (userEmail: string) => {
    try {
      console.log('Migrating session cart to user cart...');
      
      // Get session cart items
      const sessionResponse = await fetch(`http://localhost:3001/api/cart?sessionId=${sessionId}`);
      if (!sessionResponse.ok) return;
      
      const sessionItems = await sessionResponse.json();
      if (sessionItems.length === 0) return;
      
      console.log('Found session cart items to migrate:', sessionItems);
      
      // Add each session item to user cart
      for (const item of sessionItems) {
        await fetch('http://localhost:3001/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: item.product.id,
            quantity: item.quantity,
            userEmail: userEmail,
          }),
        });
      }
      
      // Clear session cart after migration
      await fetch(`http://localhost:3001/api/cart?sessionId=${sessionId}`, {
        method: 'DELETE',
      });
      
      console.log('Session cart migrated to user cart successfully');
    } catch (error) {
      console.error('Error migrating session cart to user cart:', error);
    }
  };

  // Load cart from database - use userEmail if logged in, sessionId if not
  useEffect(() => {
    const loadCart = async () => {
      try {
        setIsLoaded(false);
        
        // If user just logged in, migrate session cart first
        if (user) {
          await migrateSessionCartToUser(user.email);
        }
        
        const queryParam = user ? `userEmail=${user.email}` : `sessionId=${sessionId}`;
        const response = await fetch(`http://localhost:3001/api/cart?${queryParam}`);
        if (response.ok) {
          const cartItems = await response.json();
          console.log('Loading cart from database:', cartItems, 'for', user ? `user ${user.email}` : `session ${sessionId}`);
          setItems(cartItems);
        } else {
          console.error('Failed to load cart from database');
          setItems([]); // Clear items on error
        }
      } catch (error) {
        console.error('Error loading cart from database:', error);
        setItems([]); // Clear items on error
      } finally {
        setIsLoaded(true);
      }
    };

    loadCart();
  }, [sessionId, user]); // Reload cart when user changes

  const addToCart = async (product: Product, quantity = 1) => {
    try {
      const requestBody = {
        productId: product.id,
        quantity,
        ...(user ? { userEmail: user.email } : { sessionId })
      };
      
      console.log('Adding to cart:', requestBody);

      const response = await fetch('http://localhost:3001/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('API Response status:', response.status);

      if (response.ok) {
        const cartItem = await response.json();
        console.log('Cart item response:', cartItem);

        setItems(prev => {
          const existingIndex = prev.findIndex(item => item.product.id === product.id);
          if (existingIndex >= 0) {
            // Update existing item
            const updated = [...prev];
            updated[existingIndex] = cartItem;
            return updated;
          } else {
            // Add new item
            return [...prev, cartItem];
          }
        });
        console.log('Item added to cart successfully:', cartItem);
      } else {
        const errorText = await response.text();
        console.error('Failed to add item to cart:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      // Find the cart item ID
      const cartItem = items.find(item => item.product.id === productId);
      if (!cartItem) return;

      const response = await fetch(`http://localhost:3001/api/cart/${cartItem.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setItems(prev => prev.filter(item => item.product.id !== productId));
        console.log('Item removed from cart:', productId);
      } else {
        console.error('Failed to remove item from cart');
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      // Find the cart item ID
      const cartItem = items.find(item => item.product.id === productId);
      if (!cartItem) return;

      const response = await fetch(`http://localhost:3001/api/cart/${cartItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setItems(prev =>
          prev.map(item =>
            item.product.id === productId ? updatedItem : item
          )
        );
        console.log('Cart item updated:', updatedItem);
      } else {
        console.error('Failed to update cart item');
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  };

  const clearCart = async () => {
    try {
      const queryParam = user ? `userEmail=${user.email}` : `sessionId=${sessionId}`;
      const response = await fetch(`http://localhost:3001/api/cart?${queryParam}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setItems([]);
        console.log('Cart cleared successfully for', user ? `user ${user.email}` : `session ${sessionId}`);
      } else {
        console.error('Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total,
      isLoaded
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
