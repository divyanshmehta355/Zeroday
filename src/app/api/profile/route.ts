import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: rankData } = await supabase
    .from("leaderboard")
    .select("solved_count")
    .eq("username", user.user_metadata.user_name)
    .single();

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const { data: submissions } = await supabase
    .from("submissions")
    .select("created_at, status")
    .eq("user_id", user.id)
    .gte("created_at", oneYearAgo.toISOString());

  const activityMap = new Map<string, number>();

  submissions?.forEach((sub) => {
    const date = sub.created_at.split("T")[0];
    activityMap.set(date, (activityMap.get(date) || 0) + 1);
  });

  const { data: recent } = await supabase
    .from("submissions")
    .select("id, status, language, created_at, problems(title, slug)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return NextResponse.json({
    user: {
      username: user.user_metadata.user_name,
      avatar_url: user.user_metadata.avatar_url,
      solved: rankData?.solved_count || 0,
    },
    heatmap: Object.fromEntries(activityMap),
    recent,
  });
}
