"use client";

import { X, Moon, Sun, Type, Keyboard } from "lucide-react";

export interface EditorSettings {
  fontSize: number;
  theme: "vs-dark" | "light";
  fontFamily: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  setSettings: (s: EditorSettings) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  setSettings,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#161b22] border border-gray-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#0d1117]">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Keyboard size={18} /> Editor Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {}
        <div className="p-6 space-y-6">
          {}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Theme
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSettings({ ...settings, theme: "vs-dark" })}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                  settings.theme === "vs-dark"
                    ? "bg-purple-500/10 border-purple-500 text-purple-400"
                    : "bg-[#0d1117] border-gray-700 text-gray-400 hover:border-gray-500"
                }`}
              >
                <Moon size={16} /> Dark
              </button>
              <button
                onClick={() => setSettings({ ...settings, theme: "light" })}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                  settings.theme === "light"
                    ? "bg-white text-black border-white"
                    : "bg-[#0d1117] border-gray-700 text-gray-400 hover:border-gray-500"
                }`}
              >
                <Sun size={16} /> Light
              </button>
            </div>
          </div>

          {}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between">
              <span>Font Size</span>
              <span className="text-white">{settings.fontSize}px</span>
            </label>
            <input
              type="range"
              min="12"
              max="24"
              step="1"
              value={settings.fontSize}
              onChange={(e) =>
                setSettings({ ...settings, fontSize: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-500 font-mono">
              <span>12px</span>
              <span>24px</span>
            </div>
          </div>

          {}
          <div className="pt-6 border-t border-gray-800">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
              Keyboard Shortcuts
            </label>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center text-gray-300">
                <span>Run Code</span>
                <span className="flex gap-1">
                  <kbd className="bg-gray-800 border border-gray-700 px-2 py-0.5 rounded text-xs font-mono text-gray-400">
                    ⌘
                  </kbd>
                  <kbd className="bg-gray-800 border border-gray-700 px-2 py-0.5 rounded text-xs font-mono text-gray-400">
                    Enter
                  </kbd>
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span>Submit</span>
                <span className="flex gap-1">
                  <kbd className="bg-gray-800 border border-gray-700 px-2 py-0.5 rounded text-xs font-mono text-gray-400">
                    ⌘
                  </kbd>
                  <kbd className="bg-gray-800 border border-gray-700 px-2 py-0.5 rounded text-xs font-mono text-gray-400">
                    Shift
                  </kbd>
                  <kbd className="bg-gray-800 border border-gray-700 px-2 py-0.5 rounded text-xs font-mono text-gray-400">
                    Enter
                  </kbd>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
