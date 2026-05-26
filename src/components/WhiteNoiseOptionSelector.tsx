import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronLeft, Flame, Zap, Wind, Waves, Droplets } from 'lucide-react';

interface WhiteNoiseOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const WHITENOISE_OPTIONS: WhiteNoiseOption[] = [
  {
    id: 'campfire',
    name: '营火 · 温暖相伴 (30分钟)',
    description: '噼里啪啦的营火声，温暖而宁静，营造户外露营的氛围',
    icon: <Flame size={20} />,
  },
  {
    id: 'thunder',
    name: '雷声 · 自然怒吼 (30分钟)',
    description: '远处的雷声，伴着雨声，带来宁静和安全感',
    icon: <Zap size={20} />,
  },
  {
    id: 'nature',
    name: '自然 · 鸟语花香 (30分钟)',
    description: '大自然的声音，包括鸟叫、流水，放松身心',
    icon: <Wind size={20} />,
  },
  {
    id: 'wave',
    name: '海浪 · 潮起潮落 (30分钟)',
    description: '海浪的声音，带来大海的气息，帮助平静入睡',
    icon: <Waves size={20} />,
  },
  {
    id: 'waterdrop',
    name: '水滴 · 滴水穿石 (30分钟)',
    description: '清澈的水滴声，静心宁神，适合冥想和睡眠',
    icon: <Droplets size={20} />,
  },
];

interface WhiteNoiseOptionSelectorProps {
  onOptionSelect: (optionId: string) => void;
  onBack?: () => void;
}

export default function WhiteNoiseOptionSelector({
  onOptionSelect,
  onBack,
}: WhiteNoiseOptionSelectorProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    setIsConfirming(true);
    // 减少延迟从 600ms 改为 300ms，更快响应
    setTimeout(() => {
      onOptionSelect(optionId);
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl mx-auto p-4 py-6"
      >
        {/* 返回按钮 */}
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
          {/* 标题 */}
          <div>
            <h1 className="text-2xl font-light text-slate-100 mb-1">
              选择白噪音模式
            </h1>
            <p className="text-slate-400 text-xs">
              根据您的喜好选择适合的白噪音来帮助您入睡
            </p>
          </div>

          {/* 选项网格 */}
          <div className="space-y-2">
            {WHITENOISE_OPTIONS.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOptionSelect(option.id)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  selectedOption === option.id
                    ? 'border-emerald-400 bg-emerald-400/10'
                    : 'border-slate-700 bg-slate-800/30 hover:border-emerald-400/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedOption === option.id
                        ? 'border-emerald-400 bg-emerald-400'
                        : 'border-slate-600'
                    }`}
                  >
                    {selectedOption === option.id && (
                      <Check size={12} className="text-slate-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={selectedOption === option.id ? 'text-emerald-400' : 'text-slate-500'}>
                        {React.cloneElement(option.icon as React.ReactElement, { size: 16 })}
                      </span>
                      <h3
                        className={`font-medium text-sm leading-tight ${
                          selectedOption === option.id
                            ? 'text-emerald-100'
                            : 'text-slate-200'
                        }`}
                      >
                        {option.name}
                      </h3>
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5 leading-relaxed line-clamp-2">
                      {option.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* 提示 */}
          <div className="p-3 rounded-lg bg-slate-800/50 border-l-2 border-emerald-400">
            <p className="text-slate-300 text-xs">
              💡 提示：白噪音可以帮助屏蔽环境噪音，创造一个宁静的睡眠环境。选择您喜欢的声音开始吧！
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
