/**
 * 症状脚本索引文件
 * 按症状分类组织所有脚本
 */

import { INSOMNIA_SCRIPTS } from './insomnia';
import { ANXIOUS_SCRIPTS } from './anxious';
import { TIRED_SCRIPTS } from './tired';
import { NIGHTMARE_SCRIPTS } from './nightmare';
import { WAKEABILITY_SCRIPTS } from './wakeability';
import { STRESS_RELIEF_SCRIPTS } from './stress-relief';
import { GENERAL_SCRIPTS } from './general';
import { NSDR_SCRIPTS } from './nsdr';
import { SLEEP_SCRIPTS } from './sleep';

export interface SymptomScript {
  key: string;
  title: string;
  content: string[];
  duration: number;
  emotion: 'calm' | 'soothing' | 'warm';
}

// 症状类型定义
export type SymptomType =
  | 'insomnia'
  | 'anxious'
  | 'tired'
  | 'nightmare'
  | 'wakeability'
  | 'stress-relief'
  | 'general'
  | 'nsdr'
  | 'sleep';

// 所有症状脚本的集合
export const SYMPTOM_SCRIPTS = {
  insomnia: INSOMNIA_SCRIPTS,
  anxious: ANXIOUS_SCRIPTS,
  tired: TIRED_SCRIPTS,
  nightmare: NIGHTMARE_SCRIPTS,
  wakeability: WAKEABILITY_SCRIPTS,
  'stress-relief': STRESS_RELIEF_SCRIPTS,
  general: GENERAL_SCRIPTS,
  nsdr: NSDR_SCRIPTS,
  sleep: SLEEP_SCRIPTS,
} as const;