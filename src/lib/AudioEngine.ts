/**
 * ZenSleep AudioEngine - 性能优化版
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
  
  private blobCache: Map<string, Blob> = new Map();
  private preparingPromise: Map<string, Promise<void>> = new Map();
  
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

  private getCacheKey(url: string): string {
    return url;
  }

  private async fetchAndCacheAudio(url: string, retryCount: number = 0): Promise<Blob> {
    const cacheKey = this.getCacheKey(url);
    const cacheName = 'zensleep-audio-v2';
    const MAX_RETRIES = 2;
    
    // 第一步：检查内存缓存
    if (this.blobCache.has(cacheKey)) {
      console.log('[AudioEngine] ⚡⚡ 内存缓存命中，瞬间返回!');
      return this.blobCache.get(cacheKey)!;
    }
    
    // 第二步：检查浏览器缓存
    if ('caches' in window) {
      try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(cacheKey);
        
        if (cachedResponse && cachedResponse.ok) {
          console.log('[AudioEngine] ✅ 浏览器缓存命中');
          const blob = await cachedResponse.blob();
          this.blobCache.set(cacheKey, blob);
          return blob;
        }
      } catch (e) {
        console.warn('[AudioEngine] 缓存读取失败，继续网络请求', e);
      }
    }
    
    // 第三步：从网络下载
    console.log(`[AudioEngine] 📥 正在从网络下载音频 (尝试 ${retryCount + 1}/${MAX_RETRIES + 1}):`, url);
    const startTime = performance.now();
    
    try {
      const response = await fetch(url, { 
        cache: 'force-cache',
        mode: 'cors',
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        if (response.status === 404 && retryCount < MAX_RETRIES) {
          console.warn(`[AudioEngine] ⚠️  文件未找到 (${response.status})，${retryCount + 1}秒后重试...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return this.fetchAndCacheAudio(url, retryCount + 1);
        }
        throw new Error(`音频下载失败: ${response.status}`);
      }
      
      const blob = await response.blob();
      const downloadTime = (performance.now() - startTime) / 1000;
      console.log(`[AudioEngine] ✅ 下载完成 (${downloadTime.toFixed(2)}s, ${(blob.size / 1024 / 1024).toFixed(2)}MB)`);
      
      this.blobCache.set(cacheKey, blob);
      
      // 第四步：存入浏览器缓存
      if ('caches' in window) {
        try {
          const cache = await caches.open(cacheName);
          const cacheResponse = new Response(blob, {
            headers: {
              'Content-Type': 'audio/mpeg',
              'Cache-Control': 'public, max-age=31536000'
            }
          });
          await cache.put(cacheKey, cacheResponse);
          console.log('[AudioEngine] 💾 已存入浏览器缓存');
        } catch (e) {
          console.warn('[AudioEngine] 浏览器缓存存储失败', e);
        }
      }
      
      return blob;
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        console.warn(`[AudioEngine] ⚠️  网络错误，${retryCount + 1}秒后重试...`, error);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.fetchAndCacheAudio(url, retryCount + 1);
      }
      throw error;
    }
  }

  public preloadAudio(audioPath: string): Promise<void> {
    const url = audioPath;
    const cacheKey = this.getCacheKey(url);
    
    if (this.preparingPromise.has(cacheKey)) {
      console.log('[AudioEngine] 📦 音频已在准备中');
      return this.preparingPromise.get(cacheKey)!;
    }
    
    const preparePromise = this.doPreloadAudio(url);
    this.preparingPromise.set(cacheKey, preparePromise);
    
    preparePromise.finally(() => {
      this.preparingPromise.delete(cacheKey);
    });
    
    return preparePromise;
  }

  private async doPreloadAudio(url: string): Promise<void> {
    console.log('[AudioEngine] 📦 开始预加载:', url);
    try {
      await this.fetchAndCacheAudio(url);
      console.log('[AudioEngine] 📦 预加载完成');
    } catch (e) {
      console.error('[AudioEngine] 预加载失败:', e);
      throw e;
    }
  }

  public async prepareAudioFile(audioPath: string): Promise<void> {
    const url = audioPath;
    const cacheKey = this.getCacheKey(url);
    
    console.log('[AudioEngine] 🎵 准备音频:', url);
    
    if (this.audioAssetPath === url && this.audioElement) {
      console.log('[AudioEngine] ⚡ 音频已准备好');
      return;
    }
    
    this.removeAudioEventListeners();
    if (this.audioBlobUrl) {
      URL.revokeObjectURL(this.audioBlobUrl);
      this.audioBlobUrl = null;
    }
    
    this.audioAssetPath = url;
    
    const audioBlob = await this.fetchAndCacheAudio(url);
    this.audioBlobUrl = URL.createObjectURL(audioBlob);
    
    this.audioElement = new Audio(this.audioBlobUrl);
    this.audioElement.preload = 'auto';
    this.audioElement.volume = this.baseVolume;
    
    this.audioElement.load();
    
    console.log('[AudioEngine] ✅ 音频准备完成');
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

      console.log('[AudioEngine] ▶️ 开始播放');
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

  public getCacheInfo() {
    return {
      memoryCacheSize: this.blobCache.size,
      memoryCacheKeys: Array.from(this.blobCache.keys())
    };
  }
}

export const audioEngine = new AudioEngine();
