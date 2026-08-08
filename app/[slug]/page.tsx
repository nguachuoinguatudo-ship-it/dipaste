import RepoView from "./RepoView";

export default async function RepoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <RepoView slug={slug} />;
}
