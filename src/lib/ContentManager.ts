/**
 * 内容管理器 - 处理脚本和资源文件的映射
 */

import { ScriptManager, SCRIPTS } from '../data/scripts';

// Cloudflare R2 音频存储 URL
const CLOUDFLARE_R2_URL = 'https://pub-301aea272da946d0a14d11fde1885996.r2.dev/';

export interface ContentConfig {
  constitution: string;
  symptoms: string[];
  sessionDuration: number;
  voiceSettings: {
    rate: number;
    pitch: number;
  };
  scriptSequence: string[];
  musicTracks: string[];
  audioFile?: string;
}

export class ContentManager {
  static generateContentConfig(
    constitution: string,
    symptoms: string[],
    nsdrDuration?: number,
    sleepOption?: string,
    musicOption?: string
  ): ContentConfig {
    const voiceSettings = { rate: 0.5, pitch: 0.6 };

    let sessionDuration = 1200;
    if (symptoms.includes('nsdr')) {
      sessionDuration = nsdrDuration || 1800;
    } else if (symptoms.includes('sleep') && sleepOption) {
      const script = SCRIPTS[`sleep-${sleepOption}`];
      sessionDuration = script?.duration || 1200;
    } else if (symptoms.includes('music') && musicOption) {
      const script = SCRIPTS[`music-${musicOption}`];
      sessionDuration = script?.duration || 1200;
    }

    const scriptSequence = this.buildScriptSequence(constitution, symptoms, nsdrDuration, sleepOption, musicOption);
    
    // ==============================================
    // 关键：你不需要额外音乐，直接清空 musicTracks
    // ==============================================
    const musicTracks: string[] = [];

    let audioFile: string | undefined;

    if (symptoms.includes('nsdr')) {
      if (nsdrDuration === 600) {
        audioFile = `${CLOUDFLARE_R2_URL}nsdr-power-recharge.mp3`;
      } else if (nsdrDuration === 1200) {
        audioFile = `${CLOUDFLARE_R2_URL}nsdr-stress-reset.mp3`;
      } else {
        audioFile = `${CLOUDFLARE_R2_URL}nsdr-deep-recovery.mp3`;
      }
    } else if (symptoms.includes('sleep') && sleepOption) {
      audioFile = `${CLOUDFLARE_R2_URL}sleep-${sleepOption}.mp3`;
    } else if (symptoms.includes('music') && musicOption) {
      audioFile = `${CLOUDFLARE_R2_URL}music-${musicOption}.mp3`;
    }

    return {
      constitution,
      symptoms,
      sessionDuration,
      voiceSettings,
      scriptSequence,
      musicTracks,
      audioFile,
    };
  }

  private static buildScriptSequence(
    constitution: string,
    symptoms: string[],
    nsdrDuration?: number,
    sleepOption?: string,
    musicOption?: string
  ): string[] {
    if (symptoms.length > 0) {
      const primarySymptom = symptoms[0];
      const validSymptoms = ['nsdr', 'sleep', 'music'];
      if (validSymptoms.includes(primarySymptom)) {
        if (primarySymptom === 'nsdr') {
          if (nsdrDuration === 600) {
            return ['nsdr-power-recharge'];
          } else if (nsdrDuration === 1200) {
            return ['nsdr-stress-reset'];
          } else {
            return ['nsdr-deep-recovery'];
          }
        } else if (primarySymptom === 'sleep' && sleepOption) {
          const sleepSequences: Record<string, string[]> = {
            'clear-mind': ['sleep-clear-mind'],
            'relax-body': ['sleep-relax-body'],
            'calm-heart': ['sleep-calm-heart'],
          };
          return sleepSequences[sleepOption] || ScriptManager.getRecommendedScriptSequence('sleep');
        } else if (primarySymptom === 'music' && musicOption) {
          const musicSequences: Record<string, string[]> = {
            'light': ['music-light'],
            'balanced': ['music-balanced'],
            'deep': ['music-deep'],
          };
          return musicSequences[musicOption] || ScriptManager.getRecommendedScriptSequence('music');
        }
        return ScriptManager.getRecommendedScriptSequence(primarySymptom);
      }
    }
    return ScriptManager.getRecommendedScriptSequence('general');
  }

  // ==============================
  // 你不用的功能，我直接清理干净
  // ==============================
  private static buildMusicList(): string[] {
    return [];
  }

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

  static getAvailableMusicFiles(): string[] {
    return [];
  }

  static getAvailableScriptFiles(): string[] {
    return Object.keys(SCRIPTS);
  }
}