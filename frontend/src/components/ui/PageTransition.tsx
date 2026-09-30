import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: { staggerChildren: 0.08, delayChildren: 0.1 }
        },
        exit: { opacity: 0 }
      }}
      className={`w-full ${className}`}
    >
      {/* We map over children to wrap immediate children with a motion variant if they aren't already motion components, but simplest is to just let authors use variants. Or we can just let children pop in. The standard is to fade the container, and optionally stagger children if they use standard variants. Let's provide a utility variant. */}
      {children}
    </motion.div>
  );
}
