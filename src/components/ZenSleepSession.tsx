import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, Play, ChevronLeft } from 'lucide-react';
import { audioEngine } from '../lib/AudioEngine';

interface ZenSleepSessionProps {
  onExit: () => void;
  onBackToPrep: () => void;
  totalDuration: number;
  currentProgress: number;
  isScreenOn: boolean;
  isPlaying: boolean;
  onTapScreen: () => void;
  onSeek: (progress: number) => void;
  onTogglePlay: () => void;
}

export default function ZenSleepSession({
  onExit,
  onBackToPrep,
  totalDuration,
  currentProgress,
  isScreenOn,
  isPlaying,
  onTapScreen,
  onSeek,
  onTogglePlay,
}: ZenSleepSessionProps) {
  const [showUI, setShowUI] = useState(true);
  const [volume, setVolume] = useState(audioEngine.getVolume());
  const uiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 时间计算
  const displayCurrent = Math.floor(totalDuration * (currentProgress / 100));
  const displayTotal = Math.floor(totalDuration);

  // 自动隐藏UI
  useEffect(() => {
    if (showUI && isPlaying) {
      uiTimeoutRef.current = setTimeout(() => setShowUI(false), 5000);
    }
    return () => { if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current); };
  }, [showUI, isPlaying]);

  // 点击屏幕 → 同时触发亮屏 + UI显示
  const handleScreenClick = () => {
    onTapScreen();
    setShowUI(!showUI);
  };

  // 播放/暂停
  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePlay();
  };

  // 音量
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.currentTarget.value);
    setVolume(newVolume);
    audioEngine.setVolume(newVolume);
  };

  // 拖动进度条
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    onSeek(newProgress);
  };

  // 阻止进度条拖动时触发屏幕点击
  const handleSeekMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleSeekTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  // ==============================================
  // ✅ 音频结束：完全黑屏、无任何文字、无任何UI
  // ==============================================
  const isSessionFinished = currentProgress >= 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black flex items-center justify-center cursor-pointer"
      onClick={handleScreenClick}
    >

      {/* 👉 音频结束 → 永久纯黑遮罩（无文字、无UI、不耗电） */}
      {isSessionFinished ? (
        <div className="fixed inset-0 bg-black z-[200]" />
      ) : (
        <>
          {/* 熄屏遮罩 */}
          <AnimatePresence>
            {!isScreenOn && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-[100]"
              />
            )}
          </AnimatePresence>

          {/* 顶部操作栏 */}
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
                </div>
                <div className="text-emerald-500/50 text-xs tracking-widest uppercase">
                  ZenSleep Mode
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 中间播放按钮 */}
          <AnimatePresence>
            {showUI && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleTogglePlay}
                className="w-32 h-32 rounded-full border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center group transition-all hover:bg-emerald-500/10 hover:border-emerald-500/40"
              >
                {isPlaying ? (
                  <Pause size={48} className="text-emerald-400 fill-emerald-400" />
                ) : (
                  <Play size={48} className="text-emerald-400 fill-emerald-400 ml-2" />
                )}
              </motion.button>
            )}
          </AnimatePresence>

          {/* 底部进度 + 音量 */}
          <AnimatePresence>
            {showUI && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-0 left-0 right-0 p-6 pb-12 space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 进度条容器 */}
                <div className="w-full space-y-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={0.1}
                    value={currentProgress}
                    onChange={handleSeekChange}
                    onMouseDown={handleSeekMouseDown}
                    onTouchStart={handleSeekTouchStart}
                    onTouchMove={(e) => e.stopPropagation()}
                    className="w-full h-2 bg-slate-800 rounded-full cursor-pointer"
                    style={{
                      WebkitAppearance: 'none',
                      appearance: 'none',
                      background: `linear-gradient(to right, rgb(16, 185, 129) 0%, rgb(16, 185, 129) ${currentProgress}%, rgb(30, 41, 59) ${currentProgress}%, rgb(30, 41, 59) 100%)`
                    }}
                  />
                  
                  <style>{`
                    input[type="range"]::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      appearance: none;
                      width: 16px;
                      height: 16px;
                      border-radius: 50%;
                      background: rgb(16, 185, 129);
                      cursor: pointer;
                      border: 2px solid rgb(30, 41, 59);
                      transition: transform 0.2s;
                    }
                    input[type="range"]::-webkit-slider-thumb:hover {
                      transform: scale(1.2);
                    }
                    input[type="range"]::-moz-range-thumb {
                      width: 16px;
                      height: 16px;
                      border-radius: 50%;
                      background: rgb(16, 185, 129);
                      cursor: pointer;
                      border: 2px solid rgb(30, 41, 59);
                    }
                  `}</style>
                </div>
                
                <div className="flex justify-center text-slate-500 font-mono text-xs tracking-tighter">
                  <span className="text-slate-300">{formatTime(displayCurrent)}</span>
                  <span className="mx-2 opacity-30">/</span>
                  <span>{formatTime(displayTotal)}</span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <span className="text-slate-500 text-xs">🔊</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    onMouseDown={handleSeekMouseDown}
                    onTouchStart={handleSeekTouchStart}
                    onTouchMove={(e) => e.stopPropagation()}
                    className="flex-1 h-2 bg-slate-800 rounded-full cursor-pointer"
                    style={{
                      WebkitAppearance: 'none',
                      appearance: 'none',
                      background: `linear-gradient(to right, rgb(16, 185, 129) 0%, rgb(16, 185, 129) ${volume * 100}%, rgb(30, 41, 59) ${volume * 100}%, rgb(30, 41, 59) 100%)`
                    }}
                  />
                  <span className="text-slate-500 text-xs w-8 text-right">{Math.round(volume * 100)}%</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 闲置提示 */}
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
                {isPlaying ? "静谧冥想中" : "点击播放开始"}
              </motion.span>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
