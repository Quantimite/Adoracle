import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F8FB] dark:bg-[#0B1120] text-obsidianBlack dark:text-slate-100 p-6 text-center">
      <h1 className="text-6xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
