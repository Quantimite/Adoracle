'use client';

import React, { useState, useEffect } from 'react';
import { initialLessons } from '@/lib/store';
import { Sparkles, Award, Zap, TrendingUp, Clock, BrainCircuit } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const chartData = [
  { day: 'Day 1', predicted: 36.0, actual: 42.5 },
  { day: 'Day 3', predicted: 32.5, actual: 35.8 },
  { day: 'Day 5', predicted: 28.0, actual: 29.4 },
  { day: 'Day 7', predicted: 25.5, actual: 26.1 },
  { day: 'Day 10', predicted: 23.0, actual: 23.4 },
  { day: 'Day 14', predicted: 21.5, actual: 21.8 },
  { day: 'Day 21', predicted: 19.8, actual: 19.9 },
  { day: 'Day 30', predicted: 18.2, actual: 18.25 },
];

export default function IntelligencePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Intelligence</h1>
          <p className="text-slate-500 mt-1 text-sm">Your AI is learning and improving every day</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 rounded-xl self-start sm:self-auto">
          <BrainCircuit className="w-4 h-4 text-sky-400" />
          <span className="text-sm font-bold text-white">94.2% Accuracy</span>
        </div>
      </div>

      {/* Accuracy stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        {[
          { label: 'Day 1 Error', value: '18.1%', sub: 'Cold start', color: 'text-red-500' },
          { label: 'Day 7 Error', value: '2.3%', sub: 'Learning phase', color: 'text-amber-500' },
          { label: 'Day 30 Error', value: '0.2%', sub: 'Near-perfect', color: 'text-emerald-500' },
          { label: 'Overall Reliability', value: '94.2%', sub: 'On $50k+ spend', color: 'text-sky-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <p className="text-xs text-slate-400 font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-base font-bold text-slate-900">Cost Per Customer — AI Prediction vs Reality</h2>
          <p className="text-sm text-slate-400 mt-1">Watch the AI converge over 30 days</p>
        </div>
        {mounted ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} unit="$" />
              <Tooltip
                formatter={(v: any) => [`$${Number(v).toFixed(2)}`]}
                contentStyle={{ background: '#1E293B', border: 'none', borderRadius: '12px', color: '#F8FAFC', fontSize: '12px' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="predicted" name="AI Prediction" stroke="#38BDF8" strokeWidth={2.5} dot={{ r: 4, fill: '#38BDF8' }} />
              <Line type="monotone" dataKey="actual" name="Actual CPA" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: '#10B981' }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm">Loading chart...</div>
        )}
      </div>

      {/* Knowledge cards */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4">What the AI has learned about your business</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initialLessons.map(lesson => (
            <div key={lesson.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900">{lesson.category}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      lesson.confidence === 'High Confidence'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-purple-50 text-purple-700'
                    }`}>
                      {lesson.confidence}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">{lesson.description}</p>

                  {lesson.impactTag && (
                    <div className="mt-3 flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg">
                        <Zap className="w-3 h-3" />
                        {lesson.impactTag}
                      </span>
                      {lesson.metricsLift && (
                        <span className="text-xs text-slate-400">{lesson.metricsLift}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

