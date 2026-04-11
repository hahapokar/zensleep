/**
 * 难以入睡症状脚本
 */

export interface SymptomScript {
  key: string;
  title: string;
  content: string[];
  duration: number;
  emotion: 'calm' | 'soothing' | 'warm';
}

export const INSOMNIA_SCRIPTS: Record<string, SymptomScript> = {
  insomnia_intro: {
    key: 'insomnia_intro',
    title: '难以入睡导语',
    content: [
      '欢迎来到 ZenSleep。我知道有些夜晚，入睡对你来说并不容易。',
      '无论你最近经历了什么，无论你的思绪有多纷乱，这个系统为你设计。',
      '在接下来的时间里，你只需要放下一切，让我来引导你。',
      '感受你的呼吸，它将成为你进入梦想的指南针。',
      '每一次吸气，都带给你平静；每一次呼气，都释放你的压力。',
      '现在，请闭上眼睛，让这温暖的空间包围你。',
      '想象你正慢慢地沉入，进入这个充满安宁的世界。',
      '你的意识在逐渐远离表面，进入更深的境界。',
      '这里没有时间，没有空间，只有无尽的放松。',
      '每一次呼吸，都让你沉得更深。',
    ],
    duration: 90,
    emotion: 'soothing',
  },

  insomnia_deepening: {
    key: 'insomnia_deepening',
    title: '入睡深化',
    content: [
      '你的眼皮开始变得沉重。',
      '每一次眨眼，都让你离睡眠更近一步。',
      '想象你的思绪像云朵一样，慢慢飘走。',
      '只剩下宁静，只剩下放松。',
      '你的身体正在进入自动修复模式。',
      '睡眠的大门正在为你缓缓打开。',
    ],
    duration: 60,
    emotion: 'soothing',
  },
};