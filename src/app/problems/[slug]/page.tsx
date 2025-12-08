import { supabase } from "@/lib/supabase";
import { Workspace } from "@/components/Workspace";
import { Navbar } from "@/components/Navbar";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface ProblemPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const { slug } = await params; 

  const { data: problem } = await supabase
    .from("problems")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!problem) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Workspace problem={problem} />
    </div>
  );
}
