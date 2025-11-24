
export enum TaskQuadrant {
  DO = 'DO', // Q1
  SCHEDULE = 'SCHEDULE', // Q2
  DELEGATE = 'DELEGATE', // Q3
  DELETE = 'DELETE', // Q4
}

export interface Subtask {
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  quadrant: TaskQuadrant;
  isFrog: boolean; // "Eat the Frog"
  createdAt: number;
  purpose?: string; // The "Why" / Niyyah connection
  subtasks?: Subtask[]; // For "Swiss Cheese" method
  tags?: string[]; // Organization tags
  blocks: number; // Gamification value
  duration?: number; // Duration in minutes (30 or 60), default 60
}

export interface DailyQuests {
  work: { title: string; completed: boolean };
  health: { title: string; completed: boolean };
  relationship: { title: string; completed: boolean };
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  nextReview: number; // Timestamp
  interval: number; // Days
}

export type BlockCategory = 'DEEP' | 'SHALLOW' | 'HEALTH' | 'LIFE' | 'REST';

export interface TimeBlock {
  category: BlockCategory;
  label: string;
  taskId?: string; // Link to a specific task
  duration?: number; // Duration in minutes (30 or 60)
}

export interface WeeklySchedule {
  current: Record<string, TimeBlock>; // Key format: "Day-Hour" e.g., "Mon-9" or "Mon-9-30"
  ideal: Record<string, TimeBlock>;
}

export interface RewardItem {
  id: string;
  title: string;
  cost: number;
  icon: string;
  description?: string;
  isDefault?: boolean;
}

export interface Settings {
  language: 'en' | 'es' | 'fr' | 'de' | 'jp' | 'ky';
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'sepia';
  reducedMotion: boolean;
}

export interface AppState {
  userName: string;
  theThing: string;
  celebrationVision: string; // 12-month vision
  currentNiyyah: string; // Intention
  blockBalance: number; // Gamification Currency
  tasks: Task[];
  dailyQuests: DailyQuests;
  flashcards: Flashcard[];
  reflections: { date: string; content: string }[];
  weeklySchedule: WeeklySchedule;
  shopItems: RewardItem[]; // Replaces customRewards, contains ALL items
  settings: Settings;
}

export const INITIAL_STATE: AppState = {
  userName: 'Traveler',
  theThing: '',
  celebrationVision: '',
  currentNiyyah: '',
  blockBalance: 0,
  tasks: [
    {
      id: 'init-task-1',
      title: 'Create initial component structure',
      completed: false,
      quadrant: TaskQuadrant.DO,
      isFrog: false,
      createdAt: Date.now(),
      purpose: 'To build a solid foundation for the project.',
      tags: ['dev', 'setup'],
      blocks: 1,
      duration: 60,
      subtasks: [
        { title: 'Define component props', completed: false },
        { title: 'Set up basic JSX layout', completed: false }
      ]
    }
  ],
  dailyQuests: {
    work: { title: '', completed: false },
    health: { title: '', completed: false },
    relationship: { title: '', completed: false },
  },
  flashcards: [],
  reflections: [],
  weeklySchedule: { current: {}, ideal: {} },
  shopItems: [], // Will be populated with defaults on first load if empty
  settings: {
    language: 'en',
    soundEnabled: true,
    theme: 'light',
    reducedMotion: false,
  }
};
