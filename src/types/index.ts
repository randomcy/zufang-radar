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
  weights: AttributeWeight[];
  personalityTag: string;
  topAttributeId: string;
}
