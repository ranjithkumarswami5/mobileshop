import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';

export function Preloader() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="p-4 bg-primary/10 rounded-full"
      >
        <div className="p-4 bg-primary/20 rounded-full">
           <Smartphone className="h-12 w-12 text-primary" />
        </div>
      </motion.div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-lg font-medium text-muted-foreground tracking-widest"
      >
        LOADING...
      </motion.p>
    </div>
  );
}
