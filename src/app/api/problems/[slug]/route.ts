import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = await params;

  // 1. Get Problem
  const { data: problem, error: problemError } = await supabase
    .from("problems")
    .select("*")
    .eq("slug", slug)
    .single();

  if (problemError)
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });

  // 2. Get PUBLIC Test Cases (Security Filter)
  const { data: testCases, error: testError } = await supabase
    .from("test_cases")
    .select("input, expected_output")
    .eq("problem_id", problem.id)
    .eq("is_hidden", false); // CRITICAL: Only fetch public tests

  return NextResponse.json({
    problem,
    testCases: testCases || [],
  });
}
