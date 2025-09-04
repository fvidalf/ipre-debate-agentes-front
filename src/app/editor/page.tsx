import { redirect } from 'next/navigation';

export default function EditorPage() {
  // Redirect to my-debates if no config ID is provided
  redirect('/my-debates');
}
