/**
 * Azure TTS Service - 使用 Microsoft Azure 语音服务进行中文语音合成
 */

export interface AzureTTSConfig {
  apiKey: string;
  region: string;
  voiceName?: string; // 默认使用专业中文女性声音
}

export class AzureTTS {
  private apiKey: string;
  private region: string;
  private voiceName: string;
  private synthesisUrl: string;
  private isPlaying: boolean = false;

  constructor(config: AzureTTSConfig) {
    this.apiKey = config.apiKey;
    this.region = config.region;
    this.voiceName = config.voiceName || 'zh-CN-XiaoxiuNeural'; // 中文女性声音
    this.synthesisUrl = `https://${this.region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  }

  /**
   * 使用 Azure TTS 进行语音合成
   */
  async speak(text: string, onStart?: () => void, onEnd?: () => void): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // 构建 SSML
        const ssml = `
          <speak version="1.0" xml:lang="zh-CN">
            <voice name="${this.voiceName}">
              <prosody rate="0.8" pitch="+0%">
                ${this.escapeXml(text)}
              </prosody>
            </voice>
          </speak>
        `;

        // 调用 Azure TTS API
        const response = await fetch(this.synthesisUrl, {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': this.apiKey,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
          },
          body: ssml,
        });

        if (!response.ok) {
          throw new Error(`Azure TTS Error: ${response.status} ${response.statusText}`);
        }

        const audioBuffer = await response.arrayBuffer();
        this.playAudio(audioBuffer, onStart, onEnd, resolve, reject);
      } catch (error) {
        console.error('Azure TTS Error:', error);
        reject(error);
      }
    });
  }

  /**
   * 播放音频
   */
  private playAudio(
    audioBuffer: ArrayBuffer,
    onStart?: () => void,
    onEnd?: () => void,
    resolve?: (value: void) => void,
    reject?: (reason?: any) => void
  ): void {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audio = new Audio(URL.createObjectURL(new Blob([audioBuffer], { type: 'audio/mp3' })));

    this.isPlaying = true;
    if (onStart) onStart();

    audio.onended = () => {
      this.isPlaying = false;
      if (onEnd) onEnd();
      if (resolve) {
        setTimeout(resolve, 1000); // 语毕后留白1秒
      }
      URL.revokeObjectURL(audio.src);
    };

    audio.onerror = (error) => {
      console.error('Audio playback error:', error);
      this.isPlaying = false;
      if (reject) reject(error);
    };

    audio.play().catch((error) => {
      console.error('Audio play error:', error);
      if (reject) reject(error);
    });
  }

  /**
   * 停止播放
   */
  stop(): void {
    this.isPlaying = false;
  }

  /**
   * 检查是否正在播放
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * 转换文本以用于 SSML
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * 各种声音选项
   */
  static readonly VOICE_OPTIONS = {
    FEMALE_PROFESSIONAL: 'zh-CN-XiaoxiuNeural', // 专业女性
    FEMALE_WARM: 'zh-CN-XiaomoNeural', // 温暖女性
    MALE_CALM: 'zh-CN-YunyangNeural', // 平静男性
    CHILD: 'zh-CN-XiaohanNeural', // 儿童声音
  };
}

// 创建全局实例
let azureTTS: AzureTTS | null = null;

export const initializeAzureTTS = (): AzureTTS => {
  if (!azureTTS) {
    const apiKey = process.env.AZURE_TTS_KEY;
    const region = process.env.AZURE_TTS_REGION;

    if (!apiKey || !region) {
      throw new Error(
        'Azure TTS 配置缺失。请在 .env 中设置 AZURE_TTS_KEY 和 AZURE_TTS_REGION'
      );
    }

    azureTTS = new AzureTTS({ apiKey, region });
  }

  return azureTTS;
};

export const getAzureTTS = (): AzureTTS | null => azureTTS;
