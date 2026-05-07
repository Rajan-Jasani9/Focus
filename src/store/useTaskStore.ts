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
}

const initialState = loadData();

export const useTaskStore = create<TaskStore>((set, get) => ({
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
    saveData({ tasks: newTasks, shutdownNote: get().shutdownNote, pinHash: get().pinHash });
  },

  updateTask: (id, updates) => {
    const newTasks = get().tasks.map((task) =>
      task.id === id ? { ...task, ...updates, updatedAt: Date.now() } : task
    );
    set({ tasks: newTasks });
    saveData({ tasks: newTasks, shutdownNote: get().shutdownNote, pinHash: get().pinHash });
  },

  deleteTask: (id) => {
    const newTasks = get().tasks.filter((task) => task.id !== id);
    set({ tasks: newTasks });
    saveData({ tasks: newTasks, shutdownNote: get().shutdownNote, pinHash: get().pinHash });
  },

  setShutdownNote: (note) => {
    set({ shutdownNote: note });
    saveData({ tasks: get().tasks, shutdownNote: note, pinHash: get().pinHash });
  },

  setPinHash: (hash) => {
    set({ pinHash: hash });
    saveData({ tasks: get().tasks, shutdownNote: get().shutdownNote, pinHash: hash });
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
    saveData({ tasks: newTasks, shutdownNote: get().shutdownNote, pinHash: get().pinHash });
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
    saveData({ tasks: newTasks, shutdownNote: get().shutdownNote, pinHash: get().pinHash });
  },

  togglePin: (id) => {
    const newTasks = get().tasks.map((task) =>
      task.id === id ? { ...task, pinned: !task.pinned, updatedAt: Date.now() } : task
    );
    set({ tasks: newTasks });
    saveData({ tasks: newTasks, shutdownNote: get().shutdownNote, pinHash: get().pinHash });
  },
}));
