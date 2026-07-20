"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileText, X, CheckCircle2, Loader2 } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { useAppStore } from "@/lib/store/app-store";

export function UploadZone() {
  const file = useAppStore((s) => s.file);
  const uploadProgress = useAppStore((s) => s.uploadProgress);
  const isUploading = useAppStore((s) => s.isUploading);
  const setFile = useAppStore((s) => s.setFile);
  const clearFile = useAppStore((s) => s.clearFile);
  const setUploadProgress = useAppStore((s) => s.setUploadProgress);
  const setIsUploading = useAppStore((s) => s.setIsUploading);
  const setView = useAppStore((s) => s.setView);
  const setError = useAppStore((s) => s.setError);

  const [isDragging, setIsDragging] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFile = useCallback(
    async (selectedFile: File) => {
      const ext = selectedFile.name.toLowerCase().split(".").pop();
      if (ext !== "pdf" && ext !== "docx") {
        setError("Only PDF and DOCX files are supported.");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File too large. Maximum size is 10MB.");
        return;
      }

      setError(null);
      setIsUploading(true);
      setUploadProgress(0);

      if (intervalRef.current) clearInterval(intervalRef.current);

      let progress = 0;
      intervalRef.current = setInterval(() => {
        if (progress >= 90) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setUploadProgress(90);
          return;
        }
        progress += Math.random() * 15;
        setUploadProgress(Math.min(progress, 90));
      }, 200);

      try {
        await selectedFile.arrayBuffer();
        if (intervalRef.current) clearInterval(intervalRef.current);
        setUploadProgress(100);
        setFile(selectedFile, selectedFile.name);
      } catch {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setError("Failed to read file. Please try again.");
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [setFile, setIsUploading, setUploadProgress, setError]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) handleFile(selected);
    },
    [handleFile]
  );

  const handleAnalyze = () => {
    if (!file) return;
    setView("analyzing");
  };

  if (file) {
    return (
      <div className="w-full max-w-lg mx-auto space-y-6">
        <div className="glass rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-accent-muted flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
          <button
            onClick={clearFile}
            className="p-2 rounded-full hover:bg-[#BAABBD]/25 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm text-success">
          <CheckCircle2 className="w-4 h-4" />
          <span>Resume uploaded successfully</span>
        </div>

        <button
          onClick={handleAnalyze}
          className="w-full py-3.5 px-6 rounded-full bg-accent hover:bg-accent-hover text-white font-medium transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
        >
          Analyze Resume
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group",
          isDragging
            ? "border-accent bg-accent-muted scale-[1.02]"
            : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
        )}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,.docx"
          onChange={onInputChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 text-accent mx-auto animate-spin" />
            <div>
              <p className="text-sm font-medium mb-2">Uploading Resume...</p>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(uploadProgress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 font-mono">
                {Math.round(Math.min(uploadProgress, 100))}%
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto group-hover:bg-accent-muted transition-colors">
              <Upload className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">
                Drop your resume here, or{" "}
                <span className="text-accent">browse</span>
              </p>
              <p className="text-xs text-muted-foreground">
                PDF or DOCX, max 10MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
