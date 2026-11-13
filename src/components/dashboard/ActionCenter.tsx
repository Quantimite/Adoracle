'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { initialActionItems } from '@/lib/store';
import { ActionCenterItem } from '@/types';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Wrench, 
  ArrowRight, 
  ShieldCheck, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const ActionCenter: React.FC = () => {
  const [items, setItems] = useState<ActionCenterItem[]>(initialActionItems);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const handleResolve = (id: string) => {
    setResolvingId(id);
    setTimeout(() => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, resolved: true } : item))
      );
      setResolvingId(null);
    }, 600);
  };

  const unresolvedCount = items.filter((i) => !i.resolved).length;

  return (
    <Card className="border-t-4 border-t-status-crimson">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-status-crimson flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>Action Center: 3 Things to Fix Today</span>
              {unresolvedCount > 0 ? (
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-status-crimson text-white">
                  {unresolvedCount} Urgent
                </span>
              ) : (
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-status-emerald text-white">
                  All Clear
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Prioritized system interventions to prevent wasted ad spend, broken attribution, and stalled algorithms
            </CardDescription>
          </div>
        </div>

        {unresolvedCount === 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-status-emerald bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero Revenue Leaks Detected</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {items.map((item) => {
          const isCrimson = item.severity === 'crimson';

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                item.resolved
                  ? 'bg-slate-50/70 border-slate-200 opacity-60'
                  : isCrimson
                  ? 'bg-rose-50/40 border-rose-200/90 shadow-sm'
                  : 'bg-amber-50/40 border-amber-200/90 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      item.resolved
                        ? 'bg-emerald-100 text-status-emerald'
                        : isCrimson
                        ? 'bg-rose-100 text-status-crimson'
                        : 'bg-amber-100 text-status-amber'
                    }`}
                  >
                    {item.resolved ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isCrimson ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-bold ${
                          item.resolved ? 'line-through text-slate-500' : 'text-obsidian'
                        }`}
                      >
                        {item.title}
                      </h4>
                      {item.platform && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700">
                          {item.platform}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slateText mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Action button */}
                <div className="flex-shrink-0">
                  {item.resolved ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-status-emerald py-1 px-3 bg-emerald-50 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolved</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleResolve(item.id)}
                      disabled={resolvingId === item.id}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        isCrimson
                          ? 'bg-status-crimson hover:bg-rose-600 text-white shadow-rose-200'
                          : 'bg-status-amber hover:bg-amber-600 text-white shadow-amber-200'
                      }`}
                    >
                      {resolvingId === item.id ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Applying Fix...</span>
                        </>
                      ) : (
                        <>
                          <Wrench className="w-3.5 h-3.5" />
                          <span>{item.actionLabel}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

