/**
 * 导语脚本管理系统 - 简化版本，仅支持NSDR和睡眠
 * 所有脚本元数据定义，实际音频由MP3文件提供
 */

// 脚本类型定义
export type SymptomType = 'nsdr' | 'sleep';

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

// 睡眠脚本定义
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
  'sleep-cool-down': {
    key: 'sleep-cool-down',
    title: '降温 · 抚平兴奋',
    content: ['降低情绪亢奋，帮助平静入睡'],
    duration: 3600, // 60分钟
    emotion: 'calm',
  },
  'sleep-serene': {
    key: 'sleep-serene',
    title: '静谧 · 日常入梦',
    content: ['提供宁静背景音，辅助自然入睡'],
    duration: 3600, // 60分钟
    emotion: 'soothing',
  },
};

// 兼容性：保留旧的 SCRIPTS 结构用于向后兼容
export const SCRIPTS: Record<string, SymptomScript> = {
  ...NSDR_SCRIPTS,
  ...SLEEP_SCRIPTS,
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
    if (symptom && (symptom === 'nsdr' || symptom === 'sleep')) {
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
