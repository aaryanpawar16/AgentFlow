// src/pages/WorkflowPage.tsx
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Bot,
  Search,
  Stamp,
  Zap,
} from "lucide-react";

type Analysis = {
  filename: string;
  pages: number | null;
  risk: "Low" | "Moderate" | "High";
  score: number;
  status: "complete" | "needs_review";
  message: string;
};

const DEMO_TOKEN = "demo-token";

async function analyzeFileDeterministic(file: File): Promise<Analysis> {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  const bytes = new Uint8Array(digest);

  const a = bytes[0];
  const b = bytes[1];
  const c = bytes[2];
  const d = bytes[3];

  const score = 55 + (a % 44); // 55-98
  const riskIndex = (a + b + c) % 100;
  const risk: Analysis["risk"] = riskIndex < 35 ? "Low" : riskIndex < 75 ? "Moderate" : "High";
  const status: Analysis["status"] = d % 3 === 0 ? "needs_review" : "complete";
  const pages = Math.max(1, Math.min(40, Math.round(file.size / (35 * 1024))));

  const messages = {
    Low: "Contract verified — no material risks detected.",
    Moderate: "Some clauses may need human review (payment/termination/liability).",
    High: "High-risk clauses detected. Legal review strongly recommended.",
  } as const;

  return {
    filename: file.name,
    pages,
    risk,
    score,
    status,
    message: messages[risk],
  };
}

async function analyzeFileHeuristic(file: File): Promise<Analysis> {
  const filename = file.name.toLowerCase();
  const pages = Math.max(1, Math.min(200, Math.round(file.size / (35 * 1024))));
  let text = "";
  try {
    text = await new Response(file).text();
  } catch {
    text = "";
  }
  const lower = text.toLowerCase();
  const riskyTerms = [
    "increase fees",
    "may increase fees",
    "no termination",
    "client may not terminate",
    "10 year",
    "not liable",
    "no liability",
    "no damages",
    "gross negligence",
    "willful misconduct",
    "indemnify",
    "indemnification",
    "5% per week",
    "compound",
    "exclusive jurisdiction",
    "solely by provider",
    "exclusive property of provider",
    "no right to use",
  ];

  let hits = 0;
  if (lower.length > 40) {
    for (const t of riskyTerms) if (lower.includes(t)) hits++;
  }
  if (hits === 0 && filename.includes("high") && filename.includes("risk")) hits = Math.max(hits, 2);

  if (hits >= 2) {
    const score = Math.max(5, 40 - hits * 3);
    return {
      filename: file.name,
      pages,
      risk: "High",
      score,
      status: "needs_review",
      message: "High-risk clauses detected (heuristic). Legal review recommended.",
    };
  } else if (hits === 1) {
    const score = Math.max(36, 60 - hits * 3);
    return {
      filename: file.name,
      pages,
      risk: "Moderate",
      score,
      status: "needs_review",
      message: "Potentially risky clause found — human review recommended.",
    };
  } else {
    return analyzeFileDeterministic(file);
  }
}

async function postWorkflowToServer(payload: { id: string; user: string; result: string; ts: string }) {
  try {
    await fetch("/api/workflows", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEMO_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn("Failed to POST workflow to server:", err);
  }
}

const WorkflowPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [verificationResult, setVerificationResult] = useState<"pending" | "success" | "warning" | null>(null);
  const [approvalDecision, setApprovalDecision] = useState<"approved" | "rejected" | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // NEW: workflow log lines
  const [logLines, setLogLines] = useState<string[]>([]);

  const stepsRef = useRef<HTMLDivElement | null>(null);
  const uploadRef = useRef<HTMLDivElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const approvalRef = useRef<HTMLDivElement | null>(null);
  const connectorsRef = useRef<HTMLDivElement | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);

  // helper to push timestamped log (prepends newest at top)
  const pushLog = (msg: string) => {
    const now = new Date();
    const ts = now.toISOString().replace("T", " ").split(".")[0];
    const line = `[${ts}] - ${msg}`;
    setLogLines((prev) => [line, ...prev].slice(0, 200)); // keep last 200 lines
  };

  useEffect(() => {
    // initial welcome line
    pushLog("Workflow page opened.");
    // animations
    gsap.fromTo(
      ".workflow-step",
      { x: 100, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out" }
    );
    gsap.to(".agent-avatar", {
      y: -10,
      duration: 2,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
      stagger: 0.5,
    });
    gsap.fromTo(
      ".connector-line",
      { strokeDashoffset: 100 },
      { strokeDashoffset: 0, duration: 2, ease: "power2.inOut", repeat: -1, yoyo: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentStep === 2) {
      gsap.fromTo(".data-packet-1", { x: 0, opacity: 1 }, { x: 400, opacity: 0, duration: 1.5, ease: "power2.inOut" });
      gsap.fromTo(resultRef.current, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)", delay: 0.5 });
    } else if (currentStep === 3) {
      gsap.fromTo(".data-packet-2", { x: 0, opacity: 1 }, { x: 400, opacity: 0, duration: 1.5, ease: "power2.inOut" });
      gsap.fromTo(approvalRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.5 });
    }
  }, [currentStep]);

  // Upload handler
  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setApprovalDecision(null);
    setVerificationResult(null);
    setAnalysis(null);

    // log initial
    pushLog(`Workflow initiated by user. (file: ${file.name})`);

    gsap.to(".agent-a", {
      scale: 1.2,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut",
      onComplete: async () => {
        setCurrentStep(2);
        pushLog("Agent A passed task to Agent B (Token Scope: contract.read).");

        const a = await analyzeFileHeuristic(file);

        // Decide user-facing result
        let vr: "success" | "warning" = "success";
        let userMessage = a.message;

        if (a.status === "needs_review") {
          vr = "warning";
          if (a.risk === "Low") userMessage = "Automated checks passed but manual review recommended.";
          else if (a.risk === "Moderate") userMessage = "Some clauses require human review (payment/termination).";
          else userMessage = "High-risk clauses detected — manual legal review required.";
        } else {
          if (a.risk === "High") {
            vr = "warning";
            userMessage = "Automated scan completed: high-risk items found. Manual review recommended.";
          } else {
            vr = "success";
            userMessage = a.message;
          }
        }

        const annotated = { ...a, message: userMessage };

        // small UX delay
        setTimeout(async () => {
          setVerificationResult(vr === "success" ? "success" : "warning");
          setAnalysis(annotated);
          setCurrentStep(3);

          // log Agent B result
          pushLog(`Agent B completed analysis (Result: ${annotated.risk}-Risk, Score: ${annotated.score}).`);
          pushLog("Agent B passed task to Agent C (Token Scope: contract.audit).");

          // create workflow record and POST to server so Dashboard picks it up
          const workflow = {
            id: `wf_${Math.random().toString(36).slice(2, 7)}`,
            user: "demo-user",
            result: vr === "success" ? "success" : "consent_required",
            ts: new Date().toISOString(),
          };

          await postWorkflowToServer(workflow);

          pushLog(`Workflow recorded: id=${workflow.id}, result=${workflow.result}`);
        }, 900);
      },
    });
  };

  // DnD handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  // Approval / rejection
  const handleApproval = (approved: boolean) => {
    if (analysis?.risk === "High" && approved) {
      setApprovalDecision(null);
      setTimeout(() => alert("Approval blocked: high-risk contract requires manual legal review."), 50);
      pushLog("User attempted to approve high-risk contract — blocked.");
      return;
    }

    setApprovalDecision(approved ? "approved" : "rejected");

    if (approved) pushLog("Final Decision: APPROVED by user.");
    else pushLog("Final Decision: REJECTED by user.");

    // pretend to persist audit record & log
    setTimeout(() => {
      pushLog("Audit record secured.");
    }, 300);

    gsap.to(".agent-c", { scale: 1.3, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.inOut" });
    gsap.to(".approval-stamp", {
      scale: 1,
      rotation: approved ? 0 : 15,
      opacity: 1,
      duration: 0.8,
      ease: "back.out(1.7)",
      delay: 0.3,
    });
  };

  // Small helper to expose analyzeFileHeuristic inside this file
  async function analyzeFileHeuristic(file: File): Promise<Analysis> {
    return analyzeFileHeuristicFallback(file); // defined below
  }

  // because of function hoisting differences, put the real heuristic implementation here:
  async function analyzeFileHeuristicFallback(file: File): Promise<Analysis> {
    // duplicate of earlier heuristic implementation to keep one file self-contained
    const filename = file.name.toLowerCase();
    const pages = Math.max(1, Math.min(200, Math.round(file.size / (35 * 1024))));
    let text = "";
    try {
      text = await new Response(file).text();
    } catch {
      text = "";
    }
    const lower = text.toLowerCase();
    const riskyTerms = [
      "increase fees",
      "may increase fees",
      "no termination",
      "client may not terminate",
      "10 year",
      "not liable",
      "no liability",
      "no damages",
      "gross negligence",
      "willful misconduct",
      "indemnify",
      "indemnification",
      "5% per week",
      "compound",
      "exclusive jurisdiction",
      "solely by provider",
      "exclusive property of provider",
      "no right to use",
    ];

    let hits = 0;
    if (lower.length > 40) {
      for (const t of riskyTerms) if (lower.includes(t)) hits++;
    }
    if (hits === 0 && filename.includes("high") && filename.includes("risk")) hits = Math.max(hits, 2);

    if (hits >= 2) {
      const score = Math.max(5, 40 - hits * 3);
      return {
        filename: file.name,
        pages,
        risk: "High",
        score,
        status: "needs_review",
        message: "High-risk clauses detected (heuristic). Legal review recommended.",
      };
    } else if (hits === 1) {
      const score = Math.max(36, 60 - hits * 3);
      return {
        filename: file.name,
        pages,
        risk: "Moderate",
        score,
        status: "needs_review",
        message: "Potentially risky clause found — human review recommended.",
      };
    } else {
      return analyzeFileDeterministic(file);
    }
  }

  return (
    <div className="page-transition min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8">
        {/* MAIN: Agents area */}
        <div>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white">Agent Collaboration Demo</h1>
            <p className="text-gray-300 mt-2">Drop a contract to see agents analyze and route it — logs update in realtime.</p>
          </div>

          <div className="relative mb-8">
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" ref={connectorsRef}>
              <defs>
                <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <path className="connector-line" d="M 300 200 Q 450 150 600 200" stroke="url(#flowGradient)" strokeWidth="3" fill="none" strokeDasharray="20 10" opacity="0.6" />
              <path className="connector-line" d="M 900 200 Q 1050 150 1200 200" stroke="url(#flowGradient)" strokeWidth="3" fill="none" strokeDasharray="20 10" opacity="0.6" />
            </svg>

            {currentStep >= 2 && <div className="data-packet-1 absolute top-48 left-20 w-6 h-6 bg-cyan-400 rounded-full shadow-lg shadow-cyan-500/50 animate-pulse z-10" />}
            {currentStep >= 3 && <div className="data-packet-2 absolute top-48 left-[36rem] w-6 h-6 bg-purple-400 rounded-full shadow-lg shadow-purple-500/50 animate-pulse z-10" />}

            <div ref={stepsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
              {/* Agent A */}
              <div className="workflow-step">
                <div className={`p-6 rounded-2xl backdrop-blur border ${currentStep >= 1 ? "bg-cyan-500/8 border-cyan-400/30" : "bg-white/5 border-white/10"}`}>
                  <div className="flex flex-col items-center justify-center mb-4">
                    <div className="agent-avatar agent-a relative w-14 h-14 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
                      <Bot className="h-6 w-6 text-white" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                    </div>
                    <span className="mt-2 text-sm text-gray-300">Agent A</span>
                  </div>

                  <h3 className="text-xl font-bold text-white text-center mb-4">Document Intake</h3>

                  {currentStep === 1 && (
                    <div ref={uploadRef} className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer relative overflow-hidden ${isDragging ? "border-cyan-400 bg-cyan-500/12" : "border-gray-600 hover:border-cyan-500 hover:bg-cyan-500/6"}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => document.getElementById("file-input")?.click()}>
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-300 mb-1">Drop contract here</p>
                      <p className="text-gray-500 text-sm">Agent A will receive it</p>
                      <input id="file-input" type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} accept=".pdf,.doc,.docx,.txt" />
                      {isDragging && <div className="absolute inset-0 bg-cyan-400/12 rounded-2xl flex items-center justify-center"><Zap className="h-10 w-10 text-cyan-400 animate-pulse" /></div>}
                    </div>
                  )}

                  {uploadedFile && currentStep > 1 && (
                    <div className="flex items-center space-x-3 p-3 rounded-xl bg-green-500/12 border border-green-400/20">
                      <FileText className="h-5 w-5 text-green-400" />
                      <span className="text-green-200 text-sm">{uploadedFile.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Agent B */}
              <div className="workflow-step">
                <div className={`p-6 rounded-2xl backdrop-blur border ${currentStep >= 2 ? "bg-purple-500/8 border-purple-400/30" : "bg-white/5 border-white/10"}`}>
                  <div className="flex flex-col items-center justify-center mb-4">
                    <div className="agent-avatar agent-b relative w-14 h-14 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
                      <Search className="h-6 w-6 text-white" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping" />
                    </div>
                    <span className="mt-2 text-sm text-gray-300">Agent B</span>
                  </div>

                  <h3 className="text-xl font-bold text-white text-center mb-4">Security Analysis</h3>

                  {currentStep === 2 && verificationResult === null && (
                    <div className="text-center py-6">
                      <div className="relative">
                        <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3" />
                        <div className="absolute inset-0 flex items-center justify-center"><div className="w-5 h-5 bg-purple-400 rounded-full animate-pulse" /></div>
                      </div>
                      <p className="text-gray-300 text-sm">Agent B analyzing contract...</p>
                    </div>
                  )}

                  {verificationResult && analysis && (
                    <div ref={resultRef} className="text-center py-4">
                      {verificationResult === "success" ? (
                        <div className="space-y-2">
                          <div className="relative">
                            <CheckCircle className="h-12 w-12 text-green-400 mx-auto" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-green-400">Analysis Complete</h4>
                            <p className="text-gray-300 text-sm">{analysis.message} (Risk: {analysis.risk}, Score: {analysis.score}/100)</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="relative">
                            <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-yellow-400">Review Required</h4>
                            <p className="text-gray-300 text-sm">{analysis.message} (Risk: {analysis.risk}, Score: {analysis.score}/100)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Agent C */}
              <div className="workflow-step">
                <div className={`p-6 rounded-2xl backdrop-blur border ${currentStep >= 3 ? "bg-teal-500/8 border-teal-400/30" : "bg-white/5 border-white/10"}`}>
                  <div className="flex flex-col items-center justify-center mb-4">
                    <div className="agent-avatar agent-c relative w-14 h-14 rounded-full bg-gradient-to-r from-teal-400 to-green-500 flex items-center justify-center shadow-lg">
                      <Stamp className="h-6 w-6 text-white" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                    </div>
                    <span className="mt-2 text-sm text-gray-300">Agent C</span>
                  </div>

                  <h3 className="text-xl font-bold text-white text-center mb-4">Final Decision</h3>

                  {currentStep === 3 && !approvalDecision && (
                    <div ref={approvalRef} className="space-y-3">
                      <div className="p-3 rounded-2xl bg-black/30 border border-gray-700/40">
                        <h4 className="text-sm font-semibold text-white mb-1">Contract Summary</h4>
                        <div className="space-y-1 text-xs text-gray-300">
                          <p>• {analysis?.filename || "—"}</p>
                          <p>• Pages: {analysis?.pages ?? "—"}</p>
                          <p>• Risk Level: <span className={analysis?.risk === "High" ? "text-red-400" : analysis?.risk === "Moderate" ? "text-yellow-300" : "text-green-300"}>{analysis?.risk ?? "—"}</span></p>
                          <p>• Security Score: {analysis?.score ?? "—"}/100</p>
                          <p>• Status: {analysis?.status === "complete" ? "Complete" : "Needs Review"}</p>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button className="flex-1 py-3 rounded-2xl bg-green-500 text-white font-semibold" onClick={() => handleApproval(true)} disabled={analysis?.risk === "High"} title={analysis?.risk === "High" ? "Approval disabled for High risk contracts" : undefined}><ThumbsUp className="inline-block mr-2" />Approve</button>
                        <button className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold" onClick={() => handleApproval(false)}><ThumbsDown className="inline-block mr-2" />Reject</button>
                      </div>
                    </div>
                  )}

                  {approvalDecision && (
                    <div className="text-center py-4">
                      <div className={`approval-stamp scale-0 opacity-0 w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-bold ${approvalDecision === "approved" ? "bg-green-500/20 text-green-400 border-4 border-green-400" : "bg-red-500/20 text-red-400 border-4 border-red-400"}`}>{approvalDecision === "approved" ? "✓" : "✗"}</div>
                      <p className={`mt-3 font-semibold ${approvalDecision === "approved" ? "text-green-400" : "text-red-400"}`}>{approvalDecision === "approved" ? "Contract Approved" : "Contract Rejected"}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* small status/footer */}
          <div className="mt-4 text-sm text-gray-400">
            Agent A · Agent B · Agent C — live demo
          </div>
        </div>

        {/* WORKFLOW ACTIVITY: moved below main area */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Workflow Activity</h3>
          <div ref={logRef} className="h-[48vh] overflow-auto bg-[#071220] border border-gray-800 rounded-lg p-4 text-sm font-mono text-[#d6e8ff]">
            {logLines.length === 0 ? (
              <div className="text-gray-400">No events yet.</div>
            ) : (
              logLines.map((l, i) => (
                <div key={i} className="mb-2 leading-5">
                  <span className="text-gray-300">{l}</span>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-black/20 border border-gray-700">
            <div className="text-xs text-gray-300 mb-2">Quick actions (for testing)</div>
            <div className="flex gap-2">
              <button
                className="px-3 py-2 rounded bg-gray-700 text-white text-sm"
                onClick={() => pushLog("Manual log entry: heartbeat")}
              >
                Log heartbeat
              </button>
              <button
                className="px-3 py-2 rounded bg-cyan-600 text-white text-sm"
                onClick={() => {
                  // simulate agent pass
                  pushLog("Simulated: Agent A passed task to Agent B (Token Scope: contract.read).");
                }}
              >
                Simulate pass
              </button>
              <button
                className="px-3 py-2 rounded bg-green-600 text-white text-sm"
                onClick={() => pushLog("Simulated: Audit record secured.")}
              >
                Simulate audit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowPage;
