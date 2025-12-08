import Link from "next/link";
import { Terminal } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-white text-black rounded-lg group-hover:scale-105 transition-transform">
            <Terminal size={20} strokeWidth={3} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Zero<span className="text-gray-400">Day</span>
          </span>
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">
            Problems
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            Leaderboard
          </Link>
          <div className="h-4 w-px bg-gray-800" />
          <button className="text-white hover:text-gray-300">Sign In</button>
        </div>
      </div>
    </nav>
  );
}
