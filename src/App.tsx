import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Shield, Settings, ChevronLeft } from 'lucide-react';
import { audioEngine } from './lib/AudioEngine';
import { initializeAzureTTS, AzureTTS } from './lib/AzureTTS';
import { ContentManager, ContentConfig } from './lib/ContentManager';
import { ScriptManager } from './data/scripts';
import { SymptomType } from './data/symptoms/index';
import InitialChoice from './components/InitialChoice';
import UserProfile from './components/UserProfile';
import SymptomSelector from './components/SymptomSelector';

type AppStage =
  | 'INITIAL_CHOICE'
  | 'USER_PROFILE'
  | 'SYMPTOM_SELECTOR'
  | 'SESSION_PREP'
  | 'ZENSLEEP'
  | 'OFF';

interface UserConfig {
  mode: 'nsdr' | 'sleep';
  constitution?: string;
  symptoms: string[];
  contentConfig?: ContentConfig;
}

export default function ZenSleepApp() {
  const [appStage, setAppStage] = useState<AppStage>('INITIAL_CHOICE');
  const [userConfig, setUserConfig] = useState<UserConfig>({
    mode: 'sleep',
    symptoms: [],
  });
  const [azureTTS, setAzureTTS] = useState<AzureTTS | null>(null);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // 初始化 Azure TTS
  useEffect(() => {
    try {
      const tts = initializeAzureTTS();
      setAzureTTS(tts);
    } catch (error) {
      console.warn('Azure TTS 初始化失败，将使用 Web Speech API:', error);
    }
  }, []);

  // 处理初始选择
  const handleModeSelect = (mode: 'nsdr' | 'sleep') => {
    if (mode === 'nsdr') {
      // NSDR模式：直接使用nsdr脚本
      setUserConfig({
        mode: 'nsdr',
        symptoms: ['nsdr'],
        contentConfig: ContentManager.generateContentConfig('balanced', ['nsdr']),
      });
      setAppStage('SESSION_PREP');
    } else {
      // 睡眠模式：进入体质选择流程
      setAppStage('USER_PROFILE');
    }
  };

  // 处理体质选择
  const handleConstitutionSelect = (constitutionId: string) => {
    setUserConfig((prev) => ({
      ...prev,
      constitution: constitutionId,
    }));
    setAppStage('SYMPTOM_SELECTOR');
  };

  // 处理症状选择
  const handleSymptomsSelect = (symptoms: string[]) => {
    const constitution = userConfig.constitution || 'balanced';
    const contentConfig = ContentManager.generateContentConfig(
      constitution,
      symptoms
    );

    setUserConfig((prev) => ({
      ...prev,
      symptoms,
      contentConfig,
    }));
    setAppStage('SESSION_PREP');
  };

  // 使用 TTS 或 Web Speech API 讲话
  const speak = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        const voiceSettings = userConfig.contentConfig?.voiceSettings || {
          rate: 0.5,
          pitch: 0.6,
        };

        if (azureTTS) {
          // 使用 Azure TTS
          azureTTS.speak(text, 
            () => audioEngine.fadeBackgroundForVoice(true),
            () => {
              audioEngine.fadeBackgroundForVoice(false);
              setTimeout(resolve, 1000);
            }
          ).catch(() => {
            // 如果 Azure TTS 失败，回退到 Web Speech API
            useWebSpeechAPI(text, voiceSettings, resolve);
          });
        } else {
          // 使用 Web Speech API
          useWebSpeechAPI(text, voiceSettings, resolve);
        }
      });
    },
    [azureTTS, userConfig.contentConfig?.voiceSettings]
  );

  const useWebSpeechAPI = (
    text: string,
    voiceSettings: { rate: number; pitch: number },
    resolve: (value: void) => void
  ) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = voiceSettings.rate;
    u.pitch = voiceSettings.pitch;
    u.onstart = () => audioEngine.fadeBackgroundForVoice(true);
    u.onend = () => {
      audioEngine.fadeBackgroundForVoice(false);
      setTimeout(resolve, 1000);
    };
    window.speechSynthesis.speak(u);
  };

  const runSession = async () => {
    if (!userConfig.contentConfig) return;

    setAppStage('ZENSLEEP');
    setIsSessionActive(true);
    setSessionProgress(0);

    try {
      await audioEngine.startAudioPipeline();

      const config = userConfig.contentConfig;
      const totalDuration = config.sessionDuration;
      let elapsedTime = 0;

      // 第一阶段：感知与放松 (300 秒 = 5 分钟)
      audioEngine.evolveState(6, 600, 300);
      const stage1Scripts = ScriptManager.getCustomizedScript(
        config.scriptSequence[0],
        userConfig.constitution,
        userConfig.symptoms[0] as SymptomType
      );
      for (const text of stage1Scripts) {
        await speak(text);
      }
      elapsedTime += 300;
      setSessionProgress(Math.min(elapsedTime / totalDuration, 1));
      await new Promise((r) => setTimeout(r, 260000));

      // 第二阶段：意识沉降 (600 秒 = 10 分钟)
      audioEngine.evolveState(3, 300, 600);
      const stage2Scripts = ScriptManager.getCustomizedScript(
        config.scriptSequence[1],
        userConfig.constitution,
        userConfig.symptoms[0] as SymptomType
      );
      for (const text of stage2Scripts) {
        await speak(text);
      }
      elapsedTime += 600;
      setSessionProgress(Math.min(elapsedTime / totalDuration, 1));
      await new Promise((r) => setTimeout(r, 580000));

      // 第三阶段：呼吸同步
      audioEngine.evolveState(1.5, 150, 300);
      const stage3Scripts = config.scriptSequence[2]
        ? ScriptManager.getCustomizedScript(config.scriptSequence[2])
        : [];
      for (const text of stage3Scripts) {
        await speak(text);
      }

      let currentCycle = 4000;
      const targetCycle = 8000;
      const breathStartTime = Date.now();
      const breathDuration = 900000; // 15 分钟

      const breathInterval = setInterval(() => {
        audioEngine.syncBreathing('INHALE', currentCycle / 2);
        setTimeout(
          () => audioEngine.syncBreathing('EXHALE', currentCycle / 2),
          currentCycle / 2
        );
        if (currentCycle < targetCycle) currentCycle += 100;

        const elapsed = Date.now() - breathStartTime;
        elapsedTime = 300 + 600 + 900 + Math.floor(elapsed / 1000);
        setSessionProgress(Math.min(elapsedTime / totalDuration, 1));

        if (elapsed > breathDuration) clearInterval(breathInterval);
      }, currentCycle);

      await new Promise((r) => setTimeout(r, breathDuration + 10000));

      // 第四阶段：深度睡眠
      const deepSleepDuration = Math.max(
        totalDuration - elapsedTime - 60,
        600000
      ); // 至少 10 分钟，给唤醒留 60 秒
      console.log(
        `Deep sleep duration: ${Math.floor(deepSleepDuration / 1000)} seconds`
      );
      await new Promise((r) => setTimeout(r, deepSleepDuration));

      // 唤醒阶段
      await speak('现在，是时候缓慢地回到这个世界了。');
      await speak('保持这份深度的放松与宁静。');
      await speak('开始感受你的身体。慢慢地活动你的肢体。');
      await speak('睁开眼睛，保持这份平静。');

      audioEngine.terminate();
      setAppStage('OFF');
    } catch (error) {
      console.error('Session error:', error);
      audioEngine.terminate();
      setAppStage('OFF');
    } finally {
      setIsSessionActive(false);
    }
  };

  return (
    <div className="fixed inset-0 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <AnimatePresence mode="wait">
        {/* 初始选择 */}
        {appStage === 'INITIAL_CHOICE' && (
          <InitialChoice onModeSelect={handleModeSelect} />
        )}

        {/* 体质问卷 */}
        {appStage === 'USER_PROFILE' && (
          <UserProfile
            onConstitutionSelect={handleConstitutionSelect}
            onBack={() => setAppStage('INITIAL_CHOICE')}
          />
        )}

        {/* 症状选择 */}
        {appStage === 'SYMPTOM_SELECTOR' && (
          <SymptomSelector
            onSymptomsSelect={handleSymptomsSelect}
            onBack={() => setAppStage('USER_PROFILE')}
          />
        )}

        {/* 会话准备 */}
        {appStage === 'SESSION_PREP' && (
          <motion.div
            key="prep"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex items-center justify-center p-6"
          >
            <div className="text-center space-y-8 max-w-md">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Moon className="w-16 h-16 text-emerald-400 mx-auto" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-2xl font-light text-slate-100">
                  准备就绪
                </h2>
                <p className="text-slate-400">
                  请为您的睡眠体验做好准备...
                </p>
                {userConfig.contentConfig && (
                  <p className="text-slate-500 text-sm mt-4">
                    会话时长: {Math.floor(userConfig.contentConfig.sessionDuration / 60)} 分钟
                  </p>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={runSession}
                className="px-8 py-3 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
              >
                开始会话
              </motion.button>
              <button
                onClick={() => setAppStage('INITIAL_CHOICE')}
                className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
              >
                返回选择
              </button>
            </div>
          </motion.div>
        )}

        {/* 睡眠会话 */}
        {appStage === 'ZENSLEEP' && (
          <motion.div
            key="session"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.02 }}
            className="w-full h-full flex flex-col items-center justify-center"
          >
            <div className="space-y-4">
              <Shield className="w-6 h-6 text-slate-700 mx-auto" />
              <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${sessionProgress * 100}%` }}
                  className="h-full bg-emerald-400/30"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* 会话结束 */}
        {appStage === 'OFF' && (
          <motion.div
            key="off"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ opacity: [0.05, 0.1, 0.05] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-center space-y-4"
            >
              <p className="text-slate-700 text-sm tracking-widest">
                睡眠指导完成
              </p>
              <p className="text-slate-800 text-xs">Good Night.</p>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                onClick={() => {
                  setAppStage('INITIAL_CHOICE');
                  setUserConfig({ mode: 'sleep', symptoms: [] });
                }}
                className="mt-8 px-6 py-2 rounded-lg border border-slate-700 text-slate-500 text-xs hover:text-slate-300 transition-colors"
              >
                返回主页
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}