import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronLeft } from 'lucide-react';

interface SleepOption {
  id: string;
  name: string;
  description: string;
  target: string;
}

const SLEEP_OPTIONS: SleepOption[] = [
  {
    id: 'clear-mind',
    name: '清脑 · 卸载繁杂 (30分钟)',
    description: '帮助大脑停止转动，释放压力。适合思维活跃、难以入睡的用户',
    target: '大脑转不停、压力大的用户',
  },
  {
    id: 'relax-body',
    name: '舒体 · 融化酸累 (30分钟)',
    description: '缓解身体疲劳，放松肌肉酸痛。适合身体疲惫、需要深度放松的用户',
    target: '身体极度疲惫、腰酸背痛的用户',
  },
  {
    id: 'calm-heart',
    name: '定心 · 安全避风港 (30分钟)',
    description: '提供心理安全感，抚平焦虑。适合内心不安、需要情感支持的用户',
    target: '内心焦虑、受挫、需要心理安全感的用户',
  },
  {
    id: 'cool-down',
    name: '降温 · 抚平兴奋 (60分钟)',
    description: '降低情绪亢奋，帮助平静入睡。适合刚结束工作、情绪高涨的用户',
    target: '刷手机太久、刚开完会、情绪亢奋的用户',
  },
  {
    id: 'serene',
    name: '静谧 · 日常入梦 (60分钟)',
    description: '提供宁静背景音，辅助自然入睡。适合状态正常、需要背景音的用户',
    target: '状态正常，只是需要一个背景音入睡的用户',
  },
];

interface SleepOptionSelectorProps {
  onOptionSelect: (optionId: string) => void;
  onBack?: () => void;
}

export default function SleepOptionSelector({
  onOptionSelect,
  onBack,
}: SleepOptionSelectorProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    setIsConfirming(true);
    setTimeout(() => {
      onOptionSelect(optionId);
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
              选择夜晚助眠模式
            </h1>
            <p className="text-slate-400">
              根据您的当前状态选择最适合的夜晚睡眠引导模式
            </p>
          </div>

          {/* 选项网格 */}
          <div className="grid grid-cols-1 gap-4">
            {SLEEP_OPTIONS.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOptionSelect(option.id)}
                className={`p-6 rounded-lg border-2 text-left transition-all ${
                  selectedOption === option.id
                    ? 'border-emerald-400 bg-emerald-400/10'
                    : 'border-slate-700 bg-slate-800/30 hover:border-emerald-400/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedOption === option.id
                        ? 'border-emerald-400 bg-emerald-400'
                        : 'border-slate-600'
                    }`}
                  >
                    {selectedOption === option.id && (
                      <Check size={16} className="text-slate-900" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-medium text-lg ${
                        selectedOption === option.id
                          ? 'text-emerald-100'
                          : 'text-slate-200'
                      }`}
                    >
                      {option.name}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">
                      {option.description}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      针对：{option.target}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* 提示 */}
          <div className="p-4 rounded-lg bg-slate-800/50 border-l-2 border-emerald-400">
            <p className="text-slate-300 text-sm">
              💡 提示：选择最符合您当前需求的模式，系统会根据您的选择调整引导语和音乐来帮助您快速入睡。
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