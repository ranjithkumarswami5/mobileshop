import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  ShoppingCart, 
  User, 
  Share, 
  Settings,
  LogOut,
  LogIn,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ThemeToggle } from '../ThemeToggle';
import { Logo } from '../Logo';

export function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const location = useLocation();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { path: '/', icon: Home, label: 'Home', public: true },
    { path: '/cart', icon: ShoppingCart, label: 'Cart', badge: totalItems, public: true },
    { path: '/referral', icon: Share, label: 'Referral', public: false },
    { path: '/profile', icon: User, label: 'Profile', public: false },
  ];

  if (user?.isAdmin) {
    navItems.push({ path: '/admin', icon: Settings, label: 'Admin', public: false });
  }

  const visibleNavItems = navItems.filter(item => item.public || !!user);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/">
            <Logo className="h-12" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {visibleNavItems.map(({ path, icon: Icon, label, badge }) => (
              <Link key={path} to={path}>
                <Button
                  variant={location.pathname === path ? "default" : "ghost"}
                  size="sm"
                  className="relative"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                  {badge !== undefined && badge > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
             {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0 flex flex-col">
                <SheetHeader className="p-4 border-b">
                   <SheetTitle>
                    <Logo className="h-10" />
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-grow p-4">
                  <div className="flex flex-col space-y-2">
                    {visibleNavItems.map(({ path, icon: Icon, label, badge }) => (
                      <SheetClose asChild key={path}>
                        <Link to={path}>
                          <Button
                            variant={location.pathname === path ? "secondary" : "ghost"}
                            className="w-full justify-start text-base"
                          >
                            <Icon className="h-4 w-4 mr-3" />
                            {label}
                            {badge !== undefined && badge > 0 && (
                              <Badge 
                                variant="destructive" 
                                className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs"
                              >
                                {badge}
                              </Badge>
                            )}
                          </Button>
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                </div>
                <div className="p-4 mt-auto border-t space-y-4">
                  {user ? (
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        onClick={logout}
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 text-base"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </Button>
                    </SheetClose>
                  ) : (
                     <SheetClose asChild>
                       <Link to="/auth" className="w-full">
                        <Button variant="default" className="w-full text-base">
                          <LogIn className="h-4 w-4 mr-3" />
                          Login / Sign Up
                        </Button>
                       </Link>
                    </SheetClose>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Switch Theme</p>
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
