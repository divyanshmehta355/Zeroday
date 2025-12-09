"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  Play,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trophy,
  Terminal,
  SquareTerminal,
  FileText,
  History,
  RefreshCcw,
  Settings,
} from "lucide-react";
import { SettingsModal, type EditorSettings } from "./SettingsModal";

const LANGUAGES = [
  { id: "python", name: "Python" },
  { id: "javascript", name: "JavaScript" },
  { id: "cpp", name: "C++" },
  { id: "java", name: "Java" },
  { id: "go", name: "Go" },
];

interface Submission {
  id: number;
  status: string;
  language: string;
  code: string;
  created_at: string;
}

interface WorkspaceProps {
  problem: {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    slug: string;
    starter_code: Record<string, string>;
  };
}

export function Workspace({ problem }: WorkspaceProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<EditorSettings>({
    fontSize: 14,
    theme: "vs-dark",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  });

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(problem.starter_code?.python || "");
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState<string>("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const [activeTab, setActiveTab] = useState<"input" | "output">("input");
  const [leftTab, setLeftTab] = useState<"description" | "submissions">(
    "description"
  );

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const cleanDescription = problem.description.replace(/\\n/g, "\n");

  useEffect(() => {
    const saved = localStorage.getItem("zeroday-settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          submitCode();
        } else {
          runCode();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [code, language, customInput]);

  const updateSettings = (newSettings: EditorSettings) => {
    setSettings(newSettings);
    localStorage.setItem("zeroday-settings", JSON.stringify(newSettings));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(problem.starter_code[newLang] || "// Language not configured");
  };

  const fetchSubmissions = async () => {
    if (leftTab === "submissions") return;
    setLeftTab("submissions");
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/problems/${problem.slug}/submissions`);
      const data = await res.json();
      setSubmissions(data.data || []);
    } catch {
      console.error("Failed to fetch history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const runCode = async () => {
    if (isRunning || isSubmitting) return;
    setIsRunning(true);
    setStatus("idle");
    setActiveTab("output");
    setOutput("Running...");

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, stdin: customInput }),
      });

      const data = await res.json();

      if (data.error) {
        setOutput(data.error);
        setStatus("error");
      } else {
        setOutput(data.output || "No output returned.");
        setStatus("success");
      }
    } catch {
      setOutput("System Error: Failed to reach execution engine.");
      setStatus("error");
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    if (isRunning || isSubmitting) return;
    setIsSubmitting(true);
    setStatus("idle");
    setActiveTab("output");
    setOutput("Running against hidden tests...");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, slug: problem.slug }),
      });

      const data = await res.json();

      if (data.status === "Accepted") {
        setOutput("🎉 Accepted! All test cases passed.");
        setStatus("success");

        if (leftTab === "submissions") {
          const historyRes = await fetch(
            `/api/problems/${problem.slug}/submissions`
          );
          const historyData = await historyRes.json();
          setSubmissions(historyData.data || []);
        }
      } else if (data.status === "Wrong Answer") {
        setOutput(
          `❌ Wrong Answer\n\nInput:\n${data.failedCase.input}\n\nExpected:\n${data.failedCase.expected}\n\nActual:\n${data.failedCase.actual}`
        );
        setStatus("error");
      } else if (data.status === "Runtime Error") {
        setOutput(`⚠️ Runtime Error\n\nError Log:\n${data.failedCase.error}`);
        setStatus("error");
      } else {
        setOutput("System Error: " + (data.error || "Unknown error"));
        setStatus("error");
      }
    } catch {
      setOutput("Network Error: Could not submit.");
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-64px)] bg-black text-white">
      {}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        setSettings={updateSettings}
      />

      {}
      <div className="border-r border-gray-800 bg-black flex flex-col h-full overflow-hidden">
        {}
        <div className="flex border-b border-gray-800 bg-gray-900/50">
          <button
            onClick={() => setLeftTab("description")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors
                ${
                  leftTab === "description"
                    ? "text-white border-b-2 border-purple-500 bg-gray-800/50"
                    : "text-gray-500 hover:text-gray-300"
                }`}
          >
            <FileText size={16} /> Description
          </button>
          <button
            onClick={fetchSubmissions}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors
                ${
                  leftTab === "submissions"
                    ? "text-white border-b-2 border-purple-500 bg-gray-800/50"
                    : "text-gray-500 hover:text-gray-300"
                }`}
          >
            <History size={16} /> Submissions
          </button>
        </div>

        {}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {leftTab === "description" ? (
            <>
              <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-white">
                {problem.title}
              </h1>
              <div className="flex gap-3 mb-6">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono 
                        ${
                          problem.difficulty === "Easy"
                            ? "bg-green-500/10 text-green-400"
                            : problem.difficulty === "Medium"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                >
                  {problem.difficulty}
                </span>
              </div>

              {}
              <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />
                    ),

                    code: ({ node, ...props }) => (
                      <code
                        className="bg-gray-800/50 text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono"
                        {...props}
                      />
                    ),

                    pre: ({ node, ...props }) => (
                      <div className="bg-[#111] p-4 rounded-lg border border-gray-800 my-4 overflow-x-auto">
                        <pre {...props} />
                      </div>
                    ),
                  }}
                >
                  {cleanDescription}
                </ReactMarkdown>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              {isLoadingHistory ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-purple-500" />
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  No submissions yet. Go solve it!
                </div>
              ) : (
                submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between group hover:border-gray-600 transition-all"
                  >
                    <div>
                      <div
                        className={`text-sm font-bold mb-1 ${
                          sub.status === "Accepted"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {sub.status}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {new Date(sub.created_at).toLocaleString()} •{" "}
                        {sub.language}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setCode(sub.code);
                        setLanguage(sub.language);
                      }}
                      className="p-2 bg-gray-800 text-gray-400 rounded-lg opacity-0 group-hover:opacity-100 hover:text-white hover:bg-purple-600 transition-all"
                      title="Restore Code"
                    >
                      <RefreshCcw size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {}
      <div className="flex flex-col h-full bg-[#1e1e1e] border-l border-gray-800">
        {}
        <div className="h-14 border-b border-gray-800 bg-black/40 backdrop-blur flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-gray-800 text-gray-300 text-xs font-medium px-3 py-1.5 rounded-md border border-gray-700 outline-none focus:border-gray-500 hover:bg-gray-750 cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            {}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors"
              title="Editor Settings"
            >
              <Settings size={18} />
            </button>

            {}
            <button
              onClick={runCode}
              disabled={isRunning || isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
              title="Cmd + Enter"
            >
              {isRunning ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Play size={14} />
              )}{" "}
              Run
            </button>
            <button
              onClick={submitCode}
              disabled={isRunning || isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50"
              title="Cmd + Shift + Enter"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trophy size={14} />
              )}{" "}
              Submit
            </button>
          </div>
        </div>

        {}
        <div className="flex-1 relative">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(value) => setCode(value || "")}
            theme={settings.theme}
            options={{
              minimap: { enabled: false },
              fontSize: settings.fontSize,
              fontFamily: settings.fontFamily,
              padding: { top: 24 },
            }}
          />
        </div>

        {}
        <div className="h-[250px] border-t border-gray-800 bg-[#111] flex flex-col">
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveTab("input")}
              className={`flex items-center gap-2 px-6 py-2 text-xs font-bold uppercase tracking-wider transition-colors
                    ${
                      activeTab === "input"
                        ? "bg-[#1e1e1e] text-white border-t-2 border-purple-500"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
            >
              <SquareTerminal size={14} /> Input
            </button>
            <button
              onClick={() => setActiveTab("output")}
              className={`flex items-center gap-2 px-6 py-2 text-xs font-bold uppercase tracking-wider transition-colors
                    ${
                      activeTab === "output"
                        ? "bg-[#1e1e1e] text-white border-t-2 border-purple-500"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
            >
              <Terminal size={14} /> Output
            </button>
          </div>

          <div className="flex-1 p-4 bg-[#1e1e1e] overflow-hidden">
            {activeTab === "input" ? (
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full h-full bg-[#111] text-gray-300 font-mono text-sm p-4 rounded-lg border border-gray-800 focus:border-purple-500 outline-none resize-none"
                placeholder="Enter your input here..."
              />
            ) : (
              <div className="h-full w-full bg-[#111] rounded-lg border border-gray-800 p-4 overflow-auto custom-scrollbar">
                {status === "success" && (
                  <div className="flex items-center gap-2 mb-2 text-green-400 text-xs font-bold uppercase">
                    <CheckCircle2 size={12} /> Success
                  </div>
                )}
                {status === "error" && (
                  <div className="flex items-center gap-2 mb-2 text-red-400 text-xs font-bold uppercase">
                    <AlertCircle size={12} /> Failed
                  </div>
                )}
                <pre
                  className={`font-mono text-sm leading-relaxed whitespace-pre-wrap ${
                    status === "error" ? "text-red-300" : "text-gray-300"
                  }`}
                >
                  {output || "Run code to see output..."}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
