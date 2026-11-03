import { redirect } from 'next/navigation';

export default function StatsRedirect() {
  redirect('/me?tab=data');
}
