/**
 * 导语脚本管理系统 - 按症状分类
 * 所有脚本现在按症状分类组织，便于 TTS Worker 生成对应的语音
 */

import {
  SYMPTOM_SCRIPTS,
  SymptomScript,
  SymptomType
} from './symptoms/index';

// 兼容性：保留旧的 SCRIPTS 结构用于向后兼容
export const SCRIPTS: Record<string, SymptomScript> = {
  ...SYMPTOM_SCRIPTS.insomnia,
  ...SYMPTOM_SCRIPTS.anxious,
  ...SYMPTOM_SCRIPTS.tired,
  ...SYMPTOM_SCRIPTS.nightmare,
  ...SYMPTOM_SCRIPTS.wakeability,
  ...SYMPTOM_SCRIPTS['stress-relief'],
  ...SYMPTOM_SCRIPTS.general,
};

// 脚本配置接口（保持兼容性）
export interface ScriptConfig {
  key: string;
  title: string;
  content: string[];
  duration: number;
}

/**
 * 脚本管理类 - 支持按症状分类的脚本选择
 */
export class ScriptManager {
  /**
   * 根据症状获取对应的脚本集合
   */
  static getScriptsBySymptom(symptom: SymptomType): Record<string, SymptomScript> {
    return SYMPTOM_SCRIPTS[symptom] || SYMPTOM_SCRIPTS.general;
  }

  /**
   * 根据症状和脚本键获取特定脚本
   */
  static getScriptBySymptomAndKey(symptom: SymptomType, scriptKey: string): SymptomScript | null {
    const symptomScripts = this.getScriptsBySymptom(symptom);
    return symptomScripts[scriptKey] || null;
  }

  /**
   * 获取所有可用症状类型
   */
  static getAvailableSymptoms(): SymptomType[] {
    return Object.keys(SYMPTOM_SCRIPTS) as SymptomType[];
  }

  /**
   * 根据体质和症状获取定制化导语
   * 保持向后兼容性
   */
  static getCustomizedScript(
    scriptKey: string,
    constitution?: string,
    symptom?: SymptomType
  ): string[] {
    let script: SymptomScript | null = null;

    // 如果指定了症状，从对应症状的脚本中查找
    if (symptom) {
      script = this.getScriptBySymptomAndKey(symptom, scriptKey);
    }

    // 如果没找到，尝试从通用脚本中查找
    if (!script) {
      script = SYMPTOM_SCRIPTS.general[scriptKey] || null;
    }

    // 如果仍然没找到，从旧的 SCRIPTS 中查找（向后兼容）
    if (!script) {
      const legacyScript = SCRIPTS[scriptKey];
      if (legacyScript) {
        script = {
          ...legacyScript,
          emotion: 'calm' as const, // 默认情感
        };
      }
    }

    if (!script) {
      console.warn(`Script not found: ${scriptKey}`);
      return [];
    }

    let content = [...script.content];

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
   * 获取脚本的情感类型（用于 TTS）
   */
  static getScriptEmotion(symptom: SymptomType, scriptKey: string): 'calm' | 'soothing' | 'warm' {
    const script = this.getScriptBySymptomAndKey(symptom, scriptKey);
    return script?.emotion || 'calm';
  }

  /**
   * 获取症状对应的推荐脚本序列
   */
  static getRecommendedScriptSequence(symptom: SymptomType): string[] {
    const sequences: Record<SymptomType, string[]> = {
      insomnia: ['insomnia_intro', 'insomnia_deepening', 'breathing_sync', 'awakening'],
      anxious: ['anxious_intro', 'anxious_relaxation', 'deepening_standard', 'awakening'],
      tired: ['tired_intro', 'tired_recovery', 'breathing_sync', 'awakening'],
      nightmare: ['nightmare_intro', 'nightmare_protection', 'deepening_standard', 'awakening'],
      wakeability: ['wakeability_intro', 'wakeability_lock', 'deepening_standard', 'awakening'],
      'stress-relief': ['stress_relief_intro', 'stress_release', 'breathing_sync', 'awakening'],
      general: ['welcome_standard', 'deepening_standard', 'breathing_sync', 'awakening'],
      nsdr: ['nsdr-basic', 'nsdr-progressive', 'nsdr-meditation'],
      sleep: ['sleep-basic', 'sleep-deep', 'sleep-countdown'],
    };

    return sequences[symptom] || sequences.general;
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
