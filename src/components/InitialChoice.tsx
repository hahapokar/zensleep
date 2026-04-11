import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Settings, ArrowRight } from 'lucide-react';

interface InitialChoiceProps {
  onModeSelect: (mode: 'standard' | 'personalized') => void;
}

export default function InitialChoice({ onModeSelect }: InitialChoiceProps) {
  const [selectedMode, setSelectedMode] = useState<'standard' | 'personalized' | null>(null);

  const handleModeSelect = (mode: 'standard' | 'personalized') => {
    setSelectedMode(mode);
    setTimeout(() => onModeSelect(mode), 600);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-8 max-w-md"
      >
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center space-y-3"
        >
          <div className="flex justify-center mb-4">
            <Moon className="w-16 h-16 text-emerald-400" />
          </div>
          <h1 className="text-slate-100 text-4xl font-light tracking-tight">ZenSleep</h1>
          <p className="text-slate-400 text-sm tracking-widest">个性化睡眠调理系统</p>
        </motion.div>

        {/* 模式选择 */}
        <div className="w-full space-y-4">
          {/* 标准模式 */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleModeSelect('standard')}
            className={`w-full p-6 rounded-lg border-2 transition-all duration-300 ${
              selectedMode === 'standard'
                ? 'border-emerald-400 bg-emerald-400/10'
                : 'border-slate-700 bg-slate-800/50 hover:border-emerald-400/50'
            }`}
          >
            <div className="text-left space-y-2">
              <h3 className="text-slate-100 font-semibold text-lg">通用模式</h3>
              <p className="text-slate-400 text-sm">
                快速开始，适合想要立即获得放松和睡眠帮助的用户
              </p>
              <div className="flex items-center gap-2 text-emerald-400 text-sm mt-3">
                <span>立即开始</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </motion.button>

          {/* 个性化模式 */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleModeSelect('personalized')}
            className={`w-full p-6 rounded-lg border-2 transition-all duration-300 ${
              selectedMode === 'personalized'
                ? 'border-emerald-400 bg-emerald-400/10'
                : 'border-slate-700 bg-slate-800/50 hover:border-emerald-400/50'
            }`}
          >
            <div className="text-left space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Settings size={18} className="text-emerald-400" />
                <h3 className="text-slate-100 font-semibold text-lg">个性化配置</h3>
              </div>
              <p className="text-slate-400 text-sm">
                了解您的中医体质，选择针对症状的方案，获得定制化睡眠调理
              </p>
              <div className="flex items-center gap-2 text-emerald-400 text-sm mt-3">
                <span>开始配置</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </motion.button>
        </div>

        {/* 底部信息 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center text-slate-500 text-xs pt-4"
        >
          <p>提示：您可以随时返回更改设置</p>
        </motion.div>
      </motion.div>

      {/* 加载指示器 */}
      <AnimatePresence>
        {selectedMode && (
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
    </div>
  );
}
