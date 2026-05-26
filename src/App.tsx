import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, ChevronLeft, Loader2 } from 'lucide-react';
import { audioEngine } from './lib/AudioEngine';
import { ContentManager, ContentConfig } from './lib/ContentManager';
import InitialChoice from './components/InitialChoice';
import NSDRDurationSelector from './components/NSDRDurationSelector';
import SleepOptionSelector from './components/SleepOptionSelector';
import MusicDurationSelector from './components/MusicDurationSelector';
import WhiteNoiseOptionSelector from './components/WhiteNoiseOptionSelector';
import ZenSleepSession from './components/ZenSleepSession';

type AppStage =
  | 'INITIAL_CHOICE'
  | 'NSDR_DURATION_SELECTOR'
  | 'SLEEP_OPTION_SELECTOR'
  | 'MUSIC_DURATION_SELECTOR'
  | 'WHITENOISE_OPTION_SELECTOR'
  | 'SESSION_PREP'
  | 'ZENSLEEP';

interface UserConfig {
  mode: 'nsdr' | 'sleep' | 'music' | 'whitenoise';
  duration?: number;
  sleepOption?: string;
  musicOption?: string;
  whitenoiseOption?: string;
  contentConfig?: ContentConfig;
}

export default function ZenSleepApp() {
  const [appStage, setAppStage] = useState<AppStage>('INITIAL_CHOICE');
  const [userConfig, setUserConfig] = useState<UserConfig>({ mode: 'sleep' });
  const [sessionProgress, setSessionProgress] = useState(0);
  const [isScreenOn, setIsScreenOn] = useState(true);
  const [isPlaybackStarted, setIsPlaybackStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [audioLoadingProgress, setAudioLoadingProgress] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const screenTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const isIOSRef = useRef(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Prevent double-run under React StrictMode
    if (initializedRef.current) return;
    initializedRef.current = true;

    isIOSRef.current = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isIOSRef.current) {
      document.body.style.setProperty('--fullscreen-height', '100dvh');
      document.body.classList.add('ios-fullscreen');
    }

    // 公开诊断工具到全局作用域（用于开发者工具调试）
    (window as any).zenSleepDiagnose = () => {
      console.log('[App] 运行诊断工具...');
      return audioEngine.diagnoseR2Connection();
    };
    
    console.log('[App] 💡 提示: 在开发者工具中运行 zenSleepDiagnose() 诊断 R2 连接问题');
  }, []);

  const enterFullscreen = async () => {
    if (isIOSRef.current) {
      console.log('[App] iOS 设备，使用 CSS 全屏模式');
      document.body.classList.add('force-fullscreen');
      return;
    }

    try {
      if (document.fullscreenElement === null) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.warn('[App] 全屏模式不可用:', e);
    }
  };

  const exitFullscreen = () => {
    if (isIOSRef.current) {
      document.body.classList.remove('force-fullscreen');
      return;
    }
    try {
      if (document.fullscreenElement) document.exitFullscreen();
    } catch (e) {}
  };

  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('[App] WakeLock 已申请');
      }
    } catch (e) {
      console.warn('[App] WakeLock 申请失败:', e);
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    try {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        console.log('[App] WakeLock 已释放');
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isPlaying) {
        console.log('[App] 页面重新可见，重新申请 WakeLock');
        await requestWakeLock();
        startScreenAutoOff();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying, requestWakeLock]);

  const startScreenAutoOff = useCallback(() => {
    if (screenTimerRef.current) clearTimeout(screenTimerRef.current);
    setIsScreenOn(true);
    screenTimerRef.current = setTimeout(() => setIsScreenOn(false), 5000);
  }, []);

  const handleTapScreen = useCallback(() => {
    startScreenAutoOff();
  }, [startScreenAutoOff]);

  const resetSession = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (screenTimerRef.current) clearTimeout(screenTimerRef.current);
    timerRef.current = null;
    screenTimerRef.current = null;

    audioEngine.terminate();

    releaseWakeLock();
    exitFullscreen();

    setSessionProgress(0);
    setIsScreenOn(true);
    setIsPlaybackStarted(false);
    setIsPlaying(false);
    setIsAudioReady(false);
    setAudioLoadingProgress(0);
  }, [releaseWakeLock]);

  const finishSession = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (screenTimerRef.current) clearTimeout(screenTimerRef.current);
    timerRef.current = null;
    screenTimerRef.current = null;

    audioEngine.terminate();

    releaseWakeLock();
    exitFullscreen();

    // 清理 iOS 专用样式（避免页面无法滚动恢复）
    try {
      document.body.style.removeProperty('--fullscreen-height');
      document.body.classList.remove('force-fullscreen', 'ios-fullscreen');
    } catch (e) {}

    setSessionProgress(100);
    setIsScreenOn(false);
    setIsPlaybackStarted(false);
    setIsPlaying(false);
    setIsAudioReady(false);
    setAudioLoadingProgress(0);
  }, [releaseWakeLock]);

  const handleExitSession = useCallback(() => {
    resetSession();
    setAppStage('INITIAL_CHOICE');
  }, [resetSession]);

  const handleSeekProgress = useCallback((progress: number) => {
    if (!userConfig.contentConfig) return;
    const total = userConfig.contentConfig.sessionDuration;
    const seekTime = (progress / 100) * total;
    audioEngine.seek(seekTime);
    setSessionProgress(progress);
  }, [userConfig.contentConfig]);

  const startPlayback = useCallback(async () => {
    if (isPlaybackStarted) return;
    if (!isAudioReady) {
      console.log('[App] 音频还在加载中，请稍候...');
      return;
    }
    setIsPlaybackStarted(true);
    setIsPlaying(true);

    try {
      await requestWakeLock();
      startScreenAutoOff();

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        const total = userConfig.contentConfig?.sessionDuration || 1;
        const currentTime = audioEngine.getCurrentTime();

        const progress = Math.min(
          (currentTime / total) * 100,
          100
        );

        setSessionProgress(progress);
      }, 500);

      if (userConfig.contentConfig?.audioFile) {
        await audioEngine.playLoadedAudio();

        // 只有正常播放结束才 finish
        finishSession();
      }
    } catch (error) {
      console.error('[App] 播放错误:', error);

      setIsPlaying(false);
      setIsPlaybackStarted(false);
      setAudioError('音频播放失败，请检查网络或文件');
    }
  }, [finishSession, isAudioReady, isPlaybackStarted, requestWakeLock, startScreenAutoOff, userConfig.contentConfig]);

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
    setIsPlaying(prev => !prev);
  }, [isPlaybackStarted, isPlaying, startPlayback]);

  const handleModeSelect = (mode: 'nsdr' | 'sleep' | 'music' | 'whitenoise') => {
    setUserConfig({ mode });
    if (mode === 'nsdr') setAppStage('NSDR_DURATION_SELECTOR');
    else if (mode === 'sleep') setAppStage('SLEEP_OPTION_SELECTOR');
    else if (mode === 'music') setAppStage('MUSIC_DURATION_SELECTOR');
    else if (mode === 'whitenoise') setAppStage('WHITENOISE_OPTION_SELECTOR');
  };

  const handleNSDRDurationSelect = (duration: number) => {
    const contentConfig = ContentManager.generateContentConfig('balanced', ['nsdr'], duration);
    setUserConfig(prev => ({ ...prev, duration, contentConfig }));
    setAppStage('SESSION_PREP');
    setIsAudioReady(false);
    setAudioLoadingProgress(0);
    
    if (contentConfig.audioFile) {
      audioEngine.prepareAudioFile(contentConfig.audioFile)
        .then(() => {
          setIsAudioReady(true);
          setAudioLoadingProgress(100);
          console.log('[App] 音频已准备就绪');
        })
        .catch((err) => {
          console.error('[App] 音频预加载失败:', err);
        });
    } else {
      setIsAudioReady(true);
    }
  };

  const handleSleepOptionSelect = (optionId: string) => {
    const contentConfig = ContentManager.generateContentConfig('balanced', ['sleep'], undefined, optionId);
    setUserConfig(prev => ({ ...prev, sleepOption: optionId, contentConfig }));
    setAppStage('SESSION_PREP');
    setIsAudioReady(false);
    setAudioLoadingProgress(0);
    
    if (contentConfig.audioFile) {
      audioEngine.prepareAudioFile(contentConfig.audioFile)
        .then(() => {
          setIsAudioReady(true);
          setAudioLoadingProgress(100);
          console.log('[App] 音频已准备就绪');
        })
        .catch((err) => {
          console.error('[App] 音频预加载失败:', err);
        });
    } else {
      setIsAudioReady(true);
    }
  };

  const handleMusicDurationSelect = (musicOption: string) => {
    const contentConfig = ContentManager.generateContentConfig('balanced', ['music'], undefined, undefined, musicOption);
    setUserConfig(prev => ({ ...prev, musicOption, contentConfig }));
    setAppStage('SESSION_PREP');
    setIsAudioReady(false);
    setAudioLoadingProgress(0);
    
    if (contentConfig.audioFile) {
      audioEngine.prepareAudioFile(contentConfig.audioFile)
        .then(() => {
          setIsAudioReady(true);
          setAudioLoadingProgress(100);
          console.log('[App] 音频已准备就绪');
        })
        .catch((err) => {
          console.error('[App] 音频预加载失败:', err);
        });
    } else {
      setIsAudioReady(true);
    }
  };

  const handleWhiteNoiseOptionSelect = (whitenoiseOption: string) => {
    const contentConfig = ContentManager.generateContentConfig('balanced', ['whitenoise'], undefined, undefined, undefined, whitenoiseOption);
    setUserConfig(prev => ({ ...prev, whitenoiseOption, contentConfig }));
    setAppStage('SESSION_PREP');
    setIsAudioReady(false);
    setAudioLoadingProgress(0);
    
    if (contentConfig.audioFile) {
      audioEngine.prepareAudioFile(contentConfig.audioFile)
        .then(() => {
          setIsAudioReady(true);
          setAudioLoadingProgress(100);
          console.log('[App] 音频已准备就绪');
        })
        .catch((err) => {
          console.error('[App] 音频预加载失败:', err);
        });
    } else {
      setIsAudioReady(true);
    }
  };

  const runSession = async () => {
    if (!userConfig.contentConfig) return;

    if (userConfig.contentConfig.audioFile) {
      try {
        await audioEngine.prepareAudioFile(userConfig.contentConfig.audioFile);
      } catch (error) {
        console.error('[App] 音频加载失败:', error);
      }
    }

    await enterFullscreen();

    setAppStage('ZENSLEEP');
    setSessionProgress(0);
    setIsScreenOn(true);
    setIsPlaybackStarted(false);
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => resetSession();
  }, [resetSession]);

  return (
    <div className="fixed inset-0 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <style>{`
        body.ios-fullscreen {
          height: 100dvh;
          overflow: hidden;
          position: fixed;
          width: 100vw;
        }
        
        body.force-fullscreen {
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
          position: fixed;
          width: 100vw;
          top: 0;
          left: 0;
          z-index: 99999;
        }
      `}</style>
      
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

        {appStage === 'WHITENOISE_OPTION_SELECTOR' && (
          <WhiteNoiseOptionSelector
            onOptionSelect={handleWhiteNoiseOptionSelect}
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
                
                {!isAudioReady && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>正在加载音频...</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                )}
                
                <p className="text-slate-500 text-xs leading-relaxed px-8">
                  {isAudioReady ? '音频已准备就绪，可以开始播放。' : '正在预加载音频，请稍候...'}
                  第一次播放需要时间缓存，以后即可迅速打开播放。开始后屏幕会自动熄屏。点击任意位置可重新点亮屏幕。播放结束后会自动退出程序，不需要任何操作。祝您有个好梦。
                </p>
              </div>

              <div className="flex flex-col items-center gap-6">
                <motion.button
                  whileHover={isAudioReady ? { scale: 1.05 } : {}}
                  whileTap={isAudioReady ? { scale: 0.95 } : {}}
                  onClick={runSession}
                  disabled={!isAudioReady}
                  className={`px-12 py-4 rounded-full font-medium shadow-lg transition-all ${
                    isAudioReady 
                      ? 'bg-emerald-500 text-white shadow-emerald-900/20 cursor-pointer' 
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {!isAudioReady ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      正在加载音频...
                    </span>
                  ) : (
                    userConfig.mode === 'sleep' ? '开始睡眠引导' : 
                    userConfig.mode === 'nsdr' ? '开始放松引导' : 
                    userConfig.mode === 'whitenoise' ? '开始白噪音' : '开始音乐陪伴'
                  )}
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
