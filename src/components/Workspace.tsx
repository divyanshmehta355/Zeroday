"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { Play, Loader2, Trophy } from "lucide-react";

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
  const [code, setCode] = useState(
    problem.starter_code?.python || "# Write your python code here"
  );

  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const cleanDescription = problem.description.replace(/\\n/g, "\n");

  const runCode = async () => {
    setIsRunning(true);
    setStatus("idle");
    setOutput("Running...");

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: "python" }),
      });

      const data = await res.json();

      if (data.error) {
        setOutput(data.error);
        setStatus("error");
      } else {
        setOutput(data.output);
        setStatus("success");
      }
    } catch (_err) {
      setOutput("System Error: Failed to reach execution engine.");
      setStatus("error");
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    setIsSubmitting(true);
    setStatus("idle");
    setOutput("Running against hidden tests...");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: "python",
          slug: problem.slug,
        }),
      });

      const data = await res.json();

      if (data.status === "Accepted") {
        setOutput("🎉 Accepted! All test cases passed. You are a legend.");
        setStatus("success");
      } else if (data.status === "Wrong Answer") {
        setOutput(
          `❌ Wrong Answer\n\nInput: ${data.failedCase.input}\nExpected: ${data.failedCase.expected}\nActual: ${data.failedCase.actual}`
        );
        setStatus("error");
      } else if (data.status === "Runtime Error") {
        setOutput(`⚠️ Runtime Error\n\nError Log:\n${data.failedCase.error}`);
        setStatus("error");
      } else {
        setOutput("System Error: " + (data.error || "Unknown error"));
        setStatus("error");
      }
    } catch (_err) {
      setOutput("Network Error: Could not submit.");
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-64px)] bg-black text-white">
      {}
      <div className="border-r border-gray-800 bg-black p-8 overflow-y-auto h-full custom-scrollbar">
        <div className="mb-6 border-b border-gray-800 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight mb-3 text-white">
            {problem.title}
          </h1>
          <div className="flex gap-3">
            {}
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
        </div>

        <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ node: _node, ...props }) => (
                <h1
                  className="text-2xl font-bold mt-6 mb-4 text-white"
                  {...props}
                />
              ),
              code: ({ node: _node, ...props }) => (
                <code
                  className="bg-gray-800/50 text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-700/50"
                  {...props}
                />
              ),
              pre: ({ node: _node, ...props }) => (
                <div className="relative my-4 overflow-hidden rounded-lg border border-gray-800 bg-[#111] p-4">
                  <pre className="text-sm font-mono text-gray-300" {...props} />
                </div>
              ),
            }}
          >
            {cleanDescription}
          </ReactMarkdown>
        </div>
      </div>

      {}
      <div className="flex flex-col h-full bg-[#1e1e1e] border-l border-gray-800">
        <div className="h-14 border-b border-gray-800 bg-black/40 backdrop-blur flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-300 font-mono">
              main.py
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={runCode}
              disabled={isRunning || isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
            >
              {isRunning ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Play size={14} />
              )}
              Run
            </button>

            {}
            <button
              onClick={submitCode}
              disabled={isRunning || isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trophy size={14} />
              )}
              Submit
            </button>
          </div>
        </div>

        <div className="flex-1 relative">
          <Editor
            height="100%"
            defaultLanguage="python"
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 24 },
            }}
          />
        </div>

        {}
        <div
          className={`transition-all duration-300 ease-in-out border-t border-gray-800 bg-black flex flex-col ${
            output ? "h-[300px]" : "h-12"
          }`}
        >
          <div className="flex items-center justify-between px-6 py-3 bg-[#111] border-b border-gray-800/50">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Console
            </span>
            {output && (
              <button
                onClick={() => setOutput("")}
                className="text-[10px] text-gray-600 hover:text-gray-400 uppercase font-bold"
              >
                Clear
              </button>
            )}
          </div>
          {output && (
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              <pre
                className={`font-mono text-sm leading-relaxed whitespace-pre-wrap ${
                  status === "error" ? "text-red-400" : "text-gray-300"
                }`}
              >
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
