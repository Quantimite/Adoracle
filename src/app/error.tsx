'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center text-xl font-bold">
        !
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Unable to display this view</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
        {error?.message || 'An error occurred while loading this section.'}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="px-5 py-2.5 rounded-xl bg-[#1B6B48] hover:bg-[#114B32] text-white text-xs font-bold transition-all shadow-md"
      >
        Retry
      </button>
    </div>
  );
}

