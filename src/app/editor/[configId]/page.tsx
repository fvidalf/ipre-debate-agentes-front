import { EditorLayout } from '@/views/editor';

interface EditorConfigPageProps {
  params: Promise<{
    configId: string;
  }>;
}

export default async function EditorConfigPage({ params }: EditorConfigPageProps) {
  const { configId } = await params;
  return <EditorLayout key={configId} configId={configId} />;
}
