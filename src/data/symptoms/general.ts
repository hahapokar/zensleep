/**
 * 通用脚本（适用于所有症状）
 */

export interface SymptomScript {
  key: string;
  title: string;
  content: string[];
  duration: number;
  emotion: 'calm' | 'soothing' | 'warm';
}

export const GENERAL_SCRIPTS: Record<string, SymptomScript> = {
  welcome_standard: {
    key: 'welcome_standard',
    title: '标准欢迎',
    content: [
      '欢迎进入 ZenSleep 深层睡眠空间。',
      '现在，请调整到最舒服的姿势。可以侧卧，也可以仰卧。',
      '用枕头支撑好你的脖子，让整个身体都能放松下来。',
      '如果有需要，可以盖好被子，确保温度舒适。',
      '这个空间是为你量身打造的深度放松环境。',
    ],
    duration: 50,
    emotion: 'warm',
  },

  deepening_standard: {
    key: 'deepening_standard',
    title: '深化阶段',
    content: [
      '你正在下沉。像沉入温热的泉水，就像浸入无边的夜色。',
      '你的意识在逐渐远离表面，进入更深的境界。',
      '这里没有时间，没有空间，只有无尽的放松。',
      '每一次呼吸，都让你沉得更深。',
      '你的身体变得不可思议地沉重，就像陷入温暖的沙子。',
      '所有杂念，都在被黑暗温柔地吸收。',
      '你现在进入了深度睡眠的中心。',
    ],
    duration: 80,
    emotion: 'soothing',
  },

  breathing_sync: {
    key: 'breathing_sync',
    title: '呼吸同步导语',
    content: [
      '现在，让我们同步呼吸。',
      '在我的指引下，你的呼吸会变得越来越缓慢。',
      '每一次深深的吸气，将宁静吸入你的身体。',
      '每一次缓缓的呼气，将担忧呼出这个空间。',
      '你的心跳与我的节奏同步。',
      '你的意识与宇宙的脉搏同步。',
      '这是一种完全的融合与和谐。',
      '你的呼吸现在是如此的平稳而有力。',
    ],
    duration: 85,
    emotion: 'calm',
  },

  awakening: {
    key: 'awakening',
    title: '温和唤醒',
    content: [
      '现在，是时候缓慢地回到这个世界了。',
      '但不要着急。保持这份深度的放松与宁静。',
      '开始感受你的身体。从脚趾开始，慢慢地活动。',
      '你的意识正在逐渐上升，就像晨曦中缓缓升起的太阳。',
      '睁开眼睛，但保持这份平静。',
      '现在的你，已经被深度睡眠完全修复。',
      '祝你有一个美好的一天。',
    ],
    duration: 65,
    emotion: 'warm',
  },
};