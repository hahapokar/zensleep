import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Play, Loader2, AlertCircle } from 'lucide-react';

interface ContentConfig {
  constitution: string;
  symptoms: string[];
  sessionDuration: number;
  voiceSettings: {
    rate: number;
    pitch: number;
  };
  scriptSequence: string[];
  musicTracks: string[];
  audioFile?: string;
}

interface SessionPrepProps {
  config?: ContentConfig;
  isLoading: boolean;
  loadingProgress: number;
  error: string | null;
  onStart: () => void;
  onBack: () => void;
}

export default function SessionPrep({
  config,
  isLoading,
  loadingProgress,
  error,
  onStart,
  onBack,
}: SessionPrepProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} 分钟`;
  };

  const getModeLabel = () => {
    if (!config?.symptoms) return '放松';
    if (config.symptoms.includes('nsdr')) return 'NSDR';
    if (config.symptoms.includes('sleep')) return '睡眠';
    if (config.symptoms.includes('music')) return '音乐';
    if (config.symptoms.includes('whitenoise')) return '白噪音';
    return '放松';
  };

  const getModeDescription = () => {
    if (!config?.symptoms) return '准备开始您的放松体验';
    if (config.symptoms.includes('nsdr')) return 'NSDR 非睡眠深度放松';
    if (config.symptoms.includes('sleep')) return '睡眠引导与放松';
    if (config.symptoms.includes('music')) return '音乐助眠与放松';
    if (config.symptoms.includes('whitenoise')) return '白噪音助眠';
    return '准备开始您的放松体验';
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl mx-auto p-6 py-8 flex flex-col min-h-full"
      >
        {/* 返回按钮 */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-8 transition-colors w-fit"
        >
          <ChevronLeft size={18} />
          <span className="text-xs">返回上一步</span>
        </motion.button>

        {/* 主要内容 */}
        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-8">
          {/* 模式标签 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-3"
          >
            <div className="text-emerald-400/60 text-xs tracking-widest uppercase">
              {getModeLabel()}
            </div>
            <h2 className="text-3xl font-light text-slate-100">
              {getModeDescription()}
            </h2>
            {config?.sessionDuration && (
              <p className="text-slate-500 text-sm">
                时长: {formatDuration(config.sessionDuration)}
              </p>
            )}
          </motion.div>

          {/* 音频加载状态 */}
          {isLoading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 w-full max-w-xs"
            >
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">正在加载音频{dots}</span>
              </div>
              
              {/* 进度条 */}
              <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              
              <p className="text-slate-500 text-xs text-center">
                {loadingProgress}% - 请稍候
              </p>
            </motion.div>
          )}

          {/* 错误提示 */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-lg bg-red-500/10 border border-red-500/30"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </motion.div>
          )}

          {/* 开始按钮 */}
          {!isLoading && !error && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="px-12 py-4 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all flex items-center gap-3"
            >
              <Play size={24} className="fill-emerald-400" />
              <span className="text-lg font-medium">开始</span>
            </motion.button>
          )}
        </div>

        {/* 底部提示 */}
        {!isLoading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 p-4 rounded-lg bg-slate-800/30 border-l-2 border-emerald-500"
          >
            <p className="text-slate-400 text-xs leading-relaxed">
              💡 提示：点击开始后，请确保手机处于静音或免打扰模式，以获得最佳体验。
              音频将循环播放直到您设定的时长结束。
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
