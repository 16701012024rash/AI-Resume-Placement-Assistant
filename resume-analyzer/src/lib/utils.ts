import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-info";
  if (score >= 40) return "text-warning";
  return "text-danger";
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-success";
  if (score >= 60) return "bg-info";
  if (score >= 40) return "bg-warning";
  return "bg-danger";
}

export function getSeverityColor(severity: "pass" | "warn" | "fail"): string {
  switch (severity) {
    case "pass": return "text-success";
    case "warn": return "text-warning";
    case "fail": return "text-danger";
  }
}

export function getSeverityBg(severity: "pass" | "warn" | "fail"): string {
  switch (severity) {
    case "pass": return "bg-success-muted";
    case "warn": return "bg-warning-muted";
    case "fail": return "bg-danger-muted";
  }
}

export function getPriorityColor(priority: "high" | "medium" | "low"): string {
  switch (priority) {
    case "high": return "text-danger";
    case "medium": return "text-warning";
    case "low": return "text-info";
  }
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
