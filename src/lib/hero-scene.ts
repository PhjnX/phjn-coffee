"use client";

import { create } from "zustand";

/**
 * Which scene the home hero shows: the kraft-paper intro (with the full sidebar) or the video
 * banner (sidebar folded into the top bar). Shared so the navigation can react to it.
 */
type HeroScene = {
  scene: "intro" | "video";
  setScene: (scene: "intro" | "video") => void;
};

export const useHeroScene = create<HeroScene>((set) => ({
  scene: "intro",
  setScene: (scene) => set({ scene }),
}));
