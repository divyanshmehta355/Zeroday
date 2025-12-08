import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ProblemCardProps {
  id: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export function ProblemCard({ title, slug, difficulty }: ProblemCardProps) {
  const difficultyColor = {
    Easy: "text-green-400 bg-green-400/10",
    Medium: "text-yellow-400 bg-yellow-400/10",
    Hard: "text-red-400 bg-red-400/10",
  };

  return (
    <Link
      href={`/problems/${slug}`}
      className="group block p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-600 transition-all hover:shadow-2xl hover:shadow-purple-900/10"
    >
      <div className="flex justify-between items-start">
        <div>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${difficultyColor[difficulty]}`}
          >
            {difficulty}
          </span>
          <h3 className="text-xl font-bold text-gray-100 group-hover:text-white mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-500">Algorithms • Data Structures</p>
        </div>
        <div className="p-2 rounded-full bg-gray-800 group-hover:bg-white group-hover:text-black transition-colors">
          <ArrowRight size={20} />
        </div>
      </div>
    </Link>
  );
}
