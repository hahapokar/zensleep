/**
 * 易醒症状脚本
 */

export interface SymptomScript {
  key: string;
  title: string;
  content: string[];
  duration: number;
  emotion: 'calm' | 'soothing' | 'warm';
}

export const WAKEABILITY_SCRIPTS: Record<string, SymptomScript> = {
  wakeability_intro: {
    key: 'wakeability_intro',
    title: '易醒导语',
    content: [
      '欢迎来到 ZenSleep 深度锁定系统。',
      '我知道浅眠很困扰。让我们一起改变这个模式。',
      '想象你正在逐渐下沉，进入一个更深、更深的水域。',
      '每一层水都是一个保护，让你远离外界的干扰。',
      '你的身体变得越来越沉重，越来越稳固。',
      '声音、光线、任何打搅都无法触及你。',
      '你现在进入了深度睡眠的安全堡垒。',
      '今晚，你将拥有连续而深沉的睡眠。',
    ],
    duration: 75,
    emotion: 'soothing',
  },

  wakeability_lock: {
    key: 'wakeability_lock',
    title: '睡眠锁定',
    content: [
      '你的意识正在进入深度锁定状态。',
      '外界的任何声音，都变得遥远而模糊。',
      '你的身体像岩石一样稳固。',
      '睡眠的深度正在加倍。',
      '你现在是完全安全的，完全放松的。',
    ],
    duration: 40,
    emotion: 'soothing',
  },
};