import { motion, type HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  hover?: boolean;
}

export default function GlassCard({ children, className = '', hover = false, ...props }: GlassCardProps) {
  return (
    <motion.div
      {...props}
      className={`glass ${hover ? 'glass-hover' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
