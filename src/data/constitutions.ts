/**
 * 中医体质类型和相关数据
 */

export interface Constitution {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  recommendedHerbs: string[];
  recommendedTeas: string[];
  voiceSettings: {
    rate: number; // 语速
    pitch: number; // 音调
  };
}

export const CONSTITUTIONS: Record<string, Constitution> = {
  balanced: {
    id: 'balanced',
    name: '平和质',
    description: '体质均衡，阴阳气血调和',
    characteristics: ['精力充沛', '睡眠良好', '体质健康', '心态平和'],
    recommendedHerbs: ['黄芪', '红枣', '甘草'],
    recommendedTeas: ['红茶', '乌龙茶', '普洱茶'],
    voiceSettings: { rate: 0.5, pitch: 0.6 },
  },
  qiDeficient: {
    id: 'qi-deficient',
    name: '气虚质',
    description: '体内气虚，四肢乏力',
    characteristics: ['容易疲劳', '说话声小', '容易感冒', '消化不好'],
    recommendedHerbs: ['黄芪', '党参', '红枣', '甘草'],
    recommendedTeas: ['红参茶', '洋参茶', '黄芪茶'],
    voiceSettings: { rate: 0.45, pitch: 0.65 },
  },
  yangDeficient: {
    id: 'yang-deficient',
    name: '阳虚质',
    description: '阳气不足，身体怕冷',
    characteristics: ['怕冷', '手脚冰冷', '消化不好', '尿频'],
    recommendedHerbs: ['肉桂', '干姜', '附子', '艾叶'],
    recommendedTeas: ['覆盆茶', '肉桂茶', '生姜茶'],
    voiceSettings: { rate: 0.5, pitch: 0.55 },
  },
  yinDeficient: {
    id: 'yin-deficient',
    name: '阴虚质',
    description: '阴液不足，容易上火',
    characteristics: ['口干', '便秘', '容易上火', '皮肤干燥'],
    recommendedHerbs: ['麦冬', '石斛', '百合', '甘草'],
    recommendedTeas: ['银耳茶', '喝蜂蜜水', '花茶'],
    voiceSettings: { rate: 0.5, pitch: 0.7 },
  },
  phlegmDamp: {
    id: 'phlegm-damp',
    name: '痰湿质',
    description: '体内湿气重，容易发胖',
    characteristics: ['身体沉重', '腹部松软', '容易疲劳', '大便粘滞'],
    recommendedHerbs: ['薏米', '茯苓', '冬瓜', '赤小豆'],
    recommendedTeas: ['薏米茶', '茯苓茶', '山楂茶'],
    voiceSettings: { rate: 0.48, pitch: 0.62 },
  },
  damp: {
    id: 'damp',
    name: '湿热质',
    description: '湿热并存，容易长痘',
    characteristics: ['皮肤油腻', '口苦', '大便粘滞', '容易长痘'],
    recommendedHerbs: ['薏米', '绿豆', '冬瓜', '薏米'],
    recommendedTeas: ['绿茶', '苦瓜茶', '薏米茶'],
    voiceSettings: { rate: 0.48, pitch: 0.58 },
  },
  bloodStasis: {
    id: 'blood-stasis',
    name: '血瘀质',
    description: '血液循环不畅',
    characteristics: ['肤色暗沉', '容易长斑', '舌质暗', '睡眠不好'],
    recommendedHerbs: ['红花', '丹参', '山楂', '黑木耳'],
    recommendedTeas: ['黑木耳茶', '玫瑰茶', '红花茶'],
    voiceSettings: { rate: 0.5, pitch: 0.55 },
  },
  specialDiathesis: {
    id: 'special-diathesis',
    name: '特禀质',
    description: '易过敏体质',
    characteristics: ['容易过敏', '皮肤敏感', '容易打喷嚏', '容易腹泻'],
    recommendedHerbs: ['薏米', '红枣', '黄芪', '蜂蜜'],
    recommendedTeas: ['红枣茶', '蜂蜜茶', '姜茶'],
    voiceSettings: { rate: 0.5, pitch: 0.65 },
  },
  depressedMood: {
    id: 'depressed-mood',
    name: '气郁质',
    description: '情绪郁闷，心情不好',
    characteristics: ['情绪低沉', '爱叹气', '睡眠不好', '容易烦躁'],
    recommendedHerbs: ['玫瑰花', '黄芪', '红枣', '甘草'],
    recommendedTeas: ['玫瑰茶', '花茶', '茉莉花茶'],
    voiceSettings: { rate: 0.48, pitch: 0.7 },
  },
};

export interface Symptom {
  id: string;
  name: string;
  description: string;
  scriptKey: string; // 对应脚本文件
  musicKey: string; // 对应音乐文件
  additionalDuration?: number; // 额外时长（秒）
}

export const SYMPTOMS: Record<string, Symptom> = {
  insomnia: {
    id: 'insomnia',
    name: '难以入睡',
    description: '入睡困难，需要长时间才能入睡',
    scriptKey: 'insomnia_intro',
    musicKey: 'relaxation_slow',
    additionalDuration: 300, // 额外5分钟
  },
  anxious: {
    id: 'anxious',
    name: '焦虑烦躁',
    description: '心烦意乱，容易紧张不安',
    scriptKey: 'anxious_intro',
    musicKey: 'calming_theta',
    additionalDuration: 600, // 额外10分钟
  },
  tired: {
    id: 'tired',
    name: '身心疲劳',
    description: '整天疲劳，无精打采',
    scriptKey: 'tired_intro',
    musicKey: 'deep_rest',
    additionalDuration: 0,
  },
  nightmare: {
    id: 'nightmare',
    name: '避免梦魇',
    description: '容易做噩梦，睡眠质量低',
    scriptKey: 'nightmare_intro',
    musicKey: 'peaceful_delta',
    additionalDuration: 600, // 额外10分钟
  },
  wakeability: {
    id: 'wakeability',
    name: '易醒易醒',
    description: '睡眠浅，容易被惊醒',
    scriptKey: 'wakeability_intro',
    musicKey: 'deep_protection',
  },
  stressRelief: {
    id: 'stress-relief',
    name: '释放压力',
    description: '工作压力大，需要放松',
    scriptKey: 'stress_relief_intro',
    musicKey: 'meditation_flow',
  },
};

export const SESSION_PRESETS = {
  standard: {
    name: '标准睡眠疗程',
    duration: 3600, // 60分钟
    stages: [
      { name: '感知与放松', duration: 300, targetFreq: 10, filterFreq: 800 },
      { name: '意识沉降', duration: 600, targetFreq: 6, filterFreq: 600 },
      { name: '呼吸同步', duration: 900, targetFreq: 3, filterFreq: 300 },
      { name: '深度睡眠', duration: 1800, targetFreq: 1.5, filterFreq: 150 },
    ],
  },
  quickWind: {
    name: '快速放松（15分钟）',
    duration: 900,
    stages: [
      { name: '放松阶段', duration: 300, targetFreq: 10, filterFreq: 800 },
      { name: '深化阶段', duration: 600, targetFreq: 6, filterFreq: 600 },
    ],
  },
  deepRest: {
    name: '深度休息（90分钟）',
    duration: 5400,
    stages: [
      { name: '感知与放松', duration: 600, targetFreq: 10, filterFreq: 800 },
      { name: '意识沉降', duration: 900, targetFreq: 6, filterFreq: 600 },
      { name: '呼吸同步', duration: 1800, targetFreq: 3, filterFreq: 300 },
      { name: '深度睡眠', duration: 2100, targetFreq: 1.5, filterFreq: 150 },
    ],
  },
};
