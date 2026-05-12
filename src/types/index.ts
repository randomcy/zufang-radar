// ===== Apartment =====
export interface Apartment {
  id: string;
  title: string;
  communityId: string;
  price: number;
  roomType: string;
  area: number;
  floor: string;
  buildingType: string;
  decoration: string;
  subwayStation: string;
  subwayDistance: number; // 米
  commuteToSampleCompany: number; // 分钟
  tags: string[];
  coordinates: { lng: number; lat: number };
  images: string[];
  description: string;
}

// ===== Community =====
export interface CommunitySubScores {
  noise: number;
  soundproof: number;
  property: number;
  safety: number;
  amenity: number;
  valueForMoney: number;
}

export interface ProsCons {
  title: string;
  summary: string;
  evidenceCount: number;
  evidence?: string[];
}

export interface Community {
  id: string;
  name: string;
  district: string;
  area: string;
  coordinates: { lng: number; lat: number };
  buildYear: number;
  buildingType: string;
  totalRating: number;
  subscores: CommunitySubScores;
  pros: ProsCons[];
  cons: ProsCons[];
  suitableFor: string[];
  notSuitableFor: string[];
  postIds: string[];
}

// ===== Post =====
export interface Post {
  id: string;
  communityId: string;
  author: string;
  authorAvatar: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  tags: string[];
  publishDate: string;
}

// ===== Conjoint =====
export interface AttributeLevel {
  id: string;
  value: string;
  numericValue?: number;
}

export interface ConjointAttribute {
  id: string;
  name: string;
  icon: string;
  levels: AttributeLevel[];
}

export interface BinaryFilter {
  id: string;
  label: string;
  icon: string;
}

export interface ConjointConfig {
  attributes: ConjointAttribute[];
  binaryFilters: BinaryFilter[];
}

// ===== Quiz =====
export interface QuizOption {
  levels: Record<string, AttributeLevel>; // attributeId -> level
}

export interface QuizQuestion {
  id: number;
  optionA: QuizOption;
  optionB: QuizOption;
}

export interface QuizAnswer {
  questionId: number;
  chosen: "A" | "B";
  optionA: QuizOption;
  optionB: QuizOption;
}

// ===== Preference Result =====
export interface AttributeWeight {
  attributeId: string;
  name: string;
  icon: string;
  weight: number; // 0-1
}

export interface PreferenceResult {
  /** 按 config.attributes 原顺序的权重（用于雷达图轴顺序稳定）*/
  weights: AttributeWeight[];
  /** 按权重从大到小排序后的权重列表 */
  sortedWeights: AttributeWeight[];
  /** 主人格标签 */
  personalityTag: string;
  /** 副标签（top-2 in 意 + 可妥协）*/
  subTags: string[];
  /** 自动生成的解读文案 */
  description: string;
  topAttributeId: string;
  topAttributeName: string;
  bottomAttributeId: string;
  bottomAttributeName: string;
  /** levelId -> utility，调试用 */
  utilities: Record<string, number>;
  /** 用户的硬筛选偏好（yes/no），可选 */
  binaryPreferences?: Record<string, boolean>;
}
