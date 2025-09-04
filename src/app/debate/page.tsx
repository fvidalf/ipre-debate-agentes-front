import { redirect } from 'next/navigation';

export default function DebatePage() {
  // Redirect old debate route to new editor route
  redirect('/editor');
}
