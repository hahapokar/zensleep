/**
 * 导语脚本管理系统
 * 所有脚本会根据用户体质和症状进行动态调整
 */

export interface ScriptConfig {
  key: string;
  title: string;
  content: string[];
  duration: number; // 脚本预期时长（秒）
}

export const SCRIPTS: Record<string, ScriptConfig> = {
  // 初始欢迎
  welcome_standard: {
    key: 'welcome_standard',
    title: '标准欢迎',
    content: [
      '欢迎进入 ZenSleep 深层睡眠空间。',
      '现在，请调整到最舒服的姿势。可以侧卧，也可以仰卧。',
      '用枕头支撑好你的脖子，让整个身体都能放松下来。',
      '如果有需要，可以盖好被子，确保温度舒适。',
    ],
    duration: 45,
  },

  // 难以入睡
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
    ],
    duration: 60,
  },

  // 焦虑烦躁
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
    ],
    duration: 65,
  },

  // 身心疲劳
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
    ],
    duration: 60,
  },

  // 避免梦魇
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
    ],
    duration: 70,
  },

  // 易醒
  wakeability_intro: {
    key: 'wakeability_intro',
    title: '易醒导语',
    content: [
      '欢迎来到 ZenSleep 深度锁定系统。',
      '我知道浅眠很困扰。让我们一起改变这个模式。',
      '想象你正在逐渐下沉，进入一个更深、更深的水域。',
      '每一层水都是一个保护，让你远离外界的干扰。',
      '你的身体变得越来越沉重，越来越稳固。',
      '声音、光线、任何打搅都无法触及你。',
      '你现在进入了深度睡眠的安全堡垒。',
    ],
    duration: 65,
  },

  // 释放压力
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
    ],
    duration: 60,
  },

  // 深化阶段
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
    ],
    duration: 75,
  },

  // 呼吸同步
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
    ],
    duration: 80,
  },

  // 唤醒
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
    duration: 60,
  },
};

/**
 * 脚本管理类
 */
export class ScriptManager {
  /**
   * 根据体质和症状获取定制化导语
   */
  static getCustomizedScript(
    scriptKey: string,
    constitution?: string,
    symptom?: string
  ): string[] {
    const baseScript = SCRIPTS[scriptKey];
    if (!baseScript) {
      console.warn(`Script not found: ${scriptKey}`);
      return [];
    }

    let content = [...baseScript.content];

    // 根据体质调整导语的某些部分
    if (constitution === 'anxious') {
      // 增加针对焦虑的放松导语
      content.splice(2, 0, '你的焦虑现在在慢慢消融。');
    } else if (constitution === 'yang-deficient') {
      // 增加温阳的建议
      content.splice(1, 0, '想象一股温暖的气流，正在你的身体里循环。');
    }

    return content;
  }

  /**
   * 获取脚本总时长
   */
  static getScriptDuration(scriptKey: string): number {
    return SCRIPTS[scriptKey]?.duration || 0;
  }

  /**
   * 获取所有可用的脚本
   */
  static getAllScripts(): ScriptConfig[] {
    return Object.values(SCRIPTS);
  }
}
