import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listSources } from "@/features/sources/queries";
import WorkspaceClient from "./WorkspaceClient";

export default async function WorkspacePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select(
      `
      id,
      name,
      description,
      created_at,
      updated_at,
      company:companies(name, ticker),
      sources(count),
      queries(count)
      `
    )
    .eq("id", id)
    .single();

  if (error || !workspace) {
    notFound();
  }

  const sources = await listSources(id);

  const enriched = {
    ...workspace,
    sourceCount: workspace.sources?.[0]?.count ?? 0,
    queryCount: workspace.queries?.[0]?.count ?? 0,
  };

  return <WorkspaceClient workspace={enriched} sources={sources} />;
}
