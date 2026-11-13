import { NextRequest, NextResponse } from 'next/server';
import { calculateChannelMix } from '@/lib/ai/budgetEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = calculateChannelMix({
      buyerType: body.buyerType || 'B2C',
      intent: body.intent || 'Scrolling',
      pricePoint: body.pricePoint || 'Low',
      monthlyBudget: body.monthlyBudget || 6000,
    });

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

