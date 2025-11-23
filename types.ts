
export enum TaskQuadrant {
  DO = 'DO', // Q1
  SCHEDULE = 'SCHEDULE', // Q2
  DELEGATE = 'DELEGATE', // Q3
  DELETE = 'DELETE', // Q4
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  quadrant: TaskQuadrant;
  isFrog: boolean; // "Eat the Frog"
  createdAt: number;
  subtasks?: string[]; // For "Swiss Cheese" method
}

export interface Goal {
  id: string;
  title: string;
  isActive: boolean; // True = Active Portfolio, False = Backlog
  progress: number;
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
}

export interface WeeklySchedule {
  current: Record<string, TimeBlock>; // Key format: "Day-Hour" e.g., "Mon-9"
  ideal: Record<string, TimeBlock>;
}

export interface AppState {
  userName: string;
  theThing: string;
  celebrationVision: string; // 12-month vision
  currentNiyyah: string; // Intention
  tasks: Task[];
  goals: Goal[];
  dailyQuests: DailyQuests;
  flashcards: Flashcard[];
  reflections: { date: string; content: string }[];
  weeklySchedule: WeeklySchedule;
}

export const INITIAL_STATE: AppState = {
  userName: 'Traveler',
  theThing: '',
  celebrationVision: '',
  currentNiyyah: '',
  tasks: [],
  goals: [],
  dailyQuests: {
    work: { title: '', completed: false },
    health: { title: '', completed: false },
    relationship: { title: '', completed: false },
  },
  flashcards: [],
  reflections: [],
  weeklySchedule: { current: {}, ideal: {} },
};
