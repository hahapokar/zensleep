import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Settings, ArrowRight, Music, Waves } from 'lucide-react';

interface InitialChoiceProps {
  onModeSelect: (mode: 'nsdr' | 'sleep' | 'music' | 'whitenoise') => void;
}

export default function InitialChoice({ onModeSelect }: InitialChoiceProps) {
  const [selectedMode, setSelectedMode] = useState<'nsdr' | 'sleep' | 'music' | 'whitenoise' | null>(null);

  const handleModeSelect = (mode: 'nsdr' | 'sleep' | 'music' | 'whitenoise') => {
    setSelectedMode(mode);
    setTimeout(() => onModeSelect(mode), 600);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-5 max-w-md mx-auto w-full p-4 py-6"
      >
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center space-y-2"
        >
          <div className="flex justify-center mb-2">
            <Moon className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-slate-100 text-2xl font-light tracking-tight">ZenSleep</h1>
          <p className="text-slate-400 text-xs tracking-widest">个性化睡眠调理系统</p>
        </motion.div>

        {/* 模式选择 */}
        <div className="w-full space-y-2">
          {/* NSDR 非睡眠放松 */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleModeSelect('nsdr')}
            className={`w-full p-3 rounded-lg border-2 transition-all duration-300 ${
              selectedMode === 'nsdr'
                ? 'border-emerald-400 bg-emerald-400/10'
                : 'border-slate-700 bg-slate-800/50 hover:border-emerald-400/50'
            }`}
          >
            <div className="text-left space-y-1">
              <h3 className="text-slate-100 font-semibold text-sm">NSDR 引导深度放松</h3>
              <p className="text-slate-400 text-xs">
                白天进行非睡眠深度放松练习
              </p>
              <div className="flex items-center gap-2 text-emerald-400 text-xs mt-1">
                <span>开始放松</span>
                <ArrowRight size={12} />
              </div>
            </div>
          </motion.button>

          {/* 进入睡眠 */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleModeSelect('sleep')}
            className={`w-full p-3 rounded-lg border-2 transition-all duration-300 ${
              selectedMode === 'sleep'
                ? 'border-emerald-400 bg-emerald-400/10'
                : 'border-slate-700 bg-slate-800/50 hover:border-emerald-400/50'
            }`}
          >
            <div className="text-left space-y-1">
              <div className="flex items-center gap-2 mb-0.5">
                <Moon size={14} className="text-emerald-400" />
                <h3 className="text-slate-100 font-semibold text-sm">导语助眠</h3>
              </div>
              <p className="text-slate-400 text-xs">
                夜晚进入深度睡眠模式，通过引导语帮助入睡
              </p>
              <div className="flex items-center gap-2 text-emerald-400 text-xs mt-1">
                <span>开始入睡</span>
                <ArrowRight size={12} />
              </div>
            </div>
          </motion.button>

          {/* 音乐助眠 */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleModeSelect('music')}
            className={`w-full p-3 rounded-lg border-2 transition-all duration-300 ${
              selectedMode === 'music'
                ? 'border-emerald-400 bg-emerald-400/10'
                : 'border-slate-700 bg-slate-800/50 hover:border-emerald-400/50'
            }`}
          >
            <div className="text-left space-y-1">
              <div className="flex items-center gap-2 mb-0.5">
                <Music size={14} className="text-emerald-400" />
                <h3 className="text-slate-100 font-semibold text-sm">音乐助眠</h3>
              </div>
              <p className="text-slate-400 text-xs">
                无语音引导，纯脑波助眠音频，帮助身心放松
              </p>
              <div className="flex items-center gap-2 text-emerald-400 text-xs mt-1">
                <span>开始聆听</span>
                <ArrowRight size={12} />
              </div>
            </div>
          </motion.button>

          {/* 白噪音 */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleModeSelect('whitenoise')}
            className={`w-full p-3 rounded-lg border-2 transition-all duration-300 ${
              selectedMode === 'whitenoise'
                ? 'border-emerald-400 bg-emerald-400/10'
                : 'border-slate-700 bg-slate-800/50 hover:border-emerald-400/50'
            }`}
          >
            <div className="text-left space-y-1">
              <div className="flex items-center gap-2 mb-0.5">
                <Waves size={14} className="text-emerald-400" />
                <h3 className="text-slate-100 font-semibold text-sm">粉红噪音</h3>
              </div>
              <p className="text-slate-400 text-xs">
                自然粉红噪音，包括溪流、雷声、海浪、水滴、风声等
              </p>
              <div className="flex items-center gap-2 text-emerald-400 text-xs mt-1">
                <span>选择声音</span>
                <ArrowRight size={12} />
              </div>
            </div>
          </motion.button>
        </div>

        {/* 底部信息 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center text-slate-500 text-xs pt-2"
        >
          <p></p>
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
