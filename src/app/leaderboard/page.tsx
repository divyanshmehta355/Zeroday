import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import { Trophy, Medal, Crown } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const { data: leaderboard } = await supabase
    .from("leaderboard")
    .select("*")
    .limit(50);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black tracking-tight mb-4 flex items-center justify-center gap-4">
            <Crown size={48} className="text-yellow-500" />
            Hall of{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-orange-600">
              Fame
            </span>
          </h1>
          <p className="text-xl text-gray-400">
            The top engineers shipping code on ZeroDay.
          </p>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/10">
          {}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-800 bg-gray-900/50 text-xs font-bold uppercase tracking-wider text-gray-500">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-7">Engineer</div>
            <div className="col-span-3 text-right">Solved</div>
          </div>

          <div className="divide-y divide-gray-800">
            {leaderboard?.map((user, index) => (
              <div
                key={user.username}
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-800/50 transition-colors group"
              >
                {}
                <div className="col-span-2 flex justify-center">
                  {index === 0 ? (
                    <Trophy className="text-yellow-400 w-6 h-6 animate-pulse" />
                  ) : index === 1 ? (
                    <Medal className="text-gray-300 w-6 h-6" />
                  ) : index === 2 ? (
                    <Medal className="text-amber-600 w-6 h-6" />
                  ) : (
                    <span className="text-gray-500 font-mono font-bold">
                      #{index + 1}
                    </span>
                  )}
                </div>

                {}
                <div className="col-span-7 flex items-center gap-4">
                  <div
                    className={`relative w-10 h-10 rounded-full overflow-hidden border border-gray-700 group-hover:border-purple-500 transition-colors
                    ${index === 0 ? "ring-2 ring-yellow-500" : ""}
                  `}
                  >
                    <Image
                      src={user.avatar_url}
                      alt={user.username}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span
                    className={`font-bold transition-colors
                    ${
                      index === 0
                        ? "text-yellow-400"
                        : "text-gray-200 group-hover:text-white"
                    }
                  `}
                  >
                    {user.username}
                  </span>
                </div>

                {}
                <div className="col-span-3 text-right">
                  <span className="inline-block px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-mono font-bold border border-purple-500/20">
                    {user.solved_count} Solved
                  </span>
                </div>
              </div>
            ))}

            {(!leaderboard || leaderboard.length === 0) && (
              <div className="p-12 text-center text-gray-500">
                No data yet. Be the first to conquer the leaderboard.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
