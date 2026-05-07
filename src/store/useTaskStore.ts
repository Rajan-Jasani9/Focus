import { create } from 'zustand';
import type { Task, AppState, TaskState } from '../types';
import { loadData, saveData } from '../utils/storage';

interface TaskStore extends AppState {
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'reopenCount'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setShutdownNote: (note: string) => void;
  setPinHash: (hash: string | null) => void;
  markTaskDone: (id: string, timeTakenMinutes: number) => void;
  reopenTask: (id: string) => void;
  togglePin: (id: string) => void;
  startBreak: (minutes: number) => void;
  endBreak: () => void;
}

const initialState = loadData();

export const useTaskStore = create<TaskStore>((set, get) => {
    const sync = (partialState: Partial<AppState>) => {
    const currentState = get();
    saveData({
      tasks: currentState.tasks,
      shutdownNote: currentState.shutdownNote,
      pinHash: currentState.pinHash,
      breakEndTime: currentState.breakEndTime,
      dailyBreakCount: currentState.dailyBreakCount,
      lastBreakDate: currentState.lastBreakDate,
      ...partialState
    });
  };

  return {
    ...initialState,

    addTask: (taskData) => {
      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        reopenCount: 0,
      };
      const newTasks = [...get().tasks, newTask];
      set({ tasks: newTasks });
      sync({ tasks: newTasks });
    },

    updateTask: (id, updates) => {
      const newTasks = get().tasks.map((task) =>
        task.id === id ? { ...task, ...updates, updatedAt: Date.now() } : task
      );
      set({ tasks: newTasks });
      sync({ tasks: newTasks });
    },

    deleteTask: (id) => {
      const newTasks = get().tasks.filter((task) => task.id !== id);
      set({ tasks: newTasks });
      sync({ tasks: newTasks });
    },

    setShutdownNote: (note) => {
      set({ shutdownNote: note });
      sync({ shutdownNote: note });
    },

    setPinHash: (hash) => {
      set({ pinHash: hash });
      sync({ pinHash: hash });
    },

    markTaskDone: (id, timeTakenMinutes) => {
      const newTasks = get().tasks.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            state: 'done' as TaskState,
            timeTakenMinutes,
            completedAt: Date.now(),
            updatedAt: Date.now(),
          };
        }
        return task;
      });
      set({ tasks: newTasks });
      sync({ tasks: newTasks });
    },

    reopenTask: (id) => {
      const newTasks = get().tasks.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            state: 'queued' as TaskState,
            reopenCount: task.reopenCount + 1,
            completedAt: undefined,
            timeTakenMinutes: undefined,
            updatedAt: Date.now(),
          };
        }
        return task;
      });
      set({ tasks: newTasks });
      sync({ tasks: newTasks });
    },

    togglePin: (id) => {
      const newTasks = get().tasks.map((task) =>
        task.id === id ? { ...task, pinned: !task.pinned, updatedAt: Date.now() } : task
      );
      set({ tasks: newTasks });
      sync({ tasks: newTasks });
    },

    startBreak: (minutes) => {
      const today = new Date().toISOString().split('T')[0];
      const currentState = get();
      
      let newCount = currentState.dailyBreakCount;
      if (currentState.lastBreakDate !== today) {
        newCount = 1;
      } else {
        newCount += 1;
      }

      const endTime = Date.now() + minutes * 60000;
      const updates = { 
        breakEndTime: endTime, 
        dailyBreakCount: newCount, 
        lastBreakDate: today 
      };
      
      set(updates);
      sync(updates);
    },

    endBreak: () => {
      set({ breakEndTime: null });
      sync({ breakEndTime: null });
    }
  };
});
