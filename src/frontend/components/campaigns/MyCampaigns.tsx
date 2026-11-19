'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Rocket, Settings2, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PlatformBadge } from '@/frontend/components/common/PlatformBadge';
import { PlatformId, SPECS } from '@/shared/adspec';

interface Row { id: string; platform: PlatformId; name: string; status: string; dailyBudget: number; launchStatus?: string; launchMessage?: string | null }

/** Campaigns created in Adoracle's builder. Each one opens the manager (ad sets and ads can be edited separately). */
export function MyCampaigns() {
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    fetch('/api/campaigns', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setRows((d.campaigns || []).filter((c: Row) => c.launchStatus)))
      .catch(() => setRows([]));
  }, []);

  if (rows === null) return null;
  return (
    <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Your campaigns</h2>
          <p className="text-xs text-slate-500">Created in Adoracle. Open one to edit, pause or duplicate each ad set and each ad separately.</p>
        </div>
        <Link href="/builder" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#153E9E] text-white text-xs font-bold hover:brightness-110"><Rocket size={13} /> New campaign</Link>
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-slate-500 py-4">No campaigns yet. Create your first one with the builder and it will appear here.</p>
      ) : (
        <ul className="grid md:grid-cols-2 gap-2.5">
          {rows.map((c) => (
            <li key={c.id}>
              <Link href={`/campaigns/${c.id}`} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 hover:border-[#2A6FE0] transition-colors">
                <PlatformBadge id={c.platform} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{c.name}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    {SPECS[c.platform]?.short} · ${c.dailyBudget}/day · {c.status}
                    {c.launchStatus === 'PUSHED' && <span className="inline-flex items-center gap-1 text-blue-700"><CheckCircle2 size={10} /> on platform</span>}
                    {c.launchStatus === 'QUEUED' && <span className="inline-flex items-center gap-1 text-amber-700"><Clock size={10} /> draft</span>}
                    {c.launchStatus === 'FAILED' && <span className="inline-flex items-center gap-1 text-rose-700"><AlertTriangle size={10} /> failed</span>}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2A6FE0]"><Settings2 size={13} /> Manage</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
