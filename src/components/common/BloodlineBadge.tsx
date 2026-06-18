import { motion } from 'framer-motion';
import { BLOODLINE_CONFIG } from '../../types';

interface BloodlineBadgeProps {
  bloodline: string;
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
}

export default function BloodlineBadge({ bloodline, size = 'md', showTitle = true }: BloodlineBadgeProps) {
  const config = BLOODLINE_CONFIG[bloodline] || BLOODLINE_CONFIG['D'];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${config.color} text-white font-bold ${sizeClasses[size]} shadow-lg`}
    >
      <span className="drop-shadow-md">{bloodline}</span>
      {showTitle && <span className="drop-shadow-md">· {config.title}</span>}
    </motion.div>
  );
}

// 自定义头衔徽章组件
export interface TitleBadgeProps {
  title: string;
  color?: string;
  size?: 'sm' | 'md';
}

export function TitleBadge({ title, color = '#D4AF37', size = 'sm' }: TitleBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className={`inline-block rounded-full border ${sizeClasses[size]} font-bold text-white drop-shadow-md`}
      style={{
        backgroundColor: color,
        borderColor: `${color}80`
      }}
    >
      {title}
    </motion.span>
  );
}
