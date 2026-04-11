/**
 * 压力释放症状脚本
 */

export interface SymptomScript {
  key: string;
  title: string;
  content: string[];
  duration: number;
  emotion: 'calm' | 'soothing' | 'warm';
}

export const STRESS_RELIEF_SCRIPTS: Record<string, SymptomScript> = {
  stress_relief_intro: {
    key: 'stress_relief_intro',
    title: '释放压力导语',
    content: [
      '欢迎来到 ZenSleep 释放之地。',
      '压力像乌云一样笼罩着你。让我帮你驱散它们。',
      '你的肩膀在放松，你的眉头在舒展。',
      '每一根紧张的神经都在逐渐放松。',
      '想象压力像水一样，从你的身体里慢慢流出。',
      '你变得越来越轻盈，越来越自由。',
      '在这深度睡眠中，你将被完全重建和修复。',
      '压力正在离你而去，和平正在降临。',
    ],
    duration: 70,
    emotion: 'calm',
  },

  stress_release: {
    key: 'stress_release',
    title: '压力释放',
    content: [
      '现在，让压力从你的身体里流出。',
      '从你的头部开始，放松每一寸肌肉。',
      '想象压力像黑色的墨水，被清水冲刷干净。',
      '你的心灵正在变得纯净而透明。',
      '你现在是自由的，你现在是平静的。',
    ],
    duration: 45,
    emotion: 'calm',
  },
};