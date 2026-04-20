import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronLeft, Music } from 'lucide-react';

interface MusicOption {
  id: string;
  duration: number;
  label: string;
  description: string;
}

const MUSIC_OPTIONS: MusicOption[] = [
  {
    id: 'light',
    duration: 1200,
    label: '20分钟',
    description: '轻盈 · 柔和伴眠 - 轻柔的背景音乐，适合快速入眠',
  },
  {
    id: 'balanced',
    duration: 2400,
    label: '40分钟',
    description: '平和 · 舒适陪伴 - 平衡的背景音乐，适合深度放松',
  },
  {
    id: 'deep',
    duration: 3600,
    label: '60分钟',
    description: '深度 · 完整睡眠 - 深沉的背景音乐，助力整晚安眠',
  },
];

interface MusicDurationSelectorProps {
  onMusicSelect: (musicOption: string) => void;
  onBack?: () => void;
}

export default function MusicDurationSelector({
  onMusicSelect,
  onBack,
}: MusicDurationSelectorProps) {
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleMusicSelect = (musicId: string) => {
    setSelectedMusic(musicId);
    setIsConfirming(true);
    setTimeout(() => {
      onMusicSelect(musicId);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl"
      >
        {/* 返回按钮 */}
        {onBack && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-12 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm">返回上一步</span>
          </motion.button>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* 标题 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Music className="w-8 h-8 text-emerald-400" />
              <h1 className="text-4xl font-light text-slate-100">
                选择音乐陪伴时长
              </h1>
            </div>
            <p className="text-slate-400">
              选择纯背景音乐助眠，无讲话引导，适合习惯有声音陪伴的用户
            </p>
          </div>

          {/* 选项网格 */}
          <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto px-1">
            {MUSIC_OPTIONS.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMusicSelect(option.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedMusic === option.id
                    ? 'border-emerald-400 bg-emerald-400/10'
                    : 'border-slate-700 bg-slate-800/30 hover:border-emerald-400/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedMusic === option.id
                        ? 'border-emerald-400 bg-emerald-400'
                        : 'border-slate-600'
                    }`}
                  >
                    {selectedMusic === option.id && (
                      <Check size={16} className="text-slate-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-medium text-base leading-tight ${
                        selectedMusic === option.id
                          ? 'text-emerald-100'
                          : 'text-slate-200'
                      }`}
                    >
                      {option.label}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-2">
                      {option.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* 提示 */}
          <div className="p-4 rounded-lg bg-slate-800/50 border-l-2 border-emerald-400">
            <p className="text-slate-300 text-sm">
              🎵 提示：纯背景音乐模式，没有语音引导和讲话，只有舒适的环境音乐陪伴您入睡。
            </p>
          </div>
        </motion.div>

        {/* 加载动画 */}
        <AnimatePresence>
          {isConfirming && (
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
      </motion.div>
    </div>
  );
}
