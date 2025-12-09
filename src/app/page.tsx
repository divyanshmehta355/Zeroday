import { createClient } from "@/utils/supabase/server";

import { ProblemCard } from "@/components/ProblemCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: problems } = await supabase
    .from("problems")
    .select("id, title, slug, difficulty")
    .order("id", { ascending: true });

  const solvedIds = new Set<number>();
  if (user && problems) {
    const { data: submissions } = await supabase
      .from("submissions")
      .select("problem_id")
      .eq("user_id", user.id)
      .eq("status", "Accepted");

    submissions?.forEach((s) => solvedIds.add(s.problem_id));
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            Solve. Ship. <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-600">
              Get Hired.
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            The zero-cost platform for mastering algorithms. No fluff. No
            paywalls. Just code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems?.map((problem) => (
            <ProblemCard
              key={problem.id}
              {...problem}
              isSolved={solvedIds.has(problem.id)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
