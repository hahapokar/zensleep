/**
 * 焦虑烦躁症状脚本
 */

export interface SymptomScript {
  key: string;
  title: string;
  content: string[];
  duration: number;
  emotion: 'calm' | 'soothing' | 'warm';
}

export const ANXIOUS_SCRIPTS: Record<string, SymptomScript> = {
  anxious_intro: {
    key: 'anxious_intro',
    title: '焦虑烦躁导语',
    content: [
      '欢迎来到 ZenSleep 平静之地。',
      '我感受到你内心的躁动。这是正常的，很多人都经历过这样的夜晚。',
      '现在，让我们一起把这份烦躁转化为深深的放松。',
      '想象一片无边的深蓝色夜空，星星点缀其中，柔和而遥远。',
      '你正慢慢地沉入，进入这个充满安宁的世界。',
      '呼吸变得更加缓慢，你的心跳也逐渐变得平缓。',
      '焦虑在消散，只有宁静在等待你。',
      '你的思绪正在平静下来，像湖面一样恢复宁静。',
      '每一份不安，都在被温柔地抚平。',
    ],
    duration: 85,
    emotion: 'calm',
  },

  anxious_relaxation: {
    key: 'anxious_relaxation',
    title: '焦虑缓解',
    content: [
      '现在，专注于你的呼吸。',
      '吸气时，想象平静进入你的身体。',
      '呼气时，想象焦虑离开你的身体。',
      '你的肩膀在放松，你的眉头在舒展。',
      '每一根紧张的神经都在逐渐放松。',
      '你现在是安全的，你现在是被爱的。',
    ],
    duration: 55,
    emotion: 'calm',
  },
};