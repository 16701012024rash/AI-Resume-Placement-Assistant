import { create } from "zustand";
import type { AnalysisResult } from "@/lib/types/analysis";

export type AppView = "upload" | "analyzing" | "dashboard";

interface AppState {
  view: AppView;
  file: File | null;
  uploadProgress: number;
  isUploading: boolean;
  analysisStep: string;
  analysisProgress: number;
  analysisResult: AnalysisResult | null;
  error: string | null;

  setView: (view: AppView) => void;
  setFile: (file: File, _label: string) => void;
  clearFile: () => void;
  setUploadProgress: (progress: number) => void;
  setIsUploading: (v: boolean) => void;
  setAnalysisStep: (step: string) => void;
  setAnalysisProgress: (progress: number) => void;
  setAnalysisResult: (result: AnalysisResult) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: "upload",
  file: null,
  uploadProgress: 0,
  isUploading: false,
  analysisStep: "",
  analysisProgress: 0,
  analysisResult: null,
  error: null,

  setView: (view) => set({ view }),
  setFile: (file, _label) => set({ file, uploadProgress: 100, isUploading: false }),
  clearFile: () => set({ file: null, uploadProgress: 0, isUploading: false }),
  setUploadProgress: (uploadProgress) => set({ uploadProgress }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setAnalysisStep: (analysisStep) => set({ analysisStep }),
  setAnalysisProgress: (analysisProgress) => set({ analysisProgress }),
  setAnalysisResult: (analysisResult) => set({ analysisResult, view: "dashboard" }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      view: "upload",
      file: null,
      uploadProgress: 0,
      isUploading: false,
      analysisStep: "",
      analysisProgress: 0,
      analysisResult: null,
      error: null,
    }),
}));
