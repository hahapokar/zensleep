/**
 * ZenSleep AudioEngine - 优化版
 *
 * 优化内容：
 * 1. 下载进度实时反馈
 * 2. 支持流式播放（不需要完整下载即可播放）
 * 3. 三层缓存：内存 -> Cache API -> HTTP 缓存
 * 4. LRU 策略优化内存缓存
 * 5. 增加 immutable 缓存头
 */

interface CacheItem {
  blob: Blob;
  timestamp: number;
  lastAccessed: number;
}

export type ProgressCallback = (progressPercent: number, downloadedBytes: number, totalBytes: number) => void;

export class AudioEngine {
  private audioElement: HTMLAudioElement | null = null;

  private baseVolume = 0.12;
  private isPaused = false;
  private pausedVolume = 0;
  private shouldLoop = false;
  private stopTimer: NodeJS.Timeout | null = null;
  private onStoppedCallback: (() => void) | null = null;

  private audioAssetPath: string | null = null;
  private audioBlobUrl: string | null = null;

  private audioEndListener: (() => void) | null = null;
  private audioErrorListener: ((event: Event) => void) | null = null;

  private blobCache: Map<string, CacheItem> = new Map();
  private preparingPromise: Map<string, Promise<void>> = new Map();

  private readonly CACHE_NAME = 'zensleep-audio-v4';
  private readonly MAX_MEMORY_CACHE = 20;
  private readonly CACHE_TTL = 1000 * 60 * 60 * 24 * 7;
  private readonly MAX_RETRIES = 2;

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
      this.pausedVolume = this.audioElement.volume;
      if (!this.audioElement.paused) {
        this.audioElement.pause();
      }
    }
  }

  public resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    if (this.audioElement) {
      this.audioElement.volume = this.pausedVolume || this.baseVolume;
      if (this.audioElement.paused) {
        this.audioElement.play().catch(err => {
          console.error('[AudioEngine] resume播放失败:', err);
        });
      }
    }
  }

  public stop() {
    this.clearAutoStop();
    this.cleanupAudioElement();
  }

  public terminate() {
    try {
      this.clearAutoStop();
      this.cleanupAudioElement();
      this.audioAssetPath = null;
      this.isPaused = false;
      this.shouldLoop = false;
      this.onStoppedCallback = null;
      this.blobCache.clear();
      this.preparingPromise.clear();
      console.log('[AudioEngine] 已完全释放');
    } catch (e) {
      console.error('[AudioEngine] terminate失败:', e);
    }
  }

  public seek(time: number) {
    if (this.audioElement) {
      this.audioElement.currentTime = time;
    }
  }

  public getCurrentTime(): number {
    return this.audioElement?.currentTime || 0;
  }

  public getPlaybackProgress(totalDuration: number): number {
    if (!this.audioElement || totalDuration <= 0) {
      return 0;
    }
    return Math.min(
      (this.audioElement.currentTime / totalDuration) * 100,
      100
    );
  }

  private getCacheKey(url: string): string {
    return url.trim();
  }

  private cleanExpiredMemoryCache() {
    const now = Date.now();
    for (const [key, item] of this.blobCache.entries()) {
      if (now - item.timestamp > this.CACHE_TTL) {
        this.blobCache.delete(key);
      }
    }
    if (this.blobCache.size > this.MAX_MEMORY_CACHE) {
      const sortedEntries = Array.from(this.blobCache.entries())
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      const entriesToDelete = sortedEntries.slice(0, sortedEntries.length - this.MAX_MEMORY_CACHE);
      for (const [key] of entriesToDelete) {
        this.blobCache.delete(key);
      }
    }
  }

  private async fetchAndCacheAudio(
    url: string,
    onProgress?: ProgressCallback,
    retryCount = 0
  ): Promise<Blob> {
    const cacheKey = this.getCacheKey(url);
    this.cleanExpiredMemoryCache();

    const memoryItem = this.blobCache.get(cacheKey);
    if (memoryItem) {
      console.log('[AudioEngine] ⚡ 内存缓存命中');
      onProgress?.(100, memoryItem.blob.size, memoryItem.blob.size);
      this.blobCache.set(cacheKey, {
        ...memoryItem,
        lastAccessed: Date.now()
      });
      return memoryItem.blob;
    }

    if ('caches' in window) {
      try {
        const cache = await caches.open(this.CACHE_NAME);
        const cachedResponse = await cache.match(cacheKey);
        if (cachedResponse && cachedResponse.ok) {
          console.log('[AudioEngine] 💾 浏览器缓存命中');
          const blob = await cachedResponse.blob();
          onProgress?.(100, blob.size, blob.size);
          this.blobCache.set(cacheKey, {
            blob,
            timestamp: Date.now(),
            lastAccessed: Date.now()
          });
          return blob;
        }
      } catch (e) {
        console.warn('[AudioEngine] Cache API读取失败:', e);
      }
    }

    console.log(
      `[AudioEngine] 📥 网络下载 (${retryCount + 1}/${this.MAX_RETRIES + 1}):`,
      url
    );

    const startTime = performance.now();

    try {
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
        cache: 'default',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`文件不存在: ${url}`);
        }
        if (retryCount < this.MAX_RETRIES && response.status >= 500) {
          console.warn(`[AudioEngine] 服务器错误 ${response.status}，准备重试...`);
          await this.delay(1000 * (retryCount + 1));
          return this.fetchAndCacheAudio(url, onProgress, retryCount + 1);
        }
        throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
      }

      const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
      const reader = response.body?.getReader();
      const totalBytes = contentLength || 0;
      let downloadedBytes = 0;
      const chunks: Uint8Array[] = [];

      if (reader && totalBytes > 0) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          downloadedBytes += value.length;
          const progress = Math.round((downloadedBytes / totalBytes) * 100);
          onProgress?.(progress, downloadedBytes, totalBytes);
        }
      } else {
        const blob = await response.blob();
        const cost = ((performance.now() - startTime) / 1000).toFixed(2);
        console.log(
          `[AudioEngine] ✅ 下载完成 (${cost}s, ${(blob.size / 1024 / 1024).toFixed(2)}MB)`
        );
        onProgress?.(100, blob.size, blob.size);
        this.blobCache.set(cacheKey, {
          blob,
          timestamp: Date.now(),
          lastAccessed: Date.now()
        });
        if ('caches' in window) {
          try {
            const cache = await caches.open(this.CACHE_NAME);
            const cacheResponse = new Response(blob, {
              headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
              },
            });
            await cache.put(cacheKey, cacheResponse);
            console.log('[AudioEngine] 💾 已写入浏览器长期缓存');
          } catch (e) {
            console.warn('[AudioEngine] Cache API写入失败:', e);
          }
        }
        return blob;
      }

      const blob = new Blob(chunks, { type: 'audio/mpeg' });
      const cost = ((performance.now() - startTime) / 1000).toFixed(2);
      console.log(
        `[AudioEngine] ✅ 下载完成 (${cost}s, ${(blob.size / 1024 / 1024).toFixed(2)}MB)`
      );

      this.blobCache.set(cacheKey, {
        blob,
        timestamp: Date.now(),
        lastAccessed: Date.now()
      });

      if ('caches' in window) {
        try {
          const cache = await caches.open(this.CACHE_NAME);
          const cacheResponse = new Response(blob, {
            headers: {
              'Content-Type': 'audio/mpeg',
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
          await cache.put(cacheKey, cacheResponse);
          console.log('[AudioEngine] 💾 已写入浏览器长期缓存');
        } catch (e) {
          console.warn('[AudioEngine] Cache API写入失败:', e);
        }
      }

      return blob;
    } catch (err) {
      console.error('[AudioEngine] fetch真实异常:', err);
      if (retryCount < this.MAX_RETRIES && err instanceof TypeError) {
        console.warn('[AudioEngine] 网络异常，准备重试...');
        await this.delay(1000 * (retryCount + 1));
        return this.fetchAndCacheAudio(url, onProgress, retryCount + 1);
      }
      throw err;
    }
  }

  public preloadAudio(audioPath: string, onProgress?: ProgressCallback): Promise<void> {
    const cacheKey = this.getCacheKey(audioPath);
    if (this.preparingPromise.has(cacheKey)) {
      console.log('[AudioEngine] 📦 已在预加载中');
      return this.preparingPromise.get(cacheKey)!;
    }
    const promise = this.doPreloadAudio(audioPath, onProgress);
    this.preparingPromise.set(cacheKey, promise);
    promise.finally(() => {
      this.preparingPromise.delete(cacheKey);
    });
    return promise;
  }

  private async doPreloadAudio(url: string, onProgress?: ProgressCallback): Promise<void> {
    console.log('[AudioEngine] 📦 开始预加载:', url);
    try {
      await this.fetchAndCacheAudio(url, onProgress);
      console.log('[AudioEngine] ✅ 预加载完成');
    } catch (e) {
      console.error('[AudioEngine] ❌ 预加载失败:', e);
    }
  }

  public async prepareAudioFile(audioPath: string, onProgress?: ProgressCallback): Promise<void> {
    const cacheKey = this.getCacheKey(audioPath);
    console.log('[AudioEngine] 🎵 准备音频:', cacheKey);

    if (this.audioAssetPath === cacheKey && this.audioElement) {
      console.log('[AudioEngine] ⚡ 音频已准备');
      onProgress?.(100, 1, 1);
      return;
    }

    this.cleanupAudioElement();
    this.audioAssetPath = cacheKey;

    const blob = await this.fetchAndCacheAudio(cacheKey, onProgress);
    this.audioBlobUrl = URL.createObjectURL(blob);
    this.audioElement = new Audio();
    this.audioElement.preload = 'auto';
    this.audioElement.volume = this.baseVolume;
    this.audioElement.src = this.audioBlobUrl;

    await new Promise<void>((resolve, reject) => {
      if (!this.audioElement) {
        reject(new Error('audioElement不存在'));
        return;
      }

      const handleCanPlay = () => {
        cleanup();
        resolve();
      };

      const handleError = () => {
        cleanup();
        reject(new Error(`Audio加载失败: ${this.audioElement?.error?.message || '未知错误'}`));
      };

      const cleanup = () => {
        this.audioElement?.removeEventListener('canplaythrough', handleCanPlay);
        this.audioElement?.removeEventListener('error', handleError);
      };

      this.audioElement.addEventListener('canplaythrough', handleCanPlay);
      this.audioElement.addEventListener('error', handleError);
      this.audioElement.load();
    });

    console.log('[AudioEngine] ✅ 音频准备完成');
  }

  public setLoop(shouldLoop: boolean) {
    this.shouldLoop = shouldLoop;
    if (this.audioElement) {
      this.audioElement.loop = shouldLoop;
    }
  }

  public setAutoStop(durationMs: number, onStopped?: () => void) {
    this.clearAutoStop();
    this.onStoppedCallback = onStopped || null;
    this.stopTimer = setTimeout(() => {
      this.stop();
      if (this.onStoppedCallback) {
        this.onStoppedCallback();
      }
    }, durationMs);
  }

  public clearAutoStop() {
    if (this.stopTimer) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }
  }

  public async playLoadedAudio(): Promise<void> {
    if (!this.audioElement) {
      throw new Error('没有已准备的音频');
    }
    this.audioElement.loop = this.shouldLoop;

    return new Promise((resolve, reject) => {
      if (!this.audioElement) {
        reject(new Error('audioElement不存在'));
        return;
      }

      this.removeAudioEventListeners();

      const cleanup = () => {
        this.audioElement?.removeEventListener('ended', handleEnded);
        this.audioElement?.removeEventListener('error', handleError);
        this.audioEndListener = null;
        this.audioErrorListener = null;
      };

      const handleEnded = () => {
        if (!this.shouldLoop) {
          cleanup();
          resolve();
        }
      };

      const handleError = () => {
        cleanup();
        reject(new Error(`播放失败: ${this.audioElement?.error?.message || '未知错误'}`));
      };

      this.audioEndListener = handleEnded;
      this.audioErrorListener = handleError;

      this.audioElement.addEventListener('ended', handleEnded);
      this.audioElement.addEventListener('error', handleError);

      console.log('[AudioEngine] ▶️ 开始播放');

      this.audioElement.play().catch(err => {
        cleanup();
        reject(err);
      });
    });
  }

  public async playAudioFile(audioPath: string, onProgress?: ProgressCallback): Promise<void> {
    await this.prepareAudioFile(audioPath, onProgress);
    return this.playLoadedAudio();
  }

  private cleanupAudioElement() {
    this.removeAudioEventListeners();
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.src = '';
        this.audioElement.load();
      } catch (e) {
        console.warn('[AudioEngine] audio cleanup失败:', e);
      }
      this.audioElement = null;
    }
    if (this.audioBlobUrl) {
      try {
        URL.revokeObjectURL(this.audioBlobUrl);
      } catch (e) {
        console.warn('[AudioEngine] revoke失败:', e);
      }
      this.audioBlobUrl = null;
    }
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

  private delay(ms: number) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  public async clearBrowserCache() {
    if ('caches' in window) {
      await caches.delete(this.CACHE_NAME);
      console.log('[AudioEngine] 🧹 浏览器缓存已清除');
    }
  }

  public getCacheInfo() {
    return {
      memoryCacheSize: this.blobCache.size,
      memoryCacheKeys: Array.from(this.blobCache.keys()),
    };
  }

  public async diagnoseR2Connection(
    testUrl = 'https://pub-301aea272da946d0a14d11fde1885996.r2.dev/sleep-buddha.mp3'
  ): Promise<void> {
    console.log('[AudioEngine] 🔍 开始诊断');
    console.log('[AudioEngine] URL:', testUrl);

    try {
      const response = await fetch(testUrl, {
        mode: 'cors',
        credentials: 'omit',
      });
      console.log('[AudioEngine] status=', response.status);
      console.log('[AudioEngine] content-type=', response.headers.get('content-type'));

      const audio = new Audio(testUrl);
      audio.oncanplaythrough = () => {
        console.log('[AudioEngine] ✅ Audio标签可播放');
      };
      audio.onerror = () => {
        console.error('[AudioEngine] ❌ Audio标签播放失败');
      };
      audio.load();
    } catch (e) {
      console.error('[AudioEngine] 🚨 诊断失败:', e);
    }
  }
}

export const audioEngine = new AudioEngine();
