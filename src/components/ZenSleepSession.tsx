import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, Play, X, ChevronLeft } from 'lucide-react';
import { audioEngine } from '../lib/AudioEngine';

interface ZenSleepSessionProps {
  onExit: () => void;
  onBackToPrep: () => void; // 新增：返回准备页
  totalDuration: number; // 确保单位为秒
  currentProgress: number; // 0-1
}

export default function ZenSleepSession({
  onExit,
  onBackToPrep,
  totalDuration,
  currentProgress,
}: ZenSleepSessionProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [showUI, setShowUI] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const uiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 格式化时间函数
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1) 修复时间显示逻辑 (假设传入的是秒)
  const displayCurrent = Math.floor(totalDuration * currentProgress);
  const displayTotal = Math.floor(totalDuration);

  // 屏幕唤醒锁逻辑 (保持不变)
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          const lock = await navigator.wakeLock.request('screen');
          setWakeLock(lock);
        } catch (err) { console.error(err); }
      }
    };
    requestWakeLock();
    return () => { wakeLock?.release(); };
  }, []);

  // 自动隐藏UI (10秒)
  useEffect(() => {
    if (showUI && !isPaused) {
      uiTimeoutRef.current = setTimeout(() => setShowUI(false), 10000);
    }
    return () => { if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current); };
  }, [showUI, isPaused]);

  const handleScreenClick = () => setShowUI(!showUI);

  const togglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPaused) audioEngine.pause();
    else audioEngine.resume();
    setIsPaused(!isPaused);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black flex items-center justify-center cursor-pointer"
      onClick={handleScreenClick}
    >
      {/* 5) 顶部操作区：返回上一页和关闭 */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-6">
              <button 
                onClick={onBackToPrep}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm"
              >
                <ChevronLeft size={20} /> 返回
              </button>
              <button 
                onClick={onExit}
                className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors text-sm"
              >
                <X size={20} /> 关闭会话
              </button>
            </div>
            <div className="text-emerald-500/50 text-xs tracking-widest uppercase">
              ZenSleep Mode
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5) 中间部分：巨大的圆形暂停键 */}
      <AnimatePresence>
        {showUI && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={togglePause}
            className="w-32 h-32 rounded-full border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center group transition-all hover:bg-emerald-500/10 hover:border-emerald-500/40"
          >
            {isPaused ? (
              <Play size={48} className="text-emerald-400 fill-emerald-400 ml-2" />
            ) : (
              <Pause size={48} className="text-emerald-400 fill-emerald-400" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* 5) 底部部分：整合进度条和时间 */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 p-10 pb-16 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 进度条 */}
            <div className="relative h-1 bg-slate-900 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                style={{ width: `${currentProgress * 100}%` }}
                transition={{ type: 'spring', bounce: 0, duration: 1 }}
              />
            </div>
            
            {/* 时间显示：已播放 / 总时间 */}
            <div className="flex justify-center text-slate-500 font-mono text-xs tracking-tighter">
              <span className="text-slate-300">{formatTime(displayCurrent)}</span>
              <span className="mx-2 opacity-30">/</span>
              <span>{formatTime(displayTotal)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 未点击时的呼吸提示 */}
      {!showUI && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none text-slate-800 text-[10px] tracking-[0.4em] uppercase"
        >
          <motion.span
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            {isPaused ? "已暂停 - 点击继续" : "静谧冥想中"}
          </motion.span>
        </motion.div>
      )}
    </motion.div>
  );
}