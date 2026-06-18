import { motion } from 'framer-motion';

interface ExpProgressBarProps {
  current: number;
  next: number;
  progress: number;
  showText?: boolean;
}

export default function ExpProgressBar({ current, next, progress, showText = true }: ExpProgressBarProps) {
  return (
    <div className="w-full">
      {showText && (
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{current} EXP</span>
          <span>下一级: {next} EXP</span>
        </div>
      )}
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 rounded-full"
        />
      </div>
    </div>
  );
}
