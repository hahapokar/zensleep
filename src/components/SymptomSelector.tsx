import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronLeft } from 'lucide-react';
import { SYMPTOMS, Symptom } from '../data/constitutions';

interface SymptomSelectorProps {
  onSymptomsSelect: (symptoms: string[]) => void;
  onBack?: () => void;
}

export default function SymptomSelector({
  onSymptomsSelect,
  onBack,
}: SymptomSelectorProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleConfirm = () => {
    setIsConfirming(true);
    setTimeout(() => {
      onSymptomsSelect(selectedSymptoms.length > 0 ? selectedSymptoms : ['tired']);
    }, 600);
  };

  const symptomArray = Object.values(SYMPTOMS);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        {/* 返回按钮 */}
        {onBack && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-8 transition-colors"
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
            <h1 className="text-4xl font-light text-slate-100 mb-2">
              当日心情/症状
            </h1>
            <p className="text-slate-400">
              选择今天的主要症状，我们将调整睡眠体验来帮助您
            </p>
          </div>

          {/* 症状网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {symptomArray.map((symptom, index) => (
              <motion.button
                key={symptom.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleSymptom(symptom.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedSymptoms.includes(symptom.id)
                    ? 'border-emerald-400 bg-emerald-400/10'
                    : 'border-slate-700 bg-slate-800/30 hover:border-emerald-400/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedSymptoms.includes(symptom.id)
                        ? 'border-emerald-400 bg-emerald-400'
                        : 'border-slate-600'
                    }`}
                  >
                    {selectedSymptoms.includes(symptom.id) && (
                      <Check size={16} className="text-slate-900" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-medium ${
                        selectedSymptoms.includes(symptom.id)
                          ? 'text-emerald-100'
                          : 'text-slate-200'
                      }`}
                    >
                      {symptom.name}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">
                      {symptom.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* 提示 */}
          <div className="p-4 rounded-lg bg-slate-800/50 border-l-2 border-emerald-400">
            <p className="text-slate-300 text-sm">
              💡 提示：您可以选择一个或多个症状，系统会综合调整音乐和导语来最大化帮助效果。
            </p>
          </div>

          {/* 按钮组 */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              disabled={isConfirming}
              className="flex-1 py-3 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              {isConfirming ? '准备中...' : '开始睡眠'}
            </motion.button>
            <button
              onClick={() => onSymptomsSelect([])}
              className="px-6 py-3 rounded-lg border-2 border-slate-700 text-slate-300 hover:text-slate-100 transition-colors font-medium"
            >
              跳过
            </button>
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
