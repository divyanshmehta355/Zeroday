import { createClient } from "@/utils/supabase/server";

import { Heatmap } from "@/components/Heatmap";
import Image from "next/image";
import {
  Trophy,
  Flame,
  Activity,
  Calendar,
  MapPin,
  Github,
} from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [rankRes, submissionsRes, recentRes] = await Promise.all([
    supabase
      .from("leaderboard")
      .select("solved_count")

      .eq("username", user.user_metadata.user_name)
      .single(),

    supabase.from("submissions").select("created_at").eq("user_id", user.id),

    supabase
      .from("submissions")
      .select("id, status, language, created_at, problems(title, slug)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const activityMap: Record<string, number> = {};
  submissionsRes.data?.forEach((sub) => {
    const date = sub.created_at.split("T")[0];
    activityMap[date] = (activityMap[date] || 0) + 1;
  });

  const solvedCount = rankRes.data?.solved_count || 0;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-green-500/30">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {}
          <div className="md:col-span-4 lg:col-span-3">
            <div className="relative group">
              <div className="relative w-64 h-64 rounded-full overflow-hidden border-2 border-gray-800 ring-4 ring-gray-900 mx-auto md:mx-0">
                <Image
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.user_name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute bottom-4 right-4 md:right-auto md:left-48 bg-[#111] border border-gray-700 p-2 rounded-full">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>

            <div className="mt-6 text-center md:text-left">
              <h1 className="text-3xl font-black tracking-tight mb-1">
                {user.user_metadata.user_name}
              </h1>
              <p className="text-gray-400 text-lg mb-6">Full Stack Engineer</p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <MapPin size={16} /> <span>Global</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Github size={16} />{" "}
                  <span>{user.user_metadata.user_name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Calendar size={16} />{" "}
                  <span>
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button className="w-full bg-[#21262d] hover:bg-[#30363d] text-gray-200 font-bold py-2 rounded-lg border border-[rgba(240,246,252,0.1)] transition-colors text-sm">
                Edit Profile
              </button>
            </div>
          </div>

          {}
          <div className="md:col-span-8 lg:col-span-9 space-y-8">
            {}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0d1117] border border-gray-800 p-6 rounded-xl hover:border-gray-600 transition-colors group">
                <div className="flex items-center gap-3 mb-2 text-gray-400">
                  <Trophy
                    size={18}
                    className="group-hover:text-yellow-500 transition-colors"
                  />
                  <span className="text-sm font-bold uppercase tracking-wider">
                    Solved
                  </span>
                </div>
                <div className="text-4xl font-black text-white">
                  {solvedCount}
                </div>
              </div>
              <div className="bg-[#0d1117] border border-gray-800 p-6 rounded-xl hover:border-gray-600 transition-colors group">
                <div className="flex items-center gap-3 mb-2 text-gray-400">
                  <Flame
                    size={18}
                    className="group-hover:text-orange-500 transition-colors"
                  />
                  <span className="text-sm font-bold uppercase tracking-wider">
                    Streak
                  </span>
                </div>
                <div className="text-4xl font-black text-white">
                  0{" "}
                  <span className="text-sm text-gray-500 font-normal">
                    Days
                  </span>
                </div>
              </div>
              <div className="bg-[#0d1117] border border-gray-800 p-6 rounded-xl hover:border-gray-600 transition-colors group">
                <div className="flex items-center gap-3 mb-2 text-gray-400">
                  <Activity
                    size={18}
                    className="group-hover:text-purple-500 transition-colors"
                  />
                  <span className="text-sm font-bold uppercase tracking-wider">
                    Total Subs
                  </span>
                </div>
                <div className="text-4xl font-black text-white">
                  {submissionsRes.data?.length || 0}
                </div>
              </div>
            </div>

            {}
            <div className="bg-[#0d1117] border border-gray-800 p-6 rounded-xl">
              <h2 className="text-sm font-bold text-gray-200 mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                {new Date().getFullYear()} Contributions
              </h2>
              <Heatmap data={activityMap} />
            </div>

            {}
            <div>
              <h2 className="text-lg font-bold text-white mb-4">
                Recent Activity
              </h2>
              <div className="bg-[#0d1117] border border-gray-800 rounded-xl overflow-hidden">
                {recentRes.data?.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="p-4 border-b border-gray-800 hover:bg-[#161b22] transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          sub.status === "Accepted"
                            ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                            : "bg-red-500"
                        }`}
                      />
                      <div>
                        <div className="text-sm font-bold text-gray-200 group-hover:text-purple-400 transition-colors">
                          {sub.problems.title}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">
                          Submitted via {sub.language} •{" "}
                          {new Date(sub.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded border ${
                          sub.status === "Accepted"
                            ? "bg-green-900/20 text-green-400 border-green-900/50"
                            : "bg-red-900/20 text-red-400 border-red-900/50"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                  </div>
                ))}

                {(!recentRes.data || recentRes.data.length === 0) && (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No activity yet. Go solve some problems!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
