import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, ChevronLeft, X, Play, Pause } from 'lucide-react';
import { audioEngine } from './lib/AudioEngine';
import { ContentManager, ContentConfig } from './lib/ContentManager';
import InitialChoice from './components/InitialChoice';
import NSDRDurationSelector from './components/NSDRDurationSelector';
import SleepOptionSelector from './components/SleepOptionSelector';
import ZenSleepSession from './components/ZenSleepSession';

type AppStage =
  | 'INITIAL_CHOICE'
  | 'NSDR_DURATION_SELECTOR'
  | 'SLEEP_OPTION_SELECTOR'
  | 'SESSION_PREP'
  | 'ZENSLEEP'
  | 'OFF';

interface UserConfig {
  mode: 'nsdr' | 'sleep';
  duration?: number; 
  sleepOption?: string;
  contentConfig?: ContentConfig;
}

export default function ZenSleepApp() {
  const [appStage, setAppStage] = useState<AppStage>('INITIAL_CHOICE');
  const [userConfig, setUserConfig] = useState<UserConfig>({ mode: 'sleep' });
  const [sessionProgress, setSessionProgress] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  // 用于实时更新进度的计时器引用
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 清理计时器的函数
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleExitSession = () => {
    clearTimer();
    audioEngine.terminate();
    setIsSessionActive(false);
    setSessionProgress(0);
    setAppStage('INITIAL_CHOICE');
  };

  const handleModeSelect = (mode: 'nsdr' | 'sleep') => {
    setUserConfig({ mode });
    setAppStage(mode === 'nsdr' ? 'NSDR_DURATION_SELECTOR' : 'SLEEP_OPTION_SELECTOR');
  };

  const handleNSDRDurationSelect = (duration: number) => {
    const contentConfig = ContentManager.generateContentConfig('balanced', ['nsdr'], duration);
    setUserConfig(prev => ({ ...prev, duration, contentConfig }));
    setAppStage('SESSION_PREP');
  };

  const handleSleepOptionSelect = (optionId: string) => {
    const contentConfig = ContentManager.generateContentConfig('balanced', ['sleep'], undefined, optionId);
    setUserConfig(prev => ({ ...prev, sleepOption: optionId, contentConfig }));
    setAppStage('SESSION_PREP');
  };

  // 核心修改：修复进度条显示逻辑
  const runSession = async () => {
    if (!userConfig.contentConfig) return;

    const totalDuration = userConfig.contentConfig.sessionDuration; // 假设单位为秒
    setAppStage('ZENSLEEP');
    setIsSessionActive(true);
    setSessionProgress(0);

    let elapsedSeconds = 0;
    
    // 启动实时计时器
    timerRef.current = setInterval(() => {
      elapsedSeconds += 1;
      const progress = Math.min(elapsedSeconds / totalDuration, 1);
      setSessionProgress(progress);
      
      if (elapsedSeconds >= totalDuration) {
        clearTimer();
      }
    }, 1000);

    try {
      await audioEngine.startAudioPipeline();
      
      // 这里的 audioFile 需确保路径正确，例如：/audio/nsdr/nsdr_10min.mp3
      if (userConfig.contentConfig.audioFile) {
        await audioEngine.playAudioFile(userConfig.contentConfig.audioFile);
      }

      // 等待音频播放结束（此处与计时器并行）
      await new Promise((r) => setTimeout(r, totalDuration * 1000));

      handleExitSession();
      setAppStage('OFF');
    } catch (error) {
      console.error('Session error:', error);
      handleExitSession();
      setAppStage('OFF');
    }
  };

  return (
    <div className="fixed inset-0 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <AnimatePresence mode="wait">
        {appStage === 'INITIAL_CHOICE' && <InitialChoice onModeSelect={handleModeSelect} />}
        {appStage === 'NSDR_DURATION_SELECTOR' && (
          <NSDRDurationSelector onDurationSelect={handleNSDRDurationSelect} onBack={() => setAppStage('INITIAL_CHOICE')} />
        )}
        {appStage === 'SLEEP_OPTION_SELECTOR' && (
          <SleepOptionSelector onOptionSelect={handleSleepOptionSelect} onBack={() => setAppStage('INITIAL_CHOICE')} />
        )}

        {/* 2) & 3) & 4) 修改准备页面布局与文字 */}
        {appStage === 'SESSION_PREP' && (
          <motion.div key="prep" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex items-center justify-center p-6">
            <div className="text-center space-y-10 max-w-md">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
                <Moon className="w-16 h-16 text-emerald-400 mx-auto opacity-80" />
              </motion.div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-light">准备就绪</h2>
                {userConfig.contentConfig && (
                  <p className="text-emerald-400/80 text-sm tracking-widest">
                    预计时长: {Math.floor(userConfig.contentConfig.sessionDuration / 60)} 分钟
                  </p>
                )}
                {/* 4) 添加免干扰提示 */}
                <p className="text-slate-500 text-xs leading-relaxed px-8">
                  为了达到无干扰效果，开始后屏幕将进入静谧模式（黑屏）。结束后会自动退出，如需中途操作可点击屏幕任意处。
                </p>
              </div>

              <div className="flex flex-col items-center gap-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={runSession}
                  className="px-12 py-4 rounded-full bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-900/20"
                >
                  {/* 2) 根据模式切换按钮文字 */}
                  {userConfig.mode === 'sleep' ? '开始睡眠引导' : '开始休息引导'}
                </motion.button>

                {/* 3) 增加间距并将返回按钮下移/右移感处理 */}
                <button
                  onClick={() => setAppStage('INITIAL_CHOICE')}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-300 text-sm transition-colors mt-4"
                >
                  <ChevronLeft size={16} />
                  返回重新选择
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 5) 睡眠会话页面的重构逻辑传参 */}
        {appStage === 'ZENSLEEP' && (
          <ZenSleepSession
            onExit={handleExitSession}
            totalDuration={userConfig.contentConfig?.sessionDuration || 0}
            currentProgress={sessionProgress}
          />
        )}

        {/* 会话结束 */}
        {appStage === 'OFF' && (
          <motion.div key="off" className="w-full h-full flex flex-col items-center justify-center bg-black">
            <div className="text-center space-y-4">
              <p className="text-slate-700 text-sm tracking-widest uppercase">Session Completed</p>
              <p className="text-slate-500 italic font-serif">祝你好梦</p>
              <button
                onClick={() => setAppStage('INITIAL_CHOICE')}
                className="mt-12 px-8 py-2 rounded-lg border border-slate-800 text-slate-600 text-xs hover:border-slate-600 transition-all"
              >
                回到主页
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}