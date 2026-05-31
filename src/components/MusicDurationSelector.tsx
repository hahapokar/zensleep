import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronLeft, Music, Bell, Music2, Disc } from 'lucide-react';

interface MusicOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const MUSIC_OPTIONS: MusicOption[] = [
  {
    id: 'balanced',
    name: '脑波音乐 · 深度放松',
    description: '平衡的背景音乐，适合深度放松',
    icon: <Music2 size={20} />,
  },
  {
    id: 'singingbowl',
    name: '颂钵 · 心灵振动',
    description: '颂钵的声音，帮助放松身心',
    icon: <Bell size={20} />,
  },
  {
    id: 'chinese',
    name: '古风禅乐 · 静心养神',
    description: '古风禅意音乐，带来内心的平静',
    icon: <Music size={20} />,
  },
  {
    id: 'western',
    name: '古典音乐 · 优雅入眠',
    description: '经典古典音乐，优雅而宁静',
    icon: <Disc size={20} />,
  },
  {
    id: 'lullaby',
    name: '无歌词摇篮曲 · 温柔哄睡',
    description: '轻柔的摇篮曲，温柔哄睡',
    icon: <Music2 size={20} />,
  },
];

interface MusicOptionSelectorProps {
  onMusicSelect: (musicOption: string) => void;
  onBack?: () => void;
}

export default function MusicOptionSelector({
  onMusicSelect,
  onBack,
}: MusicOptionSelectorProps) {
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleMusicSelect = (musicId: string) => {
    setSelectedMusic(musicId);
    setIsConfirming(true);
    setTimeout(() => {
      onMusicSelect(musicId);
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl mx-auto p-4 py-6"
      >
        {onBack && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors"
          >
            <ChevronLeft size={18} />
            <span className="text-xs">返回上一步</span>
          </motion.button>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Music className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-light text-slate-100">
              选择音乐
            </h1>
          </div>

          <div className="space-y-2">
            {MUSIC_OPTIONS.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMusicSelect(option.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedMusic === option.id
                    ? 'border-emerald-400 bg-emerald-400/10'
                    : 'border-slate-700 bg-slate-800/30 hover:border-emerald-400/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedMusic === option.id
                        ? 'border-emerald-400 bg-emerald-400'
                        : 'border-slate-600'
                    }`}
                  >
                    {selectedMusic === option.id && (
                      <Check size={12} className="text-slate-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={selectedMusic === option.id ? 'text-emerald-400' : 'text-slate-500'}>
                        {option.icon}
                      </span>
                      <h3
                        className={`font-medium text-lg leading-tight ${
                          selectedMusic === option.id
                            ? 'text-emerald-100'
                            : 'text-slate-200'
                        }`}
                      >
                        {option.name}
                      </h3>
                    </div>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border-l-2 border-emerald-400">
            <p className="text-slate-300 text-xs leading-relaxed">
              🎵 提示：选择音乐后，您还可以选择播放时长（10-60分钟），音乐将循环播放直到指定时长结束。
            </p>
          </div>
        </motion.div>

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
