import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: problem, error: problemError } = await supabase
    .from("problems")
    .select("*")
    .eq("slug", slug)
    .single();

  if (problemError)
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });

  const { data: testCases, error: testError } = await supabase
    .from("test_cases")
    .select("input, expected_output")
    .eq("problem_id", problem.id)
    .eq("is_hidden", false);

  return NextResponse.json({
    problem,
    testCases: testCases || [],
  });
}
