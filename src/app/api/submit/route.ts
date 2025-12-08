import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { code, language, slug } = await request.json();

  const { data: problem } = await supabase
    .from("problems")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!problem)
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });

  const { data: testCases } = await supabase
    .from("test_cases")
    .select("input, expected_output")
    .eq("problem_id", problem.id);

  if (!testCases || testCases.length === 0) {
    return NextResponse.json({ error: "No test cases found" }, { status: 500 });
  }

  for (const testCase of testCases) {
    let driverCode = code + "\n";

    if (slug === "two-sum") {
      driverCode += `print(two_sum(${testCase.input}))`;
    } else if (slug === "reverse-string") {
      driverCode += `s = ${testCase.input}\nreverse_string(s)\nprint(s)`;
    }

    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: language,
          version: "*",
          files: [{ content: driverCode }],
        }),
      });

      const result = await response.json();

      if (result.run.stderr) {
        return NextResponse.json({
          status: "Runtime Error",
          failedCase: {
            input: testCase.input,
            error: result.run.stderr,
          },
        });
      }

      const actualOutput = result.run.stdout ? result.run.stdout.trim() : "";
      const expectedOutput = testCase.expected_output.trim();

      if (actualOutput !== expectedOutput) {
        return NextResponse.json({
          status: "Wrong Answer",
          failedCase: {
            input: testCase.input,
            expected: expectedOutput,
            actual: actualOutput,
          },
        });
      }
    } catch (error) {
      return NextResponse.json({ error: "Execution failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ status: "Accepted" });
}
