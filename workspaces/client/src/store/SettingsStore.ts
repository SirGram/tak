
import { create } from "zustand";

interface Settings {
    lightTheme: boolean;
    updateTheme: (value: boolean) => void;
}

const getInitialTheme = () => {
    const savedTheme = localStorage.getItem("lightTheme");
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    } else {
      return window.matchMedia("(prefers-color-scheme: light)").matches;
    }
  };

export const useSettingsStore = create<Settings>()((set) => ({
    lightTheme: getInitialTheme(),
    updateTheme: (value: boolean) => {
      set({ lightTheme: value });
      localStorage.setItem("lightTheme", JSON.stringify(value));
    },
  }));