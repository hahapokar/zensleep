/**
 * 导语脚本管理系统 - 简化版本，仅支持NSDR和睡眠
 * 所有脚本元数据定义，实际音频由MP3文件提供
 */

// 脚本类型定义
export type SymptomType = 'nsdr' | 'sleep' | 'music' | 'whitenoise';

export interface SymptomScript {
  key: string;
  title: string;
  content: string[];
  duration: number;
  emotion: 'calm' | 'soothing' | 'warm';
}

// 脚本配置接口
export interface ScriptConfig {
  key: string;
  title: string;
  content: string[];
  duration: number;
}

// NSDR脚本定义
const NSDR_SCRIPTS: Record<string, SymptomScript> = {
  'nsdr-power-recharge': {
    key: 'nsdr-power-recharge',
    title: '能量补给',
    content: ['快速缓解眼部疲劳与大脑"过热"'],
    duration: 900,
    emotion: 'calm',
  },
  'nsdr-stress-reset': {
    key: 'nsdr-stress-reset',
    title: '压力归零',
    content: ['降低皮质醇水平，切断焦虑循环'],
    duration: 1200,
    emotion: 'soothing',
  },
  'nsdr-deep-recovery': {
    key: 'nsdr-deep-recovery',
    title: '深度修复',
    content: ['模拟一个完整的睡眠周期，深度重塑神经'],
    duration: 1800,
    emotion: 'warm',
  },
};

// 睡眠脚本定义（仅保留三个30分钟选项）
const SLEEP_SCRIPTS: Record<string, SymptomScript> = {
  'sleep-clear-mind': {
    key: 'sleep-clear-mind',
    title: '清脑 · 卸载繁杂',
    content: ['帮助大脑停止转动，释放压力'],
    duration: 1800, // 30分钟
    emotion: 'calm',
  },
  'sleep-relax-body': {
    key: 'sleep-relax-body',
    title: '舒体 · 融化酸累',
    content: ['缓解身体疲劳，放松肌肉酸痛'],
    duration: 1800, // 30分钟
    emotion: 'soothing',
  },
  'sleep-calm-heart': {
    key: 'sleep-calm-heart',
    title: '定心 · 安全避风港',
    content: ['提供心理安全感，抚平焦虑'],
    duration: 1800, // 30分钟
    emotion: 'warm',
  },
  'sleep-buddha': {
    key: 'sleep-buddha',
    title: '禅定 · 佛陀助眠',
    content: ['宁静的禅意，帮助你安然入睡'],
    duration: 1800, // 30分钟
    emotion: 'calm',
  },
};

// 背景音乐助眠脚本定义
const MUSIC_SCRIPTS: Record<string, SymptomScript> = {
  'music-light': {
    key: 'music-light',
    title: '轻盈 · 柔和伴眠',
    content: ['轻柔的背景音乐，适合快速入眠'],
    duration: 1200, // 20分钟
    emotion: 'calm',
  },
  'music-balanced': {
    key: 'music-balanced',
    title: '平和 · 舒适陪伴',
    content: ['平衡的背景音乐，适合深度放松'],
    duration: 2400, // 40分钟
    emotion: 'soothing',
  },
  'music-deep': {
    key: 'music-deep',
    title: '深度 · 完整睡眠',
    content: ['深沉的背景音乐，助力整晚安眠'],
    duration: 3600, // 60分钟
    emotion: 'warm',
  },
};

// 白噪音助眠脚本定义
const WHITENOISE_SCRIPTS: Record<string, SymptomScript> = {
  'whitenoise-campfire': {
    key: 'whitenoise-campfire',
    title: '营火 · 温暖相伴',
    content: ['噼里啪啦的营火声，温暖而宁静'],
    duration: 1800, // 30分钟
    emotion: 'warm',
  },
  'whitenoise-thunder': {
    key: 'whitenoise-thunder',
    title: '雷声 · 大自然怒吼',
    content: ['远处的雷声，带来安心的雨声'],
    duration: 1800, // 30分钟
    emotion: 'calm',
  },
  'whitenoise-nature': {
    key: 'whitenoise-nature',
    title: '自然 · 鸟语花香',
    content: ['大自然的声音，放松身心'],
    duration: 1800, // 30分钟
    emotion: 'soothing',
  },
  'whitenoise-wave': {
    key: 'whitenoise-wave',
    title: '海浪 · 潮起潮落',
    content: ['海浪的声音，带来大海的气息'],
    duration: 1800, // 30分钟
    emotion: 'calm',
  },
  'whitenoise-waterdrop': {
    key: 'whitenoise-waterdrop',
    title: '水滴 · 滴水穿石',
    content: ['清澈的水滴声，静心宁神'],
    duration: 1800, // 30分钟
    emotion: 'soothing',
  },
};

// 兼容性：保留旧的 SCRIPTS 结构用于向后兼容
export const SCRIPTS: Record<string, SymptomScript> = {
  ...NSDR_SCRIPTS,
  ...SLEEP_SCRIPTS,
  ...MUSIC_SCRIPTS,
  ...WHITENOISE_SCRIPTS,
};

/**
 * 脚本管理类 - 处理脚本查询和推荐
 */
export class ScriptManager {
  /**
   * 根据症状和脚本键获取特定脚本
   */
  static getScriptBySymptomAndKey(symptom: SymptomType, scriptKey: string): SymptomScript | null {
    if (symptom === 'nsdr') {
      return NSDR_SCRIPTS[scriptKey] || null;
    } else if (symptom === 'sleep') {
      return SLEEP_SCRIPTS[scriptKey] || null;
    } else if (symptom === 'music') {
      return MUSIC_SCRIPTS[scriptKey] || null;
    } else if (symptom === 'whitenoise') {
      return WHITENOISE_SCRIPTS[scriptKey] || null;
    }
    return null;
  }

  /**
   * 根据体质和症状获取定制化导语
   */
  static getCustomizedScript(
    scriptKey: string,
    constitution?: string,
    symptom?: SymptomType | string
  ): string[] {
    let script: SymptomScript | null = null;

    // 如果指定了症状，从对应症状的脚本中查找
    if (symptom && (symptom === 'nsdr' || symptom === 'sleep' || symptom === 'music' || symptom === 'whitenoise')) {
      script = this.getScriptBySymptomAndKey(symptom as SymptomType, scriptKey);
    }

    // 如果没找到，从 SCRIPTS 中查找
    if (!script) {
      script = SCRIPTS[scriptKey] || null;
    }

    if (!script) {
      console.warn(`Script not found: ${scriptKey}`);
      return [];
    }

    let content = [...script.content];

    // 根据体质调整导语的某些部分
    if (constitution === 'anxious') {
      content.splice(2, 0, '你的焦虑现在在慢慢消融。');
    } else if (constitution === 'yang-deficient') {
      content.splice(1, 0, '想象一股温暖的气流，正在你的身体里循环。');
    }

    return content;
  }

  /**
   * 获取脚本的情感类型（用于音频处理）
   */
  static getScriptEmotion(symptom: SymptomType, scriptKey: string): 'calm' | 'soothing' | 'warm' {
    const script = this.getScriptBySymptomAndKey(symptom, scriptKey);
    return script?.emotion || 'calm';
  }

  /**
   * 获取症状对应的推荐脚本序列
   */
  static getRecommendedScriptSequence(symptom: string): string[] {
    const sequences: Record<string, string[]> = {
      nsdr: ['nsdr-power-recharge'],
      sleep: ['sleep-clear-mind'],
      music: ['music-balanced'],
      whitenoise: ['whitenoise-nature'],
    };

    return sequences[symptom] || sequences.sleep;
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
