/**
 * 身心疲劳症状脚本
 */

export interface SymptomScript {
  key: string;
  title: string;
  content: string[];
  duration: number;
  emotion: 'calm' | 'soothing' | 'warm';
}

export const TIRED_SCRIPTS: Record<string, SymptomScript> = {
  tired_intro: {
    key: 'tired_intro',
    title: '身心疲劳导语',
    content: [
      '欢迎来到 ZenSleep。我看到你今天很累。',
      '也许工作消耗了你的能量，也许生活的琐事让你疲惫。',
      '现在，是时候让这一切都停下来，好好休息。',
      '想象你的身体像软棉花一样，逐渐沉入舒适的床铺。',
      '每一块肌肉都开始放松，从头到脚，都在释放疲劳。',
      '你的身体正在恢复，你的心灵正在修复。',
      '深深地呼吸，让睡眠的力量滋养你。',
      '疲劳正在被睡眠的能量所取代。',
    ],
    duration: 75,
    emotion: 'warm',
  },

  tired_recovery: {
    key: 'tired_recovery',
    title: '疲劳恢复',
    content: [
      '你的身体正在进入深度修复模式。',
      '每一分钟的睡眠，都在重建你的能量。',
      '想象一股温暖的能量，从你的头部开始，流向全身。',
      '你的细胞正在欢庆，它们正在得到充分的休息。',
      '明天醒来时，你将焕然一新。',
    ],
    duration: 50,
    emotion: 'warm',
  },
};