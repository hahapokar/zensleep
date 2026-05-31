import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Check } from 'lucide-react';

interface DurationOption {
  id: number;
  label: string;
  description: string;
}

interface DurationSelectorProps {
  onDurationSelect: (duration: number) => void;
  onBack?: () => void;
  mode?: 'music' | 'whitenoise';
}

const DURATION_OPTIONS: DurationOption[] = [
  { id: 10, label: '10分钟', description: '快速放松或小憩' },
  { id: 20, label: '20分钟', description: '中等时长的放松' },
  { id: 30, label: '30分钟', description: '标准助眠时长' },
  { id: 40, label: '40分钟', description: '更长的放松时间' },
  { id: 50, label: '50分钟', description: '深度放松体验' },
  { id: 60, label: '60分钟', description: '完整一小时的放松' },
];

export default function DurationSelector({
  onDurationSelect,
  onBack,
  mode = 'music',
}: DurationSelectorProps) {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleDurationSelect = (duration: number) => {
    setSelectedDuration(duration);
    setIsConfirming(true);
    setTimeout(() => {
      onDurationSelect(duration * 60);
    }, 300);
  };

  const modeLabel = mode === 'music' ? '音乐' : '白噪音';

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl mx-auto p-4 py-6"
      >
        {onBack && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors"
          >
            <ChevronLeft size={18} />
            <span className="text-xs">返回上一步</span>
          </motion.button>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-2xl font-light text-slate-100 mb-1">
              选择{modeLabel}时长
            </h1>
            <p className="text-slate-400 text-xs">
              选择您想要播放{modeLabel}的时长（音频将循环播放）
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {DURATION_OPTIONS.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDurationSelect(option.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedDuration === option.id
                    ? 'border-emerald-400 bg-emerald-400/10'
                    : 'border-slate-700 bg-slate-800/30 hover:border-emerald-400/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedDuration === option.id
                        ? 'border-emerald-400 bg-emerald-400'
                        : 'border-slate-600'
                    }`}
                  >
                    {selectedDuration === option.id && (
                      <Check size={12} className="text-slate-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-medium text-lg leading-tight ${
                        selectedDuration === option.id
                          ? 'text-emerald-100'
                          : 'text-slate-200'
                      }`}
                    >
                      {option.label}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border-l-2 border-emerald-400">
            <p className="text-slate-300 text-xs leading-relaxed">
              💡 提示：音频会循环播放直到您选择的时长结束。例如选择40分钟，音频将播放30分钟后自动循环，直到40分钟结束时停止。
            </p>
          </div>
        </motion.div>

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
