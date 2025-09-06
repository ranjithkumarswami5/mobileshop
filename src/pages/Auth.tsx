import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Gift } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '../components/Logo';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or mobile number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  mobileNumber: z.string().regex(/^\d{10}$/, 'Must be a valid 10-digit mobile number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, user, loading } = useAuth();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || "/";
  const referralCode = searchParams.get('ref');

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      mobileNumber: '',
      password: '',
      confirmPassword: ''
    },
    mode: 'onChange'
  });

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      await login(data.identifier, data.password);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      navigate(from, { replace: true });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    console.log('Signup form submitted with data:', data);
    try {
      await signup(data.email, data.password, data.mobileNumber, referralCode || undefined);
      toast({
        title: "Account created!",
        description: "Welcome to Devi Sri Mobiles. You've received a WELCOME10 coupon!",
      });
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-navy-800 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 card-shadow-dark rounded-2xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <Logo className="h-20" showText={false} />
            </motion.div>
            
            <CardTitle className="text-2xl font-bold">
              {isLogin ? 'Welcome to Devi Sri Mobiles' : 'Join Devi Sri Mobiles'}
            </CardTitle>
            
            <CardDescription>
              {isLogin 
                ? 'Sign in to your account to continue shopping'
                : 'Create your account and start exploring amazing deals'
              }
            </CardDescription>

            {referralCode && !isLogin && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-primary/10 rounded-xl border border-primary/20"
              >
                <div className="flex items-center justify-center text-primary">
                  <Gift className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    Referral detected! Both you and your friend will get 10% discount!
                  </span>
                </div>
              </motion.div>
            )}
          </CardHeader>

          <CardContent>
            {isLogin ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4" key="login-form">
                  <FormField
                    control={loginForm.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email or Mobile Number</FormLabel>
                        <FormControl>
                          <Input
                            id="login-identifier"
                            placeholder="Enter your email or mobile"
                            className="rounded-xl"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              id="login-password"
                              type={showLoginPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="rounded-xl pr-10"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                            >
                              {showLoginPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full rounded-xl bg-primary hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4" key="signup-form">
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="Enter your email"
                            className="rounded-xl"
                            disabled={loading}
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="mobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <Input
                            id="signup-mobile"
                            type="tel"
                            placeholder="Enter your 10-digit mobile number"
                            className="rounded-xl"
                            disabled={loading}
                            autoComplete="tel"
                            maxLength={10}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              id="signup-password"
                              type={showSignupPassword ? "text" : "password"}
                              placeholder="Create a password"
                              className="rounded-xl pr-10"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowSignupPassword(!showSignupPassword)}
                            >
                              {showSignupPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            id="signup-confirm-password"
                            type={showSignupPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            className="rounded-xl"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full rounded-xl bg-primary hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </Form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                variant="link"
                className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
                onClick={() => {
                  setIsLogin(!isLogin);
                  // Reset forms when switching modes
                  loginForm.reset();
                  signupForm.reset();
                }}
              >
                {isLogin ? 'Sign up here' : 'Sign in here'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
