import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, ChevronLeft } from 'lucide-react';
import { audioEngine } from './lib/AudioEngine';
import { ContentManager, ContentConfig } from './lib/ContentManager';
import InitialChoice from './components/InitialChoice';
import NSDRDurationSelector from './components/NSDRDurationSelector';
import SleepOptionSelector from './components/SleepOptionSelector';
import MusicDurationSelector from './components/MusicDurationSelector';
import ZenSleepSession from './components/ZenSleepSession';

type AppStage =
  | 'INITIAL_CHOICE'
  | 'NSDR_DURATION_SELECTOR'
  | 'SLEEP_OPTION_SELECTOR'
  | 'MUSIC_DURATION_SELECTOR'
  | 'SESSION_PREP'
  | 'ZENSLEEP';

interface UserConfig {
  mode: 'nsdr' | 'sleep' | 'music';
  duration?: number;
  sleepOption?: string;
  musicOption?: string;
  contentConfig?: ContentConfig;
}

export default function ZenSleepApp() {
  const [appStage, setAppStage] = useState<AppStage>('INITIAL_CHOICE');
  const [userConfig, setUserConfig] = useState<UserConfig>({ mode: 'sleep' });
  const [sessionProgress, setSessionProgress] = useState(0);
  const [isScreenOn, setIsScreenOn] = useState(true);
  const [isPlaybackStarted, setIsPlaybackStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const screenTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // --- 全屏 ---
  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (e) {}
  };

  const exitFullscreen = () => {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
    } catch (e) {}
  };

  // --- 屏幕常亮锁（播放时保持不息屏，结束立刻释放）---
  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch (e) {}
  }, []);

  const releaseWakeLock = useCallback(() => {
    try {
      if (wakeLockRef.current) wakeLockRef.current.release();
    } catch (e) {}
  }, []);

  // --- 自动熄屏（5秒黑）---
  const startScreenAutoOff = useCallback(() => {
    if (screenTimerRef.current) clearTimeout(screenTimerRef.current);
    setIsScreenOn(true);
    screenTimerRef.current = setTimeout(() => setIsScreenOn(false), 5000);
  }, []);

  const handleTapScreen = useCallback(() => {
    startScreenAutoOff();
  }, [startScreenAutoOff]);

  // --- 彻底清理所有资源 ---
  const resetSession = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (screenTimerRef.current) clearTimeout(screenTimerRef.current);
    timerRef.current = null;
    screenTimerRef.current = null;

    audioEngine.stop();
    audioEngine.terminate();

    releaseWakeLock();
    exitFullscreen();

    setSessionProgress(0);
    setIsScreenOn(true);
    setIsPlaybackStarted(false);
    setIsPlaying(false);
  }, [releaseWakeLock]);

  const finishSession = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (screenTimerRef.current) clearTimeout(screenTimerRef.current);
    timerRef.current = null;
    screenTimerRef.current = null;

    audioEngine.stop();
    audioEngine.terminate();

    releaseWakeLock();
    exitFullscreen();

    setSessionProgress(100);
    setIsScreenOn(false);
    setIsPlaybackStarted(false);
    setIsPlaying(false);
  }, [releaseWakeLock]);

  // --- 退出会话（手动）---
  const handleExitSession = useCallback(() => {
    resetSession();
    setAppStage('INITIAL_CHOICE');
  }, [resetSession]);

  // --- 拖动进度条 ---
  const handleSeekProgress = useCallback((progress: number) => {
    if (!userConfig.contentConfig) return;
    const total = userConfig.contentConfig.sessionDuration;
    const seekTime = (progress / 100) * total;
    audioEngine.seek(seekTime);
    setSessionProgress(progress);
  }, [userConfig.contentConfig]);

  // --- 播放/暂停按钮 ---
  const startPlayback = useCallback(async () => {
    if (isPlaybackStarted) return;
    setIsPlaybackStarted(true);
    setIsPlaying(true);

    try {
      await requestWakeLock();
      startScreenAutoOff();

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        const total = userConfig.contentConfig?.sessionDuration || 1;
        const currentTime = audioEngine.getCurrentTime();
        const progress = Math.min((currentTime / total) * 100, 100);
        setSessionProgress(progress);
      }, 200);

      if (userConfig.contentConfig?.audioFile) {
        await audioEngine.playLoadedAudio();
      }
    } catch (error) {
      console.error('Playback error:', error);
    } finally {
      finishSession();
    }
  }, [finishSession, isPlaybackStarted, requestWakeLock, startScreenAutoOff, userConfig.contentConfig]);

  const handlePlayPauseToggle = useCallback(() => {
    if (!isPlaybackStarted) {
      startPlayback();
      return;
    }

    if (isPlaying) {
      audioEngine.pause();
    } else {
      audioEngine.resume();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaybackStarted, isPlaying, startPlayback]);

  // --- 选择模式 ---
  const handleModeSelect = (mode: 'nsdr' | 'sleep' | 'music') => {
    setUserConfig({ mode });
    if (mode === 'nsdr') setAppStage('NSDR_DURATION_SELECTOR');
    else if (mode === 'sleep') setAppStage('SLEEP_OPTION_SELECTOR');
    else if (mode === 'music') setAppStage('MUSIC_DURATION_SELECTOR');
  };

  const handleNSDRDurationSelect = (duration: number) => {
    const contentConfig = ContentManager.generateContentConfig('balanced', ['nsdr'], duration);
    setUserConfig(prev => ({ ...prev, duration, contentConfig }));
    setAppStage('SESSION_PREP');
    
    // 异步预加载音频文件，不阻塞UI过渡
    if (contentConfig.audioFile) {
      audioEngine.prepareAudioFile(contentConfig.audioFile).catch(console.warn);
    }
  };

  const handleSleepOptionSelect = (optionId: string) => {
    const contentConfig = ContentManager.generateContentConfig('balanced', ['sleep'], undefined, optionId);
    setUserConfig(prev => ({ ...prev, sleepOption: optionId, contentConfig }));
    setAppStage('SESSION_PREP');
    
    // 异步预加载音频文件，不阻塞UI过渡
    if (contentConfig.audioFile) {
      audioEngine.prepareAudioFile(contentConfig.audioFile).catch(console.warn);
    }
  };

  const handleMusicDurationSelect = (musicOption: string) => {
    const contentConfig = ContentManager.generateContentConfig('balanced', ['music'], undefined, undefined, musicOption);
    setUserConfig(prev => ({ ...prev, musicOption, contentConfig }));
    setAppStage('SESSION_PREP');
    
    // 异步预加载音频文件，不阻塞UI过渡
    if (contentConfig.audioFile) {
      audioEngine.prepareAudioFile(contentConfig.audioFile).catch(console.warn);
    }
  };

  // --- 核心：开始播放 ---
  const runSession = async () => {
    if (!userConfig.contentConfig) return;

    if (userConfig.contentConfig.audioFile) {
      try {
        await audioEngine.prepareAudioFile(userConfig.contentConfig.audioFile);
      } catch (error) {
        console.error(error);
      }
    }

    await enterFullscreen();

    setAppStage('ZENSLEEP');
    setSessionProgress(0);
    setIsScreenOn(true);
    setIsPlaybackStarted(false);
    setIsPlaying(false);
  };

  // --- 页面卸载强制清理 ---
  useEffect(() => {
    return () => resetSession();
  }, [resetSession]);

  return (
    <div className="fixed inset-0 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <AnimatePresence mode="wait">
        {appStage === 'INITIAL_CHOICE' && <InitialChoice onModeSelect={handleModeSelect} />}

        {appStage === 'NSDR_DURATION_SELECTOR' && (
          <NSDRDurationSelector
            onDurationSelect={handleNSDRDurationSelect}
            onBack={() => setAppStage('INITIAL_CHOICE')}
          />
        )}

        {appStage === 'SLEEP_OPTION_SELECTOR' && (
          <SleepOptionSelector
            onOptionSelect={handleSleepOptionSelect}
            onBack={() => setAppStage('INITIAL_CHOICE')}
          />
        )}

        {appStage === 'MUSIC_DURATION_SELECTOR' && (
          <MusicDurationSelector
            onMusicSelect={handleMusicDurationSelect}
            onBack={() => setAppStage('INITIAL_CHOICE')}
          />
        )}

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
                <p className="text-slate-500 text-xs leading-relaxed px-8">
                  第一次播放需要时间缓存，以后即可迅速打开播放。开始后屏幕会自动熄屏。点击任意位置可重新点亮屏幕。播放结束后会自动退出程序，不需要任何操作。祝您有个好梦。
                </p>
              </div>

              <div className="flex flex-col items-center gap-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={runSession}
                  className="px-12 py-4 rounded-full bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-900/20"
                >
                  {userConfig.mode === 'sleep' ? '开始睡眠引导' : userConfig.mode === 'nsdr' ? '开始放松引导' : '开始音乐陪伴'}
                </motion.button>

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

        {appStage === 'ZENSLEEP' && (
          <ZenSleepSession
            onExit={handleExitSession}
            onBackToPrep={() => {
              resetSession();
              setAppStage('SESSION_PREP');
            }}
            totalDuration={userConfig.contentConfig?.sessionDuration || 0}
            currentProgress={sessionProgress}
            isScreenOn={isScreenOn}
            isPlaying={isPlaying}
            onTapScreen={handleTapScreen}
            onSeek={handleSeekProgress}
            onTogglePlay={handlePlayPauseToggle}
          />
        )}
      </AnimatePresence>
    </div>
  );
}