import { redirect } from 'next/navigation';

// The old single-platform studio was replaced by the Campaign Builder.
export default function Page() {
  redirect('/builder');
}
