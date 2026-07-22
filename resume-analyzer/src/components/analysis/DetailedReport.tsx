"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-medium text-foreground">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

interface DetailedReportProps {
  report: string;
}

export function DetailedReport({ report }: DetailedReportProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Complete AI-generated analysis report
        </p>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent-muted text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy Report"}
        </button>
      </div>
      <div className="glass rounded-xl p-6">
        <div className="prose prose-invert prose-sm max-w-none">
          {report.split("\n").map((line, i) => {
            if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-bold mt-6 mb-3">{line.slice(2)}</h1>;
            if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-semibold mt-5 mb-2">{line.slice(3)}</h2>;
            if (line.startsWith("### ")) return <h3 key={i} className="text-base font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
            if (line.startsWith("- ")) return <li key={i} className="text-sm text-muted-foreground ml-4">{line.slice(2)}</li>;
            if (line.startsWith("**")) return <p key={i} className="text-sm font-medium mt-2">{renderInlineMarkdown(line.replace(/^\*\*/, ""))}</p>;
            if (line.trim() === "") return <div key={i} className="h-2" />;
            return <p key={i} className="text-sm text-muted-foreground">{renderInlineMarkdown(line)}</p>;
          })}
        </div>
      </div>
    </div>
  );
}
