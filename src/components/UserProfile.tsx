import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ArrowRight, ChevronLeft } from 'lucide-react';
import { CONSTITUTIONS, Constitution } from '../data/constitutions';

interface UserProfileProps {
  onConstitutionSelect: (constitutionId: string) => void;
  onBack?: () => void;
}

type QuestionKey = 'fatigue' | 'temperature' | 'moisture' | 'mood' | 'digestion';

interface QuestionAnswer {
  score: number;
  constitutions: string[];
}

export default function UserProfile({ onConstitutionSelect, onBack }: UserProfileProps) {
  const [currentStep, setCurrentStep] = useState<'questions' | 'results'>(
    'questions'
  );
  const [answers, setAnswers] = useState<Record<QuestionKey, number | null>>({
    fatigue: null,
    temperature: null,
    moisture: null,
    mood: null,
    digestion: null,
  });

  const questions: { key: QuestionKey; question: string; options: string[] }[] = [
    {
      key: 'fatigue',
      question: '您最近的精力状况如何？',
      options: ['精力充沛', '一般', '容易疲劳'],
    },
    {
      key: 'temperature',
      question: '您的怕冷情况？',
      options: ['不怕冷', '一般', '怕冷，手脚冰冷'],
    },
    {
      key: 'moisture',
      question: '您的舌苔情况？',
      options: ['正常', '偏腻', '很厚腻'],
    },
    {
      key: 'mood',
      question: '您的情绪状况？',
      options: ['平和', '有时烦躁', '经常烦躁抑郁'],
    },
    {
      key: 'digestion',
      question: '您的消化情况？',
      options: ['很好', '一般', '不好，容易便秘或腹泻'],
    },
  ];

  const constitutionMappings: Record<number, Record<QuestionKey, string>> = {
    0: { fatigue: 'balanced', temperature: 'balanced', moisture: 'balanced', mood: 'balanced', digestion: 'balanced' },
    1: { fatigue: 'qi-deficient', temperature: 'yang-deficient', moisture: 'phlegm-damp', mood: 'depressed-mood', digestion: 'qi-deficient' },
    2: { fatigue: 'qi-deficient', temperature: 'yang-deficient', moisture: 'damp', mood: 'anxious', digestion: 'yang-deficient' },
  };

  const handleAnswer = (key: QuestionKey, value: number) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const isAllAnswered = Object.values(answers).every((v) => v !== null);

  const analyzeConstitution = (): string => {
    const scores: Record<string, number> = {};
    Object.entries(answers).forEach(([key, value]) => {
      if (value !== null && typeof value === 'number' && value >= 0 && value <= 2) {
        const constitutionId = constitutionMappings[value][key as QuestionKey];
        scores[constitutionId] = (scores[constitutionId] || 0) + 1;
      }
    });

    const topConstitution = Object.entries(scores).reduce((a, b) =>
      b[1] > a[1] ? b : a
    );
    return topConstitution[0] || 'balanced';
  };

  const handleAnalyze = () => {
    if (isAllAnswered) {
      const constitutionId = analyzeConstitution();
      setCurrentStep('results');
    }
  };

  const handleSelectConstitution = () => {
    const constitutionId = analyzeConstitution();
    onConstitutionSelect(constitutionId);
  };

  const recommendedConstitution = analyzeConstitution();
  const constitutionData = CONSTITUTIONS[recommendedConstitution];

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
            <span className="text-sm">返回选择</span>
          </motion.button>
        )}

        <AnimatePresence mode="wait">
          {currentStep === 'questions' ? (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-4xl font-light text-slate-100 mb-2">中医体质评估</h1>
                <p className="text-slate-400">
                  通过简单的问题了解您的体质类型，获得更针对性的睡眠调理
                </p>
              </div>

              {/* 进度条 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>问卷进度</span>
                  <span>
                    {Object.values(answers).filter((v) => v !== null).length} /{' '}
                    {questions.length}
                  </span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        ((Object.values(answers).filter((v) => v !== null).length ||
                          0) /
                          questions.length) *
                        100
                      }%`,
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-emerald-400"
                  />
                </div>
              </div>

              {/* 问题列表 */}
              <div className="space-y-6">
                {questions.map((q, index) => (
                  <motion.div
                    key={q.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="space-y-3"
                  >
                    <label className="text-slate-200 font-medium">{q.question}</label>
                    <div className="grid gap-2">
                      {q.options.map((option, optIndex) => (
                        <motion.button
                          key={option}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAnswer(q.key, optIndex)}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            answers[q.key] === optIndex
                              ? 'border-emerald-400 bg-emerald-400/10 text-emerald-100'
                              : 'border-slate-700 bg-slate-800/30 text-slate-300 hover:border-emerald-400/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                answers[q.key] === optIndex
                                  ? 'border-emerald-400 bg-emerald-400'
                                  : 'border-slate-600'
                              }`}
                            >
                              {answers[q.key] === optIndex && (
                                <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                              )}
                            </div>
                            <span>{option}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 下一步按钮 */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: isAllAnswered ? 1 : 0.5 }}
                whileHover={isAllAnswered ? { scale: 1.02 } : {}}
                whileTap={isAllAnswered ? { scale: 0.98 } : {}}
                onClick={handleAnalyze}
                disabled={!isAllAnswered}
                className="w-full py-3 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <span>分析体质</span>
                <ArrowRight size={18} />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="inline-flex"
                >
                  <CheckCircle2 size={40} className="text-emerald-400" />
                </motion.div>
                <h2 className="text-2xl font-light text-slate-100">
                  评估完成！
                </h2>
              </div>

              {constitutionData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-lg bg-slate-800/50 border-2 border-emerald-400/30 space-y-4"
                >
                  <div>
                    <h3 className="text-emerald-400 text-lg font-semibold mb-1">
                      {constitutionData.name}
                    </h3>
                    <p className="text-slate-300 text-sm">
                      {constitutionData.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-slate-200 font-medium text-sm mb-2">
                      您的特征：
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {constitutionData.characteristics.map((char) => (
                        <span
                          key={char}
                          className="px-3 py-1 rounded-full bg-slate-700/50 text-slate-300 text-xs"
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-slate-200 font-medium text-sm mb-2">
                      推荐中草药：
                    </h4>
                    <p className="text-slate-400 text-sm">
                      {constitutionData.recommendedHerbs.join('、')}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-slate-200 font-medium text-sm mb-2">
                      推荐茶饮：
                    </h4>
                    <p className="text-slate-400 text-sm">
                      {constitutionData.recommendedTeas.join('、')}
                    </p>
                  </div>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSelectConstitution}
                className="w-full py-3 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
              >
                确认并继续
              </motion.button>

              <button
                onClick={() => setCurrentStep('questions')}
                className="w-full py-2 rounded-lg border-2 border-slate-700 text-slate-300 hover:text-slate-100 transition-colors"
              >
                返回修改答案
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
