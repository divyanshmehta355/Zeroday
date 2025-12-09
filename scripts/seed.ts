import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PROBLEMS = [
  {
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",
    description:
      "# Two Sum\n\nGiven an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\n**Input:**\nFirst line contains `target`.\nSecond line contains space-separated `nums`.\n\n**Output:**\nPrint two space-separated indices.\n\n**Example:**\n```\nInput:\n9\n2 7 11 15\n\nOutput:\n0 1\n```",
    starter_code: {
      python:
        "import sys\n\nlines = sys.stdin.read().split() \ntarget = int(lines[0])\nnums = [int(x) for x in lines[1:]]\n\n# Write your code here",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int target;\n    cin >> target;\n    vector<int> nums;\n    int val;\n    while(cin >> val) nums.push_back(val);\n    // Write your code here\n    return 0;\n}",
      java: "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner s = new Scanner(System.in);\n        int target = s.nextInt();\n        // Write logic\n    }\n}",
    },
    test_cases: [
      { input: "9\n2 7 11 15", expected_output: "0 1", is_hidden: false },
      { input: "6\n3 2 4", expected_output: "1 2", is_hidden: true },
    ],
  },
  {
    title: "Valid Palindrome",
    slug: "valid-palindrome",
    difficulty: "Easy",
    description:
      "# Valid Palindrome\n\nA phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\n**Input:**\nA single string `s`.\n\n**Output:**\nPrint `true` if it is a palindrome, or `false` otherwise.",
    starter_code: {
      python: "import sys\n\ns = sys.stdin.read().strip()\n# Write logic",
      cpp: "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    getline(cin, s);\n    // Write logic\n    return 0;\n}",
    },
    test_cases: [
      {
        input: "A man, a plan, a canal: Panama",
        expected_output: "true",
        is_hidden: false,
      },
      { input: "race a car", expected_output: "false", is_hidden: true },
    ],
  },
  {
    title: "Contains Duplicate",
    slug: "contains-duplicate",
    difficulty: "Easy",
    description:
      "# Contains Duplicate\n\nGiven an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.\n\n**Input:**\nSpace separated integers.\n\n**Output:**\n`true` or `false`.",
    starter_code: {
      python: "import sys\nnums = sys.stdin.read().split()\n# Write logic",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    int val;\n    while(cin >> val) {}\n    return 0;\n}",
    },
    test_cases: [
      { input: "1 2 3 1", expected_output: "true", is_hidden: false },
      { input: "1 2 3 4", expected_output: "false", is_hidden: true },
    ],
  },
  {
    title: "Climbing Stairs",
    slug: "climbing-stairs",
    difficulty: "Easy",
    description:
      "# Climbing Stairs\n\nYou are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?\n\n**Input:**\nInteger `n`.\n\n**Output:**\nInteger count of ways.",
    starter_code: {
      python: "import sys\nn = int(sys.stdin.read().strip())\n# Write logic",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    return 0;\n}",
    },
    test_cases: [
      { input: "2", expected_output: "2", is_hidden: false },
      { input: "3", expected_output: "3", is_hidden: true },
    ],
  },
  {
    title: "Best Time to Buy and Sell Stock",
    slug: "best-time-stock",
    difficulty: "Easy",
    description:
      "# Best Time to Buy and Sell Stock\n\nYou are given an array `prices` where `prices[i]` is the price of a given stock on the `i-th` day.\n\n**Input:**\nSpace separated integers.\n\n**Output:**\nMaximum profit.",
    starter_code: {
      python:
        "import sys\nprices = [int(x) for x in sys.stdin.read().split()]\n# Write logic",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n    int val;\n    return 0;\n}",
    },
    test_cases: [
      { input: "7 1 5 3 6 4", expected_output: "5", is_hidden: false },
      { input: "7 6 4 3 1", expected_output: "0", is_hidden: true },
    ],
  },
];

async function seed() {
  console.log("🌱 Starting Seed...");

  for (const p of PROBLEMS) {
    console.log(`Processing: ${p.title}`);

    const { data: problem, error: pError } = await supabase
      .from("problems")
      .insert({
        title: p.title,
        slug: p.slug,
        description: p.description,
        difficulty: p.difficulty,
        starter_code: p.starter_code,
      })
      .select()
      .single();

    if (pError) {
      console.error(`Error inserting ${p.title}:`, pError.message);
      continue;
    }

    const casesWithId = p.test_cases.map((tc) => ({
      ...tc,
      problem_id: problem.id,
    }));

    const { error: tError } = await supabase
      .from("test_cases")
      .insert(casesWithId);

    if (tError) {
      console.error(`Error inserting tests for ${p.title}:`, tError.message);
    }
  }

  console.log("✅ Seed Complete.");
}

seed();
