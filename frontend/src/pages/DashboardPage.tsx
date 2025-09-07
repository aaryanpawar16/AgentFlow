// src/pages/DashboardPage.tsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, Layers, Database, BarChart2 } from "lucide-react";
import gsap from "gsap";

type CalendarResponse = { status?: string; slots?: string[]; subject?: string; message?: string };
type Workflow = { id: string; user: string; result: string; ts: string };

const cardVariant = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

const LOCAL_STORAGE_TOKEN_KEY = "agentflow_auth_token";
const DEMO_TOKEN = "demo-token";
const POLL_INTERVAL_MS = 5000;

const maskToken = (t: string | null) => {
  if (!t) return "none";
  if (t === DEMO_TOKEN) return "demo-token";
  return `${t.slice(0, 6)}...${t.slice(-4)}`;
};

const DashboardPage: React.FC = () => {
  // data state
  const [calendar, setCalendar] = useState<CalendarResponse | null>(null);
  const [calendarLoading, setCalendarLoading] = useState<boolean>(true);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  const [recentWorkflows, setRecentWorkflows] = useState<Workflow[]>([]);
  const [workflowsLoading, setWorkflowsLoading] = useState<boolean>(true);
  const [workflowsError, setWorkflowsError] = useState<string | null>(null);

  const [activity, setActivity] = useState<number[]>([6, 10, 14, 8, 12, 9]);
  const [activityLoading, setActivityLoading] = useState<boolean>(true);
  const [activityError, setActivityError] = useState<string | null>(null);

  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // token UI
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [tokenInput, setTokenInput] = useState<string>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) || "";
    } catch {
      return "";
    }
  });

  const barsRef = useRef<HTMLDivElement | null>(null);
  const pulseRef = useRef<HTMLDivElement | null>(null);

  // persist token helpers
  const saveToken = (t: string) => {
    setAuthToken(t || null);
    setTokenInput(t || "");
    try {
      if (t) localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, t);
      else localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    } catch {}
  };
  const useDemoToken = () => {
    saveToken(DEMO_TOKEN);
  };
  const clearToken = () => {
    saveToken("");
  };

  // header helper for fetch (EventSource will use query param)
  const tokenToHeader = () => `Bearer ${authToken ?? DEMO_TOKEN}`;

  // animate bars
  useEffect(() => {
    const bars = barsRef.current?.querySelectorAll<HTMLElement>(".mini-bar");
    if (bars && bars.length) {
      gsap.fromTo(
        bars,
        { height: "6px", opacity: 0.5 },
        {
          height: (i: number) => `${20 + i * 12}px`,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.12,
          repeat: -1,
          yoyo: true,
        }
      );
    }

    if (pulseRef.current) {
      gsap.to(pulseRef.current, {
        boxShadow: "0 8px 40px rgba(59,130,246,0.12)",
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });
    }
  }, []);

  // fetch functions
  const fetchCalendar = async (signal?: AbortSignal) => {
    setCalendarLoading(true);
    setCalendarError(null);
    try {
      const res = await fetch("/api/calendar", {
        method: "GET",
        headers: { Authorization: tokenToHeader(), "Content-Type": "application/json" },
        signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `${res.status} ${res.statusText}`);
      }
      const json: CalendarResponse = await res.json();
      setCalendar(json);
      setCalendarError(null);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error("fetchCalendar:", err);
      setCalendar(null);
      setCalendarError(err.message || String(err));
    } finally {
      setCalendarLoading(false);
    }
  };

  const fetchWorkflows = async (signal?: AbortSignal) => {
    setWorkflowsLoading(true);
    setWorkflowsError(null);
    try {
      const res = await fetch("/api/workflows", {
        method: "GET",
        headers: { Authorization: tokenToHeader(), "Content-Type": "application/json" },
        signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        try {
          const parsed = JSON.parse(text || "");
          throw new Error(parsed?.message || parsed?.error || text || `${res.status} ${res.statusText}`);
        } catch {
          throw new Error(text || `${res.status} ${res.statusText}`);
        }
      }

      const json: Workflow[] = await res.json();

      // sort newest-first (safe parsing)
      const sorted = json
        .slice()
        .sort((a, b) => {
          const ta = Date.parse(a.ts || "");
          const tb = Date.parse(b.ts || "");
          if (isNaN(ta) || isNaN(tb)) return a.ts < b.ts ? 1 : -1;
          return tb - ta;
        })
        .slice(0, 50);

      setRecentWorkflows(sorted);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error("fetchWorkflows:", err);
      setRecentWorkflows((prev) => prev || []);
      setWorkflowsError(err.message || String(err));
    } finally {
      setWorkflowsLoading(false);
    }
  };

  const fetchActivity = async (signal?: AbortSignal) => {
    setActivityLoading(true);
    setActivityError(null);
    try {
      const res = await fetch("/api/activity", {
        method: "GET",
        headers: { Authorization: tokenToHeader(), "Content-Type": "application/json" },
        signal,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `${res.status} ${res.statusText}`);
      }
      const json: number[] = await res.json();
      if (Array.isArray(json) && json.length) setActivity(json.slice(0, 6));
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error("fetchActivity:", err);
      setActivityError(err.message || String(err));
    } finally {
      setActivityLoading(false);
    }
  };

  // Real-time SSE (with query-token) + polling fallback
  useEffect(() => {
    let es: EventSource | null = null;
    let poller: number | null = null;
    const controller = new AbortController();
    const signal = controller.signal;

    // initial fetches
    fetchCalendar(signal);
    fetchWorkflows(signal);
    fetchActivity(signal);

    // Build SSE URL with token query param (EventSource cannot set headers)
    const tokenForSSE = encodeURIComponent(authToken ?? DEMO_TOKEN);
    const sseUrl = `/api/workflows/stream?token=${tokenForSSE}`;

    try {
      es = new EventSource(sseUrl);

      // Generic message handler (some servers send event: message)
      es.addEventListener("message", (ev) => {
        try {
          // try to parse: server may send { type: 'workflow', workflow: {...} } or snapshot
          const payload = JSON.parse(ev.data);
          if (payload?.type === "workflow" && payload.workflow) {
            const wf = payload.workflow as Workflow;
            setRecentWorkflows((prev) => {
              const exists = prev.some((w) => w.id === wf.id);
              const next = exists ? prev.map((w) => (w.id === wf.id ? wf : w)) : [wf, ...prev];
              next.sort((a, b) => {
                const ta = Date.parse(a.ts || "");
                const tb = Date.parse(b.ts || "");
                if (isNaN(ta) || isNaN(tb)) return a.ts < b.ts ? 1 : -1;
                return tb - ta;
              });
              return next.slice(0, 50);
            });
          } else if (payload?.type === "workflows_snapshot" && Array.isArray(payload.workflows)) {
            const sorted = payload.workflows.slice().sort((a: Workflow, b: Workflow) => {
              const ta = Date.parse(a.ts || "");
              const tb = Date.parse(b.ts || "");
              if (isNaN(ta) || isNaN(tb)) return a.ts < b.ts ? 1 : -1;
              return tb - ta;
            });
            setRecentWorkflows(sorted.slice(0, 50));
          } else {
            // unknown — best-effort fetch
            fetchWorkflows();
          }
        } catch (e) {
          // parse error -> fetch instead
          fetchWorkflows();
        }
      });

      es.addEventListener("open", () => {
        console.info("SSE connected to /api/workflows/stream");
      });

      es.addEventListener("error", (err) => {
        console.warn("SSE error, falling back to polling", err);
        try {
          es?.close();
        } catch {}
        es = null;
        if (!poller) {
          poller = window.setInterval(() => {
            fetchCalendar();
            fetchWorkflows();
            fetchActivity();
          }, POLL_INTERVAL_MS);
        }
      });
    } catch (err) {
      console.warn("EventSource not available or SSE failed; using polling:", err);
      poller = window.setInterval(() => {
        fetchCalendar();
        fetchWorkflows();
        fetchActivity();
      }, POLL_INTERVAL_MS);
    }

    // ensure we have polling if SSE not set
    if (!es && !poller) {
      poller = window.setInterval(() => {
        fetchCalendar();
        fetchWorkflows();
        fetchActivity();
      }, POLL_INTERVAL_MS);
    }

    return () => {
      controller.abort();
      if (es) es.close();
      if (poller) clearInterval(poller);
    };
    // restart SSE when token changes
  }, [authToken]);

  // Book slot
  const bookSlot = async (slot: string) => {
    setBookingError(null);
    setBookingSuccess(null);
    setBookingLoading(true);
    try {
      const res = await fetch("/api/calendar/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: tokenToHeader(),
        },
        body: JSON.stringify({ slot }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        let parsed;
        try {
          parsed = JSON.parse(txt || "");
        } catch {}
        throw new Error((parsed && (parsed.message || JSON.stringify(parsed))) || txt || `HTTP ${res.status}`);
      }

      const json = await res.json();
      setBookingSuccess(json.message || `Booked ${slot}`);

      // update calendar slots locally
      setCalendar((prev) => {
        if (!prev?.slots) return prev;
        return { ...prev, slots: prev.slots.filter((s) => s !== slot) };
      });

      // Use server canonical workflow if provided
      if (json.workflow) {
        setRecentWorkflows((prev) => {
          const wf = json.workflow as Workflow;
          const next = [wf, ...prev.filter((w) => w.id !== wf.id)];
          next.sort((a, b) => {
            const ta = Date.parse(a.ts || "");
            const tb = Date.parse(b.ts || "");
            if (isNaN(ta) || isNaN(tb)) return a.ts < b.ts ? 1 : -1;
            return tb - ta;
          });
          return next.slice(0, 50);
        });
      } else {
        const nowIso = new Date().toISOString();
        setRecentWorkflows((prev) => {
          const newW: Workflow = { id: `wf_${Math.random().toString(36).slice(2, 7)}`, user: calendar?.subject ?? "demo-user", result: "success", ts: nowIso };
          const next = [newW, ...prev];
          return next.slice(0, 50);
        });
      }

      // update activity
      setActivity((prev) => {
        const next = [...prev];
        next.shift();
        const avg = Math.round(prev.reduce((a, b) => a + b, 0) / prev.length);
        const delta = Math.round((Math.random() - 0.5) * 8);
        next.push(Math.max(6, avg + delta));
        return next;
      });

      // best-effort refresh server state
      try {
        await fetchWorkflows();
      } catch (err) {
        console.warn("fetchWorkflows() after booking failed:", err);
      }
    } catch (err: any) {
      console.error("Booking failed:", err);
      setBookingError(err.message || "Booking failed");
    } finally {
      setBookingLoading(false);
      setBookingSlot(null);
    }
  };

  const handleRefresh = () => {
    fetchCalendar();
    fetchWorkflows();
    fetchActivity();
  };

  // format date helper (Asia/Kolkata)
  const formatDate = (iso?: string | null) => {
    if (!iso) return "-";
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(iso)) iso = iso + "Z";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(d);
  };

  return (
    <div className="container mx-auto p-8 lg:p-12 mt-24">
      <motion.div initial="hidden" animate="show" className="space-y-8">
        {/* Header + token UI */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white">Dashboard</h1>
            <p className="text-gray-200 mt-2 max-w-xl">Overview of orchestration status, recent workflows and Agent B calendar availability.</p>
          </div>

          <div className="flex items-center gap-3">
            <input value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} placeholder="Paste JWT or demo-token" className="px-3 py-2 rounded-md bg-slate-800 text-sm text-white border border-gray-700 w-64" />
            <button onClick={() => saveToken(tokenInput)} className="px-3 py-2 rounded-md bg-cyan-600 text-white text-sm">Save</button>
            <button onClick={useDemoToken} className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm">Use demo</button>
            <button onClick={clearToken} className="px-3 py-2 rounded-md bg-red-600 text-white text-sm">Clear</button>
            <button onClick={handleRefresh} className="px-3 py-2 rounded-md bg-gray-700 text-white text-sm">Refresh</button>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <div className="text-sm text-gray-300">Current token: <span className="text-white ml-2">{maskToken(authToken)}</span></div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={cardVariant} className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/40 to-black/40 border border-gray-700 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-cyan-500/6 blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-cyan-600/10">
                  <Layers className="w-6 h-6 text-cyan-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-300">Orchestrator</div>
                  <div className="font-semibold text-white">Ready</div>
                </div>
              </div>
              <div className="text-sm text-gray-400">Live</div>
            </div>

            <div className="mt-4">
              <div className="text-xs text-gray-400">Throughput</div>
              <div className="mt-2 flex items-end gap-2" ref={barsRef}>
                <div className="mini-bar w-4 bg-cyan-500 rounded" />
                <div className="mini-bar w-4 bg-cyan-400 rounded" />
                <div className="mini-bar w-4 bg-cyan-300 rounded" />
                <div className="mini-bar w-4 bg-cyan-500 rounded" />
                <div className="mini-bar w-4 bg-cyan-400 rounded" />
                <div className="mini-bar w-4 bg-cyan-300 rounded" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={cardVariant} className="p-6 rounded-2xl bg-gradient-to-br from-black/20 to-slate-900/40 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-green-600/10">
                  <CheckCircle className="w-6 h-6 text-green-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-300">Last Workflow</div>
                  <div className="font-semibold text-white">{recentWorkflows[0]?.result ?? "—"}</div>
                </div>
              </div>
              <div className="text-sm text-gray-400">{recentWorkflows[0]?.ts ? formatDate(recentWorkflows[0].ts) : "-"}</div>
            </div>
          </motion.div>

          <motion.div variants={cardVariant} className="p-6 rounded-2xl bg-gradient-to-br from-black/20 to-slate-900/40 border border-gray-700" ref={pulseRef}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-indigo-600/10">
                  <Clock className="w-6 h-6 text-indigo-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-300">Next Available</div>
                  <div className="font-semibold text-white">{calendarLoading ? "Loading..." : calendar?.slots && calendar.slots.length ? calendar.slots[0] : "—"}</div>
                </div>
              </div>
              <div className="text-sm text-gray-400">Agent B</div>
            </div>
          </motion.div>

          <motion.div variants={cardVariant} className="p-6 rounded-2xl bg-gradient-to-br from-black/20 to-slate-900/40 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-yellow-600/10">
                  <Database className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-300">Consent DB</div>
                  <div className="font-semibold text-white">SQLite</div>
                </div>
              </div>
              <div className="text-sm text-gray-400">Local</div>
            </div>
          </motion.div>
        </div>

        {/* Recent Workflows + Slots */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div className="lg:col-span-2 p-6 rounded-2xl bg-white/6 border border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Workflows</h3>
              <div className="text-sm text-gray-400">{workflowsLoading ? "…" : `${recentWorkflows.length} items`}</div>
            </div>

            {workflowsError && <div className="text-red-400 mb-3">Error: {workflowsError}</div>}

            <div className="space-y-3">
              {recentWorkflows.map((wf, idx) => (
                <motion.div key={wf.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.06 }} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                  <div>
                    <div className="font-medium text-white">{wf.id}</div>
                    <div className="text-xs text-gray-400">{wf.user} • {formatDate(wf.ts)}</div>
                  </div>
                  <div className="text-sm">
                    {wf.result === "success" ? (
                      <span className="inline-flex items-center gap-2 text-green-300"><CheckCircle className="w-4 h-4" /> Success</span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-yellow-300"><XCircle className="w-4 h-4" /> {wf.result}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div className="p-6 rounded-2xl bg-white/6 border border-gray-700 space-y-4">
            <h3 className="text-lg font-semibold text-white">Agent B — Slots</h3>

            {bookingSuccess && <div className="text-green-300">{bookingSuccess}</div>}
            {bookingError && <div className="text-red-400">Error: {bookingError}</div>}

            <div className="space-y-2">
              {calendarLoading ? (
                <div className="text-gray-400">Loading slots…</div>
              ) : calendarError ? (
                <div className="text-red-400">Error: {calendarError}</div>
              ) : calendar?.slots && calendar.slots.length ? (
                calendar.slots.map((s, i) => (
                  <motion.div key={s + i} whileHover={{ scale: 1.02 }} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-slate-900/20 to-black/20 border border-gray-700">
                    <div className="text-sm text-gray-200">{s}</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setBookingSlot(s)} disabled={bookingLoading} className="px-3 py-1 rounded-md bg-cyan-600 text-white text-xs disabled:opacity-50">Book</button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-gray-400">No slots available</div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Activity chart */}
        <motion.div className="p-6 rounded-2xl bg-white/6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2"><BarChart2 className="w-5 h-5" /> Activity (live)</h3>
            <div className="text-sm text-gray-400">Last 6 intervals</div>
          </div>
          <div className="h-28 bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg p-3 flex items-end gap-3">
            <div className="w-full flex items-end gap-2">
              {activity.map((val, i) => (
                <div key={i} className="w-6 bg-cyan-500 rounded mini-bar" style={{ height: `${Math.max(6, val)}px` }} />
              ))}
            </div>
          </div>
          {activityError && <div className="text-red-400 mt-2 text-sm">{activityError}</div>}
        </motion.div>
      </motion.div>

      {/* Confirmation modal */}
      {bookingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setBookingSlot(null)} />
          <div className="relative bg-slate-900 rounded-lg p-6 w-[320px]">
            <h4 className="text-lg font-semibold text-white mb-2">Confirm booking</h4>
            <p className="text-sm text-gray-300 mb-4">Book slot <strong>{bookingSlot}</strong>?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setBookingSlot(null)} className="px-3 py-1 rounded-md bg-gray-700 text-sm text-gray-200">Cancel</button>
              <button onClick={() => bookSlot(bookingSlot)} disabled={bookingLoading} className="px-3 py-1 rounded-md bg-cyan-600 text-white text-sm disabled:opacity-50">{bookingLoading ? "Booking..." : "Confirm"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
