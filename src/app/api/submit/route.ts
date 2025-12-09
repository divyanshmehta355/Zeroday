import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { code, language, slug } = await request.json();

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const adminSupabase = createAdminClient();

    const { data: problem } = await adminSupabase
      .from("problems")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const { data: testCases } = await adminSupabase
      .from("test_cases")
      .select("input, expected_output")
      .eq("problem_id", problem.id);

    if (!testCases || testCases.length === 0) {
      return NextResponse.json(
        { error: "System Error: No test cases found." },
        { status: 500 }
      );
    }

    let status = "Accepted";
    let failedCase = null;

    for (const testCase of testCases) {
      try {
        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: language,
            version: "*",
            files: [{ content: code }],
            stdin: testCase.input,
          }),
        });

        const result = await response.json();

        if (result.run.stderr) {
          status = "Runtime Error";
          failedCase = {
            input: testCase.input,
            error: result.run.stderr,
          };
          break;
        }

        const actualOutput = result.run.stdout ? result.run.stdout.trim() : "";
        const expectedOutput = testCase.expected_output.trim();

        if (actualOutput !== expectedOutput) {
          status = "Wrong Answer";
          failedCase = {
            input: testCase.input,
            expected: expectedOutput,
            actual: actualOutput,
          };
          break;
        }
      } catch (executionError) {
        console.error("Piston API Error:", executionError);
        return NextResponse.json(
          { error: "Execution Service Unavailable" },
          { status: 503 }
        );
      }
    }

    const { error: dbError } = await supabase.from("submissions").insert({
      user_id: user.id,
      problem_id: problem.id,
      code: code,
      language: language,
      status: status,
    });

    if (dbError) {
      console.error("Database Write Error:", dbError);
    }

    return NextResponse.json({ status, failedCase });
  } catch (error) {
    console.error("Submit Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
