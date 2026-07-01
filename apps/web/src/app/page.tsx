import { redirect } from 'next/navigation';

export default function Home() {
  // For now, immediately redirect to our newly built onboarding flow
  redirect('/onboarding');
}
