/**
 * 梦魇困扰症状脚本
 */

export interface SymptomScript {
  key: string;
  title: string;
  content: string[];
  duration: number;
  emotion: 'calm' | 'soothing' | 'warm';
}

export const NIGHTMARE_SCRIPTS: Record<string, SymptomScript> = {
  nightmare_intro: {
    key: 'nightmare_intro',
    title: '避免梦魇导语',
    content: [
      '欢迎来到 ZenSleep 保护空间。',
      '如果你曾被噩梦困扰，现在，那些都将改变。',
      '我将为你建立一道保护之墙，让只有安详的梦想通过。',
      '想象一个光之屏障，温暖而柔和，将所有不安都隔在外面。',
      '在这个屏障之后，只有平和与美好的梦境。',
      '你的潜意识将被引导向更深层的安宁。',
      '梦，将会是你精神的绿洲，而不是扰乱。',
      '今晚，你将拥有宁静而美好的睡眠。',
    ],
    duration: 80,
    emotion: 'calm',
  },

  nightmare_protection: {
    key: 'nightmare_protection',
    title: '梦境保护',
    content: [
      '想象一道金色的光环，环绕着你的意识。',
      '任何不安的念头，都无法穿过这道光环。',
      '你的梦境现在是安全的港湾。',
      '只有美好的事物，能够进入你的潜意识。',
      '你现在可以安心地进入深度睡眠。',
    ],
    duration: 45,
    emotion: 'calm',
  },
};