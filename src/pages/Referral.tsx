import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2, Gift, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function Referral() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <p className="text-muted-foreground">Please log in to access referral program</p>
      </motion.div>
    );
  }

  const referralLink = `${window.location.origin}/signup?ref=${user.referralCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Referral link has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join MobileShop',
          text: 'Get 10% off on your first order!',
          url: referralLink,
        });
      } catch (error) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold">Referral Program</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Invite your friends and both of you get 10% discount on your next purchase!
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Referral Link Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl card-shadow-dark">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="h-5 w-5 mr-2 text-primary" />
                Your Referral Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Referral Code</label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={user.referralCode}
                    readOnly
                    className="font-mono rounded-xl bg-muted/50"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(user.referralCode)}
                    className="rounded-xl"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Full Referral Link</label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={referralLink}
                    readOnly
                    className="text-xs rounded-xl bg-muted/50"
                  />
                  <Button
                    variant={copied ? "default" : "outline"}
                    size="sm"
                    onClick={copyToClipboard}
                    className="rounded-xl min-w-[80px]"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                onClick={shareLink}
                className="w-full rounded-xl bg-primary hover:bg-primary/90"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Link
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl card-shadow-dark">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="h-5 w-5 mr-2 text-primary" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: "Share Your Link",
                    description: "Send your referral link to friends and family"
                  },
                  {
                    step: 2,
                    title: "Friend Signs Up",
                    description: "Your friend creates an account using your link"
                  },
                  {
                    step: 3,
                    title: "Both Get Discounts",
                    description: "You both receive 10% off coupons automatically"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {item.step}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl card-shadow-dark">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Your Referral Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Referrals', value: '0', color: 'text-primary' },
                { label: 'Pending Rewards', value: '0', color: 'text-orange-500' },
                { label: 'Total Earned', value: '₹0', color: 'text-green-500' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="text-center space-y-2"
                >
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="bg-primary/10 rounded-2xl p-6 border border-primary/20"
      >
        <div className="flex items-start space-x-3">
          <Gift className="h-5 w-5 text-primary mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-medium text-primary">Important Note</h4>
            <p className="text-sm text-muted-foreground">
              Both you and your friend will receive a 10% discount coupon when they sign up using your referral link. 
              The discount can be applied to any purchase on MobileShop.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
