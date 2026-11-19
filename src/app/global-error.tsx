'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App global error:', error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-[#F5F7F6] dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-800 dark:text-slate-100 font-sans">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {error?.message || 'An unexpected error occurred while rendering the page.'}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1B6B48] hover:bg-[#114B32] text-white text-xs font-bold transition-all shadow-md"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}

