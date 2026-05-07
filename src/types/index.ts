export type TaskState = 'queued' | 'active' | 'blocked' | 'done';
export type EnergyType = 'deep' | 'shallow' | 'admin' | 'creative';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  type: string;
  dueDate?: number; // timestamp
  nextAction: string;
  state: TaskState;
  energyType: EnergyType;
  pinned: boolean;
  startedAt?: number; // timestamp
  completedAt?: number; // timestamp
  timeTakenMinutes?: number;
  blockedReason?: string;
  reopenCount: number;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export interface AppState {
  tasks: Task[];
  shutdownNote: string;
  pinHash: string | null;
  breakEndTime: number | null;
  dailyBreakCount: number;
  lastBreakDate: string; // YYYY-MM-DD
}
