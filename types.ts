
/**
 * Defines the four quadrants of the Eisenhower Matrix used for task prioritization.
 */
export enum TaskQuadrant {
  /** Urgent and Important: Do immediately. (Quadrant 1) */
  DO = 'DO',
  /** Not Urgent but Important: Schedule for later. (Quadrant 2) */
  SCHEDULE = 'SCHEDULE',
  /** Urgent but Not Important: Delegate or minimize. (Quadrant 3) */
  DELEGATE = 'DELEGATE',
  /** Not Urgent and Not Important: Eliminate. (Quadrant 4) */
  DELETE = 'DELETE',
}

/**
 * Represents a smaller, actionable step within a larger task.
 */
export interface Subtask {
  /** The description of the subtask step. */
  title: string;
  /** Whether this specific step has been completed. */
  completed: boolean;
}

/**
 * Represents a main task item within the system.
 */
export interface Task {
  /** Unique identifier for the task (UUID). */
  id: string;
  /** The name or description of the task. */
  title: string;
  /** Completion status of the task. */
  completed: boolean;
  /** The quadrant of the Eisenhower Matrix this task belongs to. */
  quadrant: TaskQuadrant;
  /** Indicates if this task is a "Frog" (high priority/difficult task to do first). */
  isFrog: boolean;
  /** Timestamp of task creation (milliseconds since epoch). */
  createdAt: number;
  /** The underlying intention or reason for this task (Niyyah). */
  purpose?: string;
  /** List of sub-steps (Swiss Cheese method). */
  subtasks?: Subtask[];
  /** Array of tags for organization and filtering. */
  tags?: string[];
  /** Gamification reward value (number of blocks earned upon completion). */
  blocks: number;
  /** Estimated duration in minutes (typically 30 or 60). */
  duration?: number;
  /** Due date timestamp (milliseconds since epoch). */
  deadline?: number;
  /** Optional daily reminder time (HH:mm format). */
  reminderTime?: string;
}

/**
 * Tracks the status of daily recurring protocols or habits.
 */
export interface DailyQuests {
  /** Quest related to professional or productive output. */
  work: { title: string; completed: boolean };
  /** Quest related to physical or mental health. */
  health: { title: string; completed: boolean };
  /** Quest related to social connection or family. */
  relationship: { title: string; completed: boolean };
}

/**
 * Represents a flashcard for Active Recall study.
 */
export interface Flashcard {
  /** Unique identifier for the flashcard. */
  id: string;
  /** The question or prompt on the front of the card. */
  question: string;
  /** The answer or explanation on the back of the card. */
  answer: string;
  /** Timestamp for when the card should be reviewed next (spaced repetition). */
  nextReview: number;
  /** Current spaced repetition interval in days. */
  interval: number;
}

/**
 * Categories for time blocking to ensure balanced energy allocation.
 */
export type BlockCategory = 'DEEP' | 'SHALLOW' | 'HEALTH' | 'LIFE' | 'REST';

/**
 * Represents a specific unit of time allocated in the schedule.
 */
export interface TimeBlock {
  /** The category of activity for this block. */
  category: BlockCategory;
  /** A descriptive label for the activity. */
  label: string;
  /** Optional ID of the task linked to this time block. */
  taskId?: string;
  /** Duration of the block in minutes. */
  duration?: number;
}

/**
 * Holds the schedule data for both the ideal week (template) and the actual current week.
 * Keys are formatted as "Day-Hour" (e.g., "Mon-9").
 */
export interface WeeklySchedule {
  /** The actual log of how time was spent this week. */
  current: Record<string, TimeBlock>;
  /** The template for an ideal week. */
  ideal: Record<string, TimeBlock>;
}

/**
 * Represents an item available for purchase in the reward shop.
 */
export interface RewardItem {
  /** Unique identifier for the reward. */
  id: string;
  /** The title or name of the reward. */
  title: string;
  /** Cost to redeem in blocks. */
  cost: number;
  /** Icon identifier string (from Lucide icons). */
  icon: string;
  /** Optional description of the reward. */
  description?: string;
  /** Indicates if this is a default system reward. */
  isDefault?: boolean;
}

/**
 * User configuration settings for the application.
 */
export interface Settings {
  /** The selected language code. */
  language: 'en' | 'es' | 'fr' | 'de' | 'jp' | 'ky';
  /** Whether sound effects are enabled. */
  soundEnabled: boolean;
  /** Visual theme preference. */
  theme: 'light' | 'dark' | 'sepia';
  /** Whether to reduce animations for accessibility. */
  reducedMotion: boolean;
  /** Whether browser notifications are enabled. */
  notificationsEnabled: boolean;
  /** Time for daily intention check (HH:mm). */
  dailyReminderTime?: string;
  /** The user's subscription tier. */
  subscriptionTier: 'free' | 'pro';
}

/**
 * The root state interface for the entire application.
 */
export interface AppState {
  /** The user's display name. */
  userName: string;
  /** The single most important objective (The One Thing). */
  theThing: string;
  /** Long-term vision statement (12-month horizon). */
  celebrationVision: string;
  /** Current daily intention (Niyyah). */
  currentNiyyah: string;
  /** Currency balance for the reward shop. */
  blockBalance: number;
  /** List of all tasks. */
  tasks: Task[];
  /** State of daily quests/habits. */
  dailyQuests: DailyQuests;
  /** Collection of flashcards. */
  flashcards: Flashcard[];
  /** Archive of past weekly reviews/reflections. */
  reflections: { date: string; content: string }[];
  /** Schedule data structure. */
  weeklySchedule: WeeklySchedule;
  /** Items available in the reward shop. */
  shopItems: RewardItem[];
  /** User settings. */
  settings: Settings;
}

/**
 * Default initial state for the application used on first load or reset.
 */
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
  shopItems: [], 
  settings: {
    language: 'en',
    soundEnabled: true,
    theme: 'light',
    reducedMotion: false,
    notificationsEnabled: false,
    dailyReminderTime: '09:00',
    subscriptionTier: 'pro',
  }
};
