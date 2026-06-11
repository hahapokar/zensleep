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
  totalBytes?: number;
  downloadedBytes?: number;
}

export default function SessionPrep({
  config,
  isLoading,
  loadingProgress,
  error,
  onStart,
  onBack,
  totalBytes = 0,
  downloadedBytes = 0,
}: SessionPrepProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    setAnimatedProgress(loadingProgress);
  }, [loadingProgress]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} 分钟`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getModeLabel = () => {
    if (!config?.symptoms) return '放松';
    if (config.symptoms.includes('nsdr')) return 'NSDR';
    if (config.symptoms.includes('sleep')) return '睡眠';
    if (config.symptoms.includes('music')) return '音乐';
    if (config.symptoms.includes('whitenoise')) return '白噪音';
    return '放松';
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl mx-auto p-6 py-8 flex flex-col min-h-full"
      >
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-8 transition-colors w-fit"
        >
          <ChevronLeft size={18} />
          <span className="text-xs">返回上一步</span>
        </motion.button>

        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-8">
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
              {config?.sessionDuration ? `正在为您准备 ${formatDuration(config.sessionDuration)} 的放松体验` : '正在为您准备放松体验'}
            </h2>
          </motion.div>

          {isLoading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="w-full max-w-md space-y-6"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div
                    className="rounded-full border-4 border-emerald-400/20"
                    style={{ width: 80, height: 80 }}
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-400"
                    style={{ width: 80, height: 80 }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-emerald-400 font-medium text-base">
                    {animatedProgress}%
                  </span>
                </div>

                <div className="text-slate-200 text-lg">正在加载音频</div>

                {totalBytes > 0 && (
                  <div className="text-slate-400 text-xs">
                    {formatBytes(downloadedBytes)} / {formatBytes(totalBytes)}
                  </div>
                )}
              </div>

              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${animatedProgress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>

              <div className="text-slate-400 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>
                    {animatedProgress < 100 ? '音频下载中...' : '即将开始...'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

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

        {!isLoading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 p-4 rounded-lg bg-slate-800/30 border-l-2 border-emerald-500"
          >
            <p className="text-slate-400 text-xs leading-relaxed">
              💡 提示：点击开始后，请确保手机处于静音或免打扰模式，以获得最佳体验。音频将循环播放直到您设定的时长结束。
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
