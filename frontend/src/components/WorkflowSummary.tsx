// src/components/WorkflowSummary.tsx
import React from "react";
import { Bot, Search, Stamp, FileText, CheckCircle, AlertCircle, ThumbsUp, ThumbsDown } from "lucide-react";

type Props = {
  filename?: string;
  pages?: number;
  risk?: "Low" | "Moderate" | "High";
  score?: number;
  analysisStatus?: "pending" | "complete" | "review";
  analysisMessage?: string;
  onApprove?: () => void;
  onReject?: () => void;
};

const WorkflowSummary: React.FC<Props> = ({
  filename = "Service Agreement.docx",
  pages = 12,
  risk = "Low",
  score = 95,
  analysisStatus = "complete",
  analysisMessage = "Contract verified - no security risks detected",
  onApprove,
  onReject,
}) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Row: Agent A -> Agent B -> Agent C */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Agent A */}
        <div className="p-4 rounded-2xl bg-white/6 border border-white/6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center mb-3">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="font-semibold text-white">Agent A</div>
          <div className="text-sm text-gray-300 mt-2">Document Intake</div>
          <div className="mt-3 flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2">
            <FileText className="w-4 h-4 text-green-300" />
            <div className="text-xs text-gray-200">{filename}</div>
          </div>
        </div>

        {/* Agent B */}
        <div className="p-4 rounded-2xl bg-white/6 border border-white/6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div className="font-semibold text-white">Agent B</div>
          <div className="text-sm text-gray-300 mt-2">Security Analysis</div>

          <div className="mt-3 text-center">
            {analysisStatus === "complete" ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="w-10 h-10 text-green-400" />
                <div className="font-medium text-green-300">Analysis Complete</div>
                <div className="text-sm text-gray-300">{analysisMessage}</div>
              </div>
            ) : analysisStatus === "review" ? (
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="w-10 h-10 text-yellow-400" />
                <div className="font-medium text-yellow-300">Review Required</div>
                <div className="text-sm text-gray-300">{analysisMessage}</div>
              </div>
            ) : (
              <div className="text-sm text-gray-300">Analyzing...</div>
            )}
          </div>
        </div>

        {/* Agent C */}
        <div className="p-4 rounded-2xl bg-white/6 border border-white/6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
            <Stamp className="w-6 h-6 text-white" />
          </div>
          <div className="font-semibold text-white">Agent C</div>
          <div className="text-sm text-gray-300 mt-2">Final Decision</div>

          <div className="mt-3 w-full text-left">
            <div className="p-3 rounded-lg bg-black/20 border border-white/6">
              <div className="text-sm text-gray-300 mb-2 font-medium">Contract Summary</div>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• {filename} ({pages} pages)</li>
                <li>• Risk Level: <span className="text-white font-medium">{risk}</span></li>
                <li>• Security Score: <span className="text-white font-medium">{score}/100</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-300">
          Decision required — choose an action to record in the audit trail.
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onReject}
            className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-semibold transition"
            aria-label="Reject contract"
          >
            <ThumbsDown className="w-4 h-4" />
            Reject
          </button>

          <button
            onClick={onApprove}
            className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-semibold transition"
            aria-label="Approve contract"
          >
            <ThumbsUp className="w-4 h-4" />
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowSummary;
