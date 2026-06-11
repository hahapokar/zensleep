import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audioEngine } from './lib/AudioEngine';
import { ContentManager } from './lib/ContentManager';
import InitialChoice from './components/InitialChoice';
import NSDRDurationSelector from './components/NSDRDurationSelector';
import SleepOptionSelector from './components/SleepOptionSelector';
import MusicOptionSelector from './components/MusicDurationSelector';
import WhiteNoiseOptionSelector from './components/WhiteNoiseOptionSelector';
import DurationSelector from './components/DurationSelector';
import SessionPrep from './components/SessionPrep';
import ZenSleepSession from './components/ZenSleepSession';

type AppStage = 
  | 'INITIAL_CHOICE'
  | 'NSDR_DURATION_SELECTOR'
  | 'SLEEP_OPTION_SELECTOR'
  | 'MUSIC_OPTION_SELECTOR'
  | 'WHITENOISE_OPTION_SELECTOR'
  | 'DURATION_SELECTOR'
  | 'SESSION_PREP'
  | 'ZENSLEEP';

interface UserConfig {
  mode?: 'nsdr' | 'sleep' | 'music' | 'whitenoise';
  duration?: number;
  sleepOption?: string;
  musicOption?: string;
  whitenoiseOption?: string;
  contentConfig?: ContentConfig;
}

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
  const [totalBytes, setTotalBytes] = useState(0);
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const screenTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const isIOSRef = useRef(false);
  const initializedRef = useRef(false);
  const playbackStartTimeRef = useRef<number>(0);
  const seekBaseProgressRef = useRef<number>(0);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    isIOSRef.current = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isIOSRef.current) {
      document.body.style.setProperty('--fullscreen-height', '100dvh');
      document.body.classList.add('ios-fullscreen');
    }

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

    if (document.fullscreenElement !== null) {
      document.exitFullscreen().catch(e => {
        console.warn('[App] 退出全屏失败:', e);
      });
    }
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

    try {
      document.body.style.removeProperty('--fullscreen-height');
      document.body.classList.remove('force-fullscreen', 'ios-fullscreen');
    } catch (e) {}

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
    playbackStartTimeRef.current = Date.now();
    seekBaseProgressRef.current = progress;
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
    playbackStartTimeRef.current = Date.now();
    seekBaseProgressRef.current = 0;

    try {
      await requestWakeLock();
      startScreenAutoOff();

      if (userConfig.mode === 'music' || userConfig.mode === 'whitenoise') {
        audioEngine.setLoop(true);
      } else {
        audioEngine.setLoop(false);
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        const total = userConfig.contentConfig?.sessionDuration || 1;
        const elapsedTime = (Date.now() - playbackStartTimeRef.current) / 1000;
        
        const progress = Math.min(
          seekBaseProgressRef.current + (elapsedTime / total) * 100,
          100
        );

        setSessionProgress(progress);
        
        if (elapsedTime >= total) {
          finishSession();
        }
      }, 500);

      if ((userConfig.mode === 'music' || userConfig.mode === 'whitenoise') && userConfig.duration) {
        audioEngine.setAutoStop(userConfig.duration * 1000, () => {
          finishSession();
        });
      }

      if (userConfig.contentConfig?.audioFile) {
        await audioEngine.playLoadedAudio();

        if (userConfig.mode !== 'music' && userConfig.mode !== 'whitenoise') {
          finishSession();
        }
      }
    } catch (error) {
      console.error('[App] 播放错误:', error);

      setIsPlaying(false);
      setIsPlaybackStarted(false);
      setAudioError('音频播放失败，请检查网络或文件');
    }
  }, [finishSession, isAudioReady, isPlaybackStarted, requestWakeLock, startScreenAutoOff, userConfig.contentConfig, userConfig.mode, userConfig.duration]);

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

  const handleAudioProgress = (progress: number, downloaded: number, total: number) => {
    setAudioLoadingProgress(progress);
    setDownloadedBytes(downloaded);
    setTotalBytes(total);
  };

  const handleModeSelect = (mode: 'nsdr' | 'sleep' | 'music' | 'whitenoise') => {
    setUserConfig({ mode });
    if (mode === 'nsdr') setAppStage('NSDR_DURATION_SELECTOR');
    else if (mode === 'sleep') setAppStage('SLEEP_OPTION_SELECTOR');
    else if (mode === 'music') setAppStage('MUSIC_OPTION_SELECTOR');
    else if (mode === 'whitenoise') setAppStage('WHITENOISE_OPTION_SELECTOR');
  };

  const handleNSDRDurationSelect = (duration: number) => {
    const contentConfig = ContentManager.generateContentConfig('balanced', ['nsdr'], duration);
    setUserConfig(prev => ({ ...prev, duration, contentConfig }));
    setAppStage('SESSION_PREP');
    setIsAudioReady(false);
    setAudioLoadingProgress(0);
    
    if (contentConfig.audioFile) {
      audioEngine.prepareAudioFile(contentConfig.audioFile, handleAudioProgress)
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
      audioEngine.prepareAudioFile(contentConfig.audioFile, handleAudioProgress)
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

  const handleMusicOptionSelect = (musicOption: string) => {
    setUserConfig(prev => ({ ...prev, musicOption }));
    setAppStage('DURATION_SELECTOR');
  };

  const handleWhiteNoiseOptionSelect = (whitenoiseOption: string) => {
    setUserConfig(prev => ({ ...prev, whitenoiseOption }));
    setAppStage('DURATION_SELECTOR');
  };

  const handleDurationSelect = (duration: number) => {
    let contentConfig: ContentConfig;
    if (userConfig.mode === 'music' && userConfig.musicOption) {
      contentConfig = ContentManager.generateContentConfig('balanced', ['music'], duration, undefined, userConfig.musicOption);
    } else if (userConfig.mode === 'whitenoise' && userConfig.whitenoiseOption) {
      contentConfig = ContentManager.generateContentConfig('balanced', ['whitenoise'], duration, undefined, undefined, userConfig.whitenoiseOption);
    } else {
      contentConfig = ContentManager.generateContentConfig('balanced', ['sleep'], duration);
    }
    
    setUserConfig(prev => ({ ...prev, duration, contentConfig }));
    setAppStage('SESSION_PREP');
    setIsAudioReady(false);
    setAudioLoadingProgress(0);
    
    if (contentConfig.audioFile) {
      audioEngine.prepareAudioFile(contentConfig.audioFile, handleAudioProgress)
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
        await audioEngine.prepareAudioFile(userConfig.contentConfig.audioFile, handleAudioProgress);
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
    <div className="min-h-screen bg-slate-950">
      <AnimatePresence mode="wait">
        {appStage === 'INITIAL_CHOICE' && (
          <motion.div
            key="initial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <InitialChoice onModeSelect={handleModeSelect} />
          </motion.div>
        )}

        {appStage === 'NSDR_DURATION_SELECTOR' && (
          <motion.div
            key="nsdr-duration"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <NSDRDurationSelector
              onDurationSelect={handleNSDRDurationSelect}
              onBack={() => setAppStage('INITIAL_CHOICE')}
            />
          </motion.div>
        )}

        {appStage === 'SLEEP_OPTION_SELECTOR' && (
          <motion.div
            key="sleep-options"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <SleepOptionSelector
              onOptionSelect={handleSleepOptionSelect}
              onBack={() => setAppStage('INITIAL_CHOICE')}
            />
          </motion.div>
        )}

        {appStage === 'MUSIC_OPTION_SELECTOR' && (
          <motion.div
            key="music-options"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <MusicOptionSelector
              onMusicSelect={handleMusicOptionSelect}
              onBack={() => setAppStage('INITIAL_CHOICE')}
            />
          </motion.div>
        )}

        {appStage === 'WHITENOISE_OPTION_SELECTOR' && (
          <motion.div
            key="whitenoise-options"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <WhiteNoiseOptionSelector
              onOptionSelect={handleWhiteNoiseOptionSelect}
              onBack={() => setAppStage('INITIAL_CHOICE')}
            />
          </motion.div>
        )}

        {appStage === 'DURATION_SELECTOR' && (
          <motion.div
            key="duration-selector"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <DurationSelector
              onDurationSelect={handleDurationSelect}
              onBack={() => {
                if (userConfig.mode === 'music') {
                  setAppStage('MUSIC_OPTION_SELECTOR');
                } else if (userConfig.mode === 'whitenoise') {
                  setAppStage('WHITENOISE_OPTION_SELECTOR');
                } else {
                  setAppStage('INITIAL_CHOICE');
                }
              }}
              mode={userConfig.mode === 'whitenoise' ? 'whitenoise' : 'music'}
            />
          </motion.div>
        )}

        {appStage === 'SESSION_PREP' && (
          <motion.div
            key="prep"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <SessionPrep
              config={userConfig.contentConfig}
              isLoading={!isAudioReady}
              loadingProgress={audioLoadingProgress}
              totalBytes={totalBytes}
              downloadedBytes={downloadedBytes}
              error={audioError}
              onStart={runSession}
              onBack={() => {
                if (userConfig.mode === 'nsdr') setAppStage('NSDR_DURATION_SELECTOR');
                else if (userConfig.mode === 'sleep') setAppStage('SLEEP_OPTION_SELECTOR');
                else if (userConfig.mode === 'music') setAppStage('MUSIC_OPTION_SELECTOR');
                else if (userConfig.mode === 'whitenoise') setAppStage('WHITENOISE_OPTION_SELECTOR');
              }}
            />
          </motion.div>
        )}

        {appStage === 'ZENSLEEP' && (
          <motion.div
            key="zensleep"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ZenSleepSession
              totalDuration={userConfig.contentConfig?.sessionDuration || 1200}
              currentProgress={sessionProgress}
              isScreenOn={isScreenOn}
              isPlaying={isPlaying}
              onTapScreen={handleTapScreen}
              onSeek={handleSeekProgress}
              onTogglePlay={handlePlayPauseToggle}
              onExit={handleExitSession}
              onBackToPrep={handleExitSession}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
