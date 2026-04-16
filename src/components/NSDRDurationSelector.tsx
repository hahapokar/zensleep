import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronLeft } from 'lucide-react';

interface NSDRDuration {
  id: string;
  duration: number;
  label: string;
  description: string;
}

const NSDR_DURATIONS: NSDRDuration[] = [
  {
    id: '10min',
    duration: 600,
    label: '10分钟',
    description: '快速能量补给 - 缓解眼部疲劳，恢复精神状态',
  },
  {
    id: '20min',
    duration: 1200,
    label: '20分钟',
    description: '压力释放 - 降低焦虑水平，重建内心平静',
  },
  {
    id: '30min',
    duration: 1800,
    label: '30分钟',
    description: '深度恢复 - 完整放松周期，重塑神经连接',
  },
];

interface NSDRDurationSelectorProps {
  onDurationSelect: (duration: number) => void;
  onBack?: () => void;
}

export default function NSDRDurationSelector({
  onDurationSelect,
  onBack,
}: NSDRDurationSelectorProps) {
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleDurationSelect = (duration: number) => {
    setSelectedDuration(`${duration}s`);
    setIsConfirming(true);
    setTimeout(() => {
      onDurationSelect(duration);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        {/* 返回按钮 */}
        {onBack && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-12 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm">返回上一步</span>
          </motion.button>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* 标题 */}
          <div>
            <h1 className="text-4xl font-light text-slate-100 mb-2">
              选择深层休息时长
            </h1>
            <p className="text-slate-400">
              选择最适合你的放松时间
            </p>
          </div>

          {/* 时长选项 */}
          <div className="grid grid-cols-1 gap-4">
            {NSDR_DURATIONS.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDurationSelect(option.duration)}
                className={`p-6 rounded-lg border-2 text-left transition-all ${
                  selectedDuration === `${option.duration}s`
                    ? 'border-emerald-400 bg-emerald-400/10'
                    : 'border-slate-700 bg-slate-800/30 hover:border-emerald-400/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedDuration === `${option.duration}s`
                        ? 'border-emerald-400 bg-emerald-400'
                        : 'border-slate-600'
                    }`}
                  >
                    {selectedDuration === `${option.duration}s` && (
                      <Check size={16} className="text-slate-900" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-medium text-lg ${
                        selectedDuration === `${option.duration}s`
                          ? 'text-emerald-100'
                          : 'text-slate-200'
                      }`}
                    >
                      {option.label}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* 提示 */}
          <div className="p-4 rounded-lg bg-slate-800/50 border-l-2 border-emerald-400">
            <p className="text-slate-300 text-sm">
              💡 提示：选择适合你当前状态的时长，可根据需要灵活调整。
            </p>
          </div>
        </motion.div>

        {/* 加载动画 */}
        <AnimatePresence>
          {isConfirming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
