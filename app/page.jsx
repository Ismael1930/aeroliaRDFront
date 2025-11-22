import { redirect } from 'next/navigation';

export default function Page() {
  // Redirect root to the home page
  redirect('/home');
}
