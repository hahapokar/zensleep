/**
 * ZenSleep AudioEngine - 自动化睡眠阶梯版
 */
export class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private lowpassFilter: BiquadFilterNode | null = null;
  private panner: StereoPannerNode | null = null;
  private pinkNoiseSource: AudioBufferSourceNode | null = null;
  private brainwaveOsc: OscillatorNode | null = null;
  private brainwaveLfo: OscillatorNode | null = null;
  private brainwaveGain: GainNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  
  private baseVolume: number = 0.12;
  private isPaused: boolean = false;
  private pausedVolume: number = 0; 

  private async init() {
    if (this.audioCtx) {
      if (this.audioCtx.state === 'suspended') await this.audioCtx.resume();
      return;
    }
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.audioCtx = new AudioContextClass();
    
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.connect(this.audioCtx.destination);
    // 初始音量为 0，用于 fadeIn
    this.masterGain.gain.value = 0;

    this.lowpassFilter = this.audioCtx.createBiquadFilter();
    this.lowpassFilter.type = 'lowpass';
    this.lowpassFilter.frequency.value = 800; // 初始较明亮，方便导引
    
    this.panner = this.audioCtx.createStereoPanner();
    this.panner.connect(this.lowpassFilter);
    this.lowpassFilter.connect(this.masterGain);
  }

  // 背景音避让，增加 3 秒平滑度
  public fadeBackgroundForVoice(isSpeaking: boolean) {
    if (!this.masterGain || !this.audioCtx) return;
    const targetVol = isSpeaking ? this.baseVolume * 0.3 : this.baseVolume;
    this.masterGain.gain.setTargetAtTime(targetVol, this.audioCtx.currentTime, 3.0);
  }

  public async startAudioPipeline() {
    await this.init();
    const ctx = this.audioCtx!;

    // 1. 生成并启动粉红噪音
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    this.pinkNoiseSource = ctx.createBufferSource();
    this.pinkNoiseSource.buffer = buffer;
    this.pinkNoiseSource.loop = true;
    this.pinkNoiseSource.connect(this.panner!);
    this.pinkNoiseSource.start();

    // 2. 启动脑波 (初始 Alpha 10Hz)
    this.brainwaveOsc = ctx.createOscillator();
    this.brainwaveOsc.type = 'sine';
    this.brainwaveOsc.frequency.value = 65; // 基频 
    
    this.brainwaveLfo = ctx.createOscillator();
    this.brainwaveLfo.type = 'sine';
    this.brainwaveLfo.frequency.value = 10; // 初始 Alpha
    
    this.brainwaveGain = ctx.createGain();
    this.brainwaveGain.gain.value = 0.15; 

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.12; 

    this.brainwaveLfo.connect(lfoGain.gain);
    this.brainwaveOsc.connect(this.brainwaveGain);
    this.brainwaveGain.connect(this.panner!);
    
    this.brainwaveOsc.start();
    this.brainwaveLfo.start();

    // 3. 全局淡入 5 秒
    this.masterGain!.gain.linearRampToValueAtTime(this.baseVolume, ctx.currentTime + 5);
  }

  // 动态调节脑波频率和音色变闷
  public evolveState(targetFreq: number, filterFreq: number, transitionSec: number) {
    if (!this.audioCtx || !this.brainwaveLfo || !this.lowpassFilter) return;
    const now = this.audioCtx.currentTime;
    this.brainwaveLfo.frequency.exponentialRampToValueAtTime(targetFreq, now + transitionSec);
    this.lowpassFilter.frequency.exponentialRampToValueAtTime(filterFreq, now + transitionSec);
  }

  // 呼吸耦合：吸气时频率上升且音量微增，呼气时频率下降且音量微减
  public syncBreathing(phase: 'INHALE' | 'EXHALE', durationMs: number) {
    if (!this.audioCtx || !this.lowpassFilter || !this.masterGain) return;
    const now = this.audioCtx.currentTime;
    const time = durationMs / 1000;

    if (phase === 'INHALE') {
      this.lowpassFilter.frequency.setTargetAtTime(450, now, time / 2);
      this.masterGain.gain.setTargetAtTime(this.baseVolume * 1.1, now, time / 2);
    } else {
      this.lowpassFilter.frequency.setTargetAtTime(180, now, time / 2);
      this.masterGain.gain.setTargetAtTime(this.baseVolume * 0.9, now, time / 2);
    }
  }

  public pause() {
    if (!this.masterGain || !this.audioCtx || this.isPaused) return;
    this.isPaused = true;
    this.pausedVolume = this.masterGain.gain.value;
    this.masterGain.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.5);
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  public resume() {
    if (!this.masterGain || !this.audioCtx || !this.isPaused) return;
    this.isPaused = false;
    this.masterGain.gain.setTargetAtTime(this.pausedVolume, this.audioCtx.currentTime, 0.5);
    if (this.audioElement) {
      this.audioElement.play().catch(console.error);
    }
  }

  public async playAudioFile(audioPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.audioElement = new Audio(audioPath);
      this.audioElement.volume = this.baseVolume;
      
      this.audioElement.addEventListener('ended', () => {
        resolve();
      });
      
      this.audioElement.addEventListener('error', (e) => {
        reject(new Error(`Failed to load audio file: ${audioPath}`));
      });
      
      this.audioElement.play().catch(reject);
    });
  }

  public terminate() {
    if (this.brainwaveOsc) {
      this.brainwaveOsc.stop();
    }
    if (this.brainwaveLfo) {
      this.brainwaveLfo.stop();
    }
    if (this.pinkNoiseSource) {
      this.pinkNoiseSource.stop();
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }
    if (this.masterGain) {
      this.masterGain.gain.value = 0;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
    }
    this.audioCtx = null;
    this.masterGain = null;
    this.lowpassFilter = null;
    this.panner = null;
    this.pinkNoiseSource = null;
    this.brainwaveOsc = null;
    this.brainwaveLfo = null;
    this.brainwaveGain = null;
  }
}
export const audioEngine = new AudioEngine();