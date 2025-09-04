import { DebateAppLayout } from '@/views/debate';

interface EditorConfigPageProps {
  params: Promise<{
    configId: string;
  }>;
}

export default async function EditorConfigPage({ params }: EditorConfigPageProps) {
  const { configId } = await params;
  return <DebateAppLayout key={configId} configId={configId} />;
}
