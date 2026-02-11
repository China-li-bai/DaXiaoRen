export type Language = 'en' | 'zh';

export enum VillainType {
  BOSS = 'BOSS',
  EX_PARTNER = 'EX_PARTNER',
  FAKE_FRIEND = 'FAKE_FRIEND',
  BAD_HABIT = 'BAD_HABIT',
  GENERAL_ANXIETY = 'GENERAL_ANXIETY'
}

export interface VillainData {
  name: string;
  type: VillainType;
  reason: string;
  imageUrl?: string; // Data URL for the uploaded avatar
}

export interface VillainRecord extends VillainData {
  id: string;
  timestamp: number;
  chant?: ChantResponse;
}

export enum AppStep {
  ONBOARDING = 'ONBOARDING', // New step for bazi diagnosis
  INTRO = 'INTRO',
  PAYMENT = 'PAYMENT',
  INPUT = 'INPUT',
  PREPARING = 'PREPARING',
  RITUAL = 'RITUAL',
  RESOLVING = 'RESOLVING',
  CONCLUSION = 'CONCLUSION',
  PROFILE = 'PROFILE', // User profile page
  PRIVACY_SETTINGS = 'PRIVACY_SETTINGS', // Privacy settings page
  PRIVACY_POLICY = 'PRIVACY_POLICY' // Privacy policy page
}

export interface ChantResponse {
  chantLines: string[];
  ritualInstruction: string;
}

export interface ResolutionResponse {
  blessing: string;
  advice: string;
}

export interface IdentifyResponse {
  name: string;
  titleOrRole: string;
  reason: string;
}

export type PaymentRegion = 'CHINA' | 'GLOBAL';

export interface AssistSession {
  id: string;
  hostName: string;
  villain: VillainData;
  chant: ChantResponse;
  createdAt: number;
  helpers: string[];
}

export interface ShareConfig {
  title: string;
  description: string;
  url: string;
}

export type AssistMode = 'HOST' | 'HELPER' | null;
