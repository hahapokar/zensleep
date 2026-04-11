/**
 * 内容管理器 - 处理脚本、音乐和资源文件的映射
 */

import { ScriptManager, SCRIPTS } from './scripts';
import { CONSTITUTIONS, SYMPTOMS } from './constitutions';

export interface ContentConfig {
  constitution: string;
  symptoms: string[];
  sessionDuration: number;
  voiceSettings: {
    rate: number;
    pitch: number;
  };
  scriptSequence: string[]; // 脚本在播放顺序中的 key
  musicTracks: string[]; // 音乐文件路径
}

export class ContentManager {
  /**
   * 根据用户偏好生成内容配置
   */
  static generateContentConfig(
    constitution: string,
    symptoms: string[]
  ): ContentConfig {
    const constitutionData = CONSTITUTIONS[constitution] || CONSTITUTIONS.balanced;
    
    // 确定会话时长
    let sessionDuration = 3600; // 默认 60 分钟
    if (symptoms.includes('insomnia')) {
      sessionDuration = 4200; // 70 分钟给难以入睡
    } else if (symptoms.includes('nightmare')) {
      sessionDuration = 5400; // 90 分钟给梦魇
    }

    // 添加症状额外时长
    symptoms.forEach((symptomId) => {
      const symptom = SYMPTOMS[symptomId];
      if (symptom?.additionalDuration) {
        sessionDuration += symptom.additionalDuration;
      }
    });

    // 构建脚本序列
    const scriptSequence = this.buildScriptSequence(constitution, symptoms);
    
    // 构建音乐列表
    const musicTracks = this.buildMusicList(symptoms);

    return {
      constitution,
      symptoms,
      sessionDuration,
      voiceSettings: constitutionData.voiceSettings,
      scriptSequence,
      musicTracks,
    };
  }

  /**
   * 构建脚本播放序列
   */
  private static buildScriptSequence(
    constitution: string,
    symptoms: string[]
  ): string[] {
    const sequence: string[] = [];

    // 1. 开场白
    if (symptoms.length > 0) {
      // 根据症状选择开场
      const symptomScriptMap: Record<string, string> = {
        insomnia: 'insomnia_intro',
        anxious: 'anxious_intro',
        tired: 'tired_intro',
        nightmare: 'nightmare_intro',
        wakeability: 'wakeability_intro',
        'stress-relief': 'stress_relief_intro',
      };
      
      const symptomKey = symptoms[0];
      sequence.push(symptomScriptMap[symptomKey] || 'welcome_standard');
    } else {
      sequence.push('welcome_standard');
    }

    // 2. 深化阶段
    sequence.push('deepening_standard');

    // 3. 呼吸同步
    sequence.push('breathing_sync');

    // 4. 唤醒（仅在会话结束时）
    // sequence.push('awakening'); // 这个会在会话结束时单独调用

    return sequence;
  }

  /**
   * 构建音乐列表
   */
  private static buildMusicList(symptoms: string[]): string[] {
    const musicMap: Record<string, string> = {
      insomnia: '/music/relaxation_slow.mp3',
      anxious: '/music/calming_theta.mp3',
      tired: '/music/deep_rest.mp3',
      nightmare: '/music/peaceful_delta.mp3',
      wakeability: '/music/deep_protection.mp3',
      'stress-relief': '/music/meditation_flow.mp3',
    };

    // 默认背景音乐
    const tracks = [
      '/music/brainwave_alpha.mp3', // Alpha 脑波
      '/music/pink_noise_base.mp3', // 粉红噪音
    ];

    // 添加症状相关音乐
    symptoms.forEach((symptomId) => {
      if (musicMap[symptomId]) {
        tracks.push(musicMap[symptomId]);
      }
    });

    return tracks;
  }

  /**
   * 获取脚本文本数组
   */
  static getScriptTexts(scriptKeys: string[]): string[] {
    const texts: string[] = [];
    scriptKeys.forEach((key) => {
      const script = SCRIPTS[key];
      if (script) {
        texts.push(...script.content);
      }
    });
    return texts;
  }

  /**
   * 获取可用的背景音乐文件
   */
  static getAvailableMusicFiles(): string[] {
    return [
      '/music/brainwave_alpha.mp3',
      '/music/brainwave_theta.mp3',
      '/music/brainwave_delta.mp3',
      '/music/pink_noise_base.mp3',
      '/music/relaxation_slow.mp3',
      '/music/calming_theta.mp3',
      '/music/deep_rest.mp3',
      '/music/peaceful_delta.mp3',
      '/music/deep_protection.mp3',
      '/music/meditation_flow.mp3',
    ];
  }

  /**
   * 获取可用的脚本文件
   */
  static getAvailableScriptFiles(): string[] {
    return Object.keys(SCRIPTS);
  }

  /**
   * 生成会话摘要
   */
  static generateSessionSummary(config: ContentConfig): string {
    const constitution = CONSTITUTIONS[config.constitution];
    const symptomNames = config.symptoms
      .map((id) => SYMPTOMS[id]?.name)
      .filter(Boolean)
      .join('、');

    return `
ZenSleep 个性化睡眠方案
━━━━━━━━━━━━━━━━━━━━
体质类型: ${constitution?.name || '平和质'}
当前症状: ${symptomNames || '无特殊症状'}
会话时长: ${Math.floor(config.sessionDuration / 60)} 分钟
语音设置: 语速 ${config.voiceSettings.rate}x, 音调 ${config.voiceSettings.pitch}
脚本数: ${config.scriptSequence.length}
音乐曲目: ${config.musicTracks.length}
━━━━━━━━━━━━━━━━━━━━
    `.trim();
  }
}
