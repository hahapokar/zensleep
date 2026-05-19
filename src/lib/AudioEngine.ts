/**
 * ZenSleep AudioEngine - 简洁版本
 * 仅负责 HTMLAudioElement 的播放控制和缓存管理
 */
export class AudioEngine {
  private audioElement: HTMLAudioElement | null = null;
  
  private baseVolume: number = 0.12;
  private isPaused: boolean = false;
  private pausedVolume: number = 0;
  private audioAssetPath: string | null = null;
  private audioBlobUrl: string | null = null;
  private audioEndListener: (() => void) | null = null;
  private audioErrorListener: ((event: Event) => void) | null = null;





  public setVolume(volume: number) {
    this.baseVolume = Math.max(0, Math.min(1, volume));
    
    if (this.audioElement) {
      this.audioElement.volume = this.baseVolume;
    }
  }

  public getVolume(): number {
    return this.baseVolume;
  }



  public pause() {
    if (this.isPaused) return;
    
    this.isPaused = true;

    if (this.audioElement) {
      if (!this.audioElement.paused) {
        this.audioElement.pause();
      }
    }

    if (this.pausedVolume === 0 && this.audioElement) {
      this.pausedVolume = this.audioElement.volume;
    }
  }

  public resume() {
    if (!this.isPaused) return;
    
    this.isPaused = false;

    if (this.audioElement && this.audioElement.paused) {
      this.audioElement.play().catch(console.error);
    }

    if (this.audioElement) {
      this.audioElement.volume = this.pausedVolume;
    }
  }

  // ==============================
  // ✅ 修复：返回 0-100 进度百分比
  // ==============================
  public getCurrentTime(): number {
    return this.audioElement?.currentTime || 0;
  }

  public getPlaybackProgress(totalDuration: number): number {
    if (!this.audioElement || totalDuration <= 0) {
      return 0;
    }
    return Math.min((this.audioElement.currentTime / totalDuration) * 100, 100);
  }

  private removeAudioEventListeners() {
    if (!this.audioElement) return;
    if (this.audioEndListener) {
      this.audioElement.removeEventListener('ended', this.audioEndListener);
      this.audioEndListener = null;
    }
    if (this.audioErrorListener) {
      this.audioElement.removeEventListener('error', this.audioErrorListener);
      this.audioErrorListener = null;
    }
  }

  private async fetchAndCacheAudio(url: string): Promise<Blob> {
    const cacheName = 'zensleep-audio-cache';
    let response: Response | undefined;

    if ('caches' in window) {
      const cache = await caches.open(cacheName);
      response = await cache.match(url);
      if (response && response.ok) {
        return await response.blob();
      }

      response = await fetch(url, { credentials: 'same-origin' });
      if (!response.ok) {
        throw new Error(`Failed to fetch audio file: ${url}`);
      }
      cache.put(url, response.clone()).catch(() => {});
      return await response.blob();
    }

    response = await fetch(url, { credentials: 'same-origin' });
    if (!response.ok) {
      throw new Error(`Failed to fetch audio file: ${url}`);
    }
    return await response.blob();
  }

  public async prepareAudioFile(audioPath: string): Promise<void> {
    const resolvedPath = new URL(audioPath, window.location.href).href;
    if (this.audioAssetPath === resolvedPath && this.audioElement) {
      return;
    }

    this.removeAudioEventListeners();
    if (this.audioBlobUrl) {
      URL.revokeObjectURL(this.audioBlobUrl);
      this.audioBlobUrl = null;
    }

    this.audioAssetPath = resolvedPath;
    const audioBlob = await this.fetchAndCacheAudio(resolvedPath);
    this.audioBlobUrl = URL.createObjectURL(audioBlob);

    this.audioElement = new Audio(this.audioBlobUrl);
    this.audioElement.preload = 'auto';
    this.audioElement.volume = this.baseVolume;
  }

  public async playLoadedAudio(): Promise<void> {
    const audioElement = this.audioElement;
    if (!audioElement) {
      return Promise.reject(new Error('No audio file prepared for playback.'));
    }

    return new Promise((resolve, reject) => {
      this.removeAudioEventListeners();

      const cleanup = () => {
        audioElement.removeEventListener('ended', handleEnded);
        audioElement.removeEventListener('error', handleError);
        this.audioEndListener = null;
        this.audioErrorListener = null;
      };

      const handleEnded = () => {
        cleanup();
        resolve();
      };

      const handleError = () => {
        cleanup();
        reject(new Error(`Failed to load audio file: ${audioElement.src || 'unknown'}`));
      };

      this.audioEndListener = handleEnded;
      this.audioErrorListener = handleError;
      audioElement.addEventListener('ended', handleEnded);
      audioElement.addEventListener('error', handleError);

      audioElement.play().catch(err => {
        cleanup();
        reject(err);
      });
    });
  }

  public async playAudioFile(audioPath: string): Promise<void> {
    await this.prepareAudioFile(audioPath);
    return this.playLoadedAudio();
  }

  // ==============================
  // ✅ 新增：彻底停止音频（关闭会话用）
  // ==============================
  public stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.removeAudioEventListeners();
    }
    if (this.audioBlobUrl) {
      URL.revokeObjectURL(this.audioBlobUrl);
      this.audioBlobUrl = null;
    }
    this.audioAssetPath = null;
    this.isPaused = false;
  }

  // ==============================
  // ✅ 新增：拖动进度条跳转
  // ==============================
  public seek(time: number) {
    if (this.audioElement) {
      this.audioElement.currentTime = time;
    }
  }

  public terminate() {
    try {
      if (this.audioElement) {
        this.audioElement.pause();
        this.removeAudioEventListeners();
        this.audioElement = null;
      }
      if (this.audioBlobUrl) {
        URL.revokeObjectURL(this.audioBlobUrl);
        this.audioBlobUrl = null;
      }
      this.audioAssetPath = null;
      this.isPaused = false;
    } catch (e) {
      console.error('Error during audio engine termination:', e);
    }
  }
}

export const audioEngine = new AudioEngine();